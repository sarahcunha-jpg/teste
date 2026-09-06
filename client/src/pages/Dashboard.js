import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [viaturas, setViaturas] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [v, o] = await Promise.all([
        axios.get('http://localhost:5000/api/viaturas'),
        axios.get('http://localhost:5000/api/ordens-servico')
      ]);
      setViaturas(v.data);
      setOrdens(o.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const emOperacao = viaturas.filter(v => v.status === 'Em operação').length;
  const emManutencao = viaturas.filter(v => v.status === 'Em manutenção').length;
  const indisponivel = viaturas.filter(v => v.status === 'Indisponível').length;

  const chartData = [
    { mes: 'Jan', manutencoes: 12, custos: 3500 },
    { mes: 'Fev', manutencoes: 19, custos: 5200 },
    { mes: 'Mar', manutencoes: 15, custos: 4100 },
    { mes: 'Abr', manutencoes: 22, custos: 6300 },
    { mes: 'Mai', manutencoes: 18, custos: 5100 },
    { mes: 'Jun', manutencoes: 25, custos: 7200 }
  ];

  const piData = [
    { name: 'Em operação', value: emOperacao },
    { name: 'Em manutenção', value: emManutencao },
    { name: 'Indisponível', value: indisponivel }
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '30px', fontSize: '28px', fontWeight: '700' }}>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card"><div style={{ fontSize: '32px', fontWeight: '700', color: '#1B4F72' }}>{viaturas.length}</div><div className="stat-card-label">Total de Viaturas</div></div>
        <div className="stat-card" style={{ borderLeftColor: '#2ECC71' }}><div style={{ fontSize: '32px', fontWeight: '700', color: '#2ECC71' }}>{emOperacao}</div><div className="stat-card-label">Em Operação</div></div>
        <div className="stat-card" style={{ borderLeftColor: '#F39C12' }}><div style={{ fontSize: '32px', fontWeight: '700', color: '#F39C12' }}>{emManutencao}</div><div className="stat-card-label">Em Manutenção</div></div>
        <div className="stat-card" style={{ borderLeftColor: '#E74C3C' }}><div style={{ fontSize: '32px', fontWeight: '700', color: '#E74C3C' }}>{indisponivel}</div><div className="stat-card-label">Indisponível</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card"><h3>Manutenções por Mês</h3><ResponsiveContainer width="100%" height={300}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis /><Tooltip /><Legend /><Bar dataKey="manutencoes" fill="#1B4F72" /></BarChart></ResponsiveContainer></div>
        <div className="card"><h3>Status das Viaturas</h3><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={piData} cx="50%" cy="50%" labelLine={false} label outerRadius={100} fill="#8884d8" dataKey="value"><Cell fill="#2ECC71" /><Cell fill="#F39C12" /><Cell fill="#E74C3C" /></Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      </div>
    </div>
  );
};

export default Dashboard;
