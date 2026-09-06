import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Viaturas = () => {
  const [viaturas, setViaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ numero: '', placa: '', modelo: '', ano: 2024, quilometragem: 0, unidade: '', status: 'Em operação' });

  useEffect(() => {
    fetchViaturas();
  }, []);

  const fetchViaturas = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/viaturas');
      setViaturas(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/viaturas', formData);
      setFormData({ numero: '', placa: '', modelo: '', ano: 2024, quilometragem: 0, unidade: '', status: 'Em operação' });
      setShowForm(false);
      fetchViaturas();
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const viaturasFiltradas = viaturas.filter(v => v.numero.toLowerCase().includes(filtro.toLowerCase()) || v.placa.toLowerCase().includes(filtro.toLowerCase()));

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Cadastro de Viaturas</h1>
        <button onClick={() => setShowForm(!showForm)}><i className="fas fa-plus"></i> Nova Viatura</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Adicionar Nova Viatura</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div><label>Número</label><input type="text" placeholder="PM-001" value={formData.numero} onChange={(e) => setFormData({...formData, numero: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }} /></div>
              <div><label>Placa</label><input type="text" placeholder="ABC1234" value={formData.placa} onChange={(e) => setFormData({...formData, placa: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }} /></div>
              <div><label>Modelo</label><input type="text" placeholder="Toyota Hilux" value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }} /></div>
              <div><label>Ano</label><input type="number" value={formData.ano} onChange={(e) => setFormData({...formData, ano: parseInt(e.target.value)})} style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }} /></div>
            </div>
            <button type="submit">Salvar Viatura</button>
            <button type="button" className="secondary" onClick={() => setShowForm(false)} style={{ marginLeft: '10px' }}>Cancelar</button>
          </form>
        </div>
      )}
      <div className="card" style={{ marginBottom: '20px' }}><input type="text" placeholder="🔍 Filtrar..." value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} /></div>
      <div className="card">
        <table>
          <thead><tr><th>Número</th><th>Placa</th><th>Modelo</th><th>Ano</th><th>KM</th><th>Unidade</th><th>Status</th></tr></thead>
          <tbody>
            {viaturasFiltradas.map(v => (
              <tr key={v.id}>
                <td><strong>{v.numero}</strong></td><td>{v.placa}</td><td>{v.modelo}</td><td>{v.ano}</td><td>{v.quilometragem} km</td><td>{v.unidade}</td>
                <td><span className={`badge ${v.status === 'Em operação' ? 'success' : v.status === 'Em manutenção' ? 'warning' : 'danger'}`}>{v.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Viaturas;
