import React from 'react';

const Historico = () => {
  const historicos = [
    { data: '2024-06-15', descricao: 'Revisão de freios', pecas: ['Pastilhas de freio', 'Líquido de freio'], custo: 350.00, responsavel: 'João Silva', tempoParada: 4 },
    { data: '2024-06-10', descricao: 'Troca de óleo', pecas: ['Óleo SAE 40', 'Filtro de óleo'], custo: 150.00, responsavel: 'Maria Santos', tempoParada: 1.5 },
    { data: '2024-06-05', descricao: 'Alinhamento', pecas: ['Balanceamento dos pneus'], custo: 200.00, responsavel: 'Carlos Oliveira', tempoParada: 2 }
  ];

  const custoTotal = historicos.reduce((acc, h) => acc + h.custo, 0);
  const tempoTotal = historicos.reduce((acc, h) => acc + h.tempoParada, 0);

  return (
    <div>
      <h1 style={{ marginBottom: '20px', fontSize: '28px', fontWeight: '700' }}>Histórico de Manutenção</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div className="card">
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>CUSTO TOTAL</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#1B4F72' }}>R$ {custoTotal.toFixed(2)}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>Em {historicos.length} manutenções</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>TEMPO DE PARADA</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#F39C12' }}>{tempoTotal.toFixed(1)} h</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>Horas indisponíveis</div>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '30px', top: 0, bottom: 0, width: '2px', backgroundColor: '#1B4F72' }} />
        {historicos.map((item, i) => (
          <div key={i} style={{ marginBottom: '30px', marginLeft: '80px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-55px', top: '0', width: '20px', height: '20px', backgroundColor: '#1B4F72', border: '3px solid white', borderRadius: '50%' }} />
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <div><h4 style={{ margin: '0 0 5px 0' }}>{item.descricao}</h4><small style={{ color: '#999' }}>{new Date(item.data).toLocaleDateString('pt-BR')}</small></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '18px', fontWeight: '700', color: '#2ECC71' }}>R$ {item.custo.toFixed(2)}</div><small style={{ color: '#999' }}>{item.tempoParada}h</small></div>
              </div>
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}><strong>Peças:</strong><ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '14px' }}>{item.pecas.map((p, idx) => <li key={idx}>{p}</li>)}</ul></div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}><strong>Responsável:</strong> {item.responsavel}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Historico;
