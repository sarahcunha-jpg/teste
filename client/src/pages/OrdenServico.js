import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrdenServico = () => {
  const [ordens, setOrdens] = useState([]);
  const [viaturas, setViaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ numero: `OS-${Date.now()}`, viaturaId: '', data: new Date().toISOString().split('T')[0], problemaIdentificado: '', servicoExecutado: '', responsavel: '', pecasUtilizadas: '', custo: 0, tempoParada: 0, status: 'Aberta' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [o, v] = await Promise.all([
        axios.get('http://localhost:5000/api/ordens-servico'),
        axios.get('http://localhost:5000/api/viaturas')
      ]);
      setOrdens(o.data);
      setViaturas(v.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/ordens-servico', { ...formData, pecasUtilizadas: formData.pecasUtilizadas.split(',').map(p => p.trim()), data: new Date(formData.data) });
      setFormData({ numero: `OS-${Date.now()}`, viaturaId: '', data: new Date().toISOString().split('T')[0], problemaIdentificado: '', servicoExecutado: '', responsavel: '', pecasUtilizadas: '', custo: 0, tempoParada: 0, status: 'Aberta' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Ordens de Serviço</h1>
        <button onClick={() => setShowForm(!showForm)}><i className="fas fa-plus"></i> Nova Ordem</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Nova Ordem de Serviço</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div><label>Número OS</label><input type="text" value={formData.numero} disabled style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f0f0f0' }} /></div>
              <div><label>Viatura</label><select value={formData.viaturaId} onChange={(e) => setFormData({...formData, viaturaId: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}><option value="">Selecione</option>{viaturas.map(v => <option key={v.id} value={v.id}>{v.numero} - {v.placa}</option>)}</select></div>
              <div><label>Data</label><input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }} /></div>
              <div><label>Responsável</label><input type="text" value={formData.responsavel} onChange={(e) => setFormData({...formData, responsavel: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }} /></div>
            </div>
            <button type="submit">Salvar Ordem</button>
            <button type="button" className="secondary" onClick={() => setShowForm(false)} style={{ marginLeft: '10px' }}>Cancelar</button>
          </form>
        </div>
      )}
      <div className="card">
        <table>
          <thead><tr><th>Número</th><th>Viatura</th><th>Data</th><th>Responsável</th><th>Problema</th><th>Custo</th><th>Status</th></tr></thead>
          <tbody>
            {ordens.map(o => (
              <tr key={o.id}>
                <td><strong>{o.numero}</strong></td><td>{viaturas.find(v => v.id == o.viaturaId)?.numero || '-'}</td><td>{new Date(o.data).toLocaleDateString('pt-BR')}</td><td>{o.responsavel}</td><td>{o.problemaIdentificado.substring(0, 20)}...</td><td>R$ {o.custo?.toFixed(2)}</td>
                <td><span style={{ display: 'inline-block', backgroundColor: o.status === 'Finalizada' ? '#e8f8f5' : o.status === 'Em execução' ? '#fef5e7' : '#e3f2fd', color: o.status === 'Finalizada' ? '#27ae60' : o.status === 'Em execução' ? '#e67e22' : '#1976d2', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdenServico;
