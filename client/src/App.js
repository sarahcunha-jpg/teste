import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Viaturas from './pages/Viaturas';
import Rastreamento from './pages/Rastreamento';
import OrdenServico from './pages/OrdenServico';
import Historico from './pages/Historico';
import './index.css';

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home', path: '/' },
    { id: 'viaturas', label: 'Viaturas', icon: 'fas fa-car', path: '/viaturas' },
    { id: 'ordens', label: 'Ordens de Serviço', icon: 'fas fa-list', path: '/ordens' },
    { id: 'historico', label: 'Histórico', icon: 'fas fa-history', path: '/historico' },
    { id: 'rastreamento', label: 'Rastreamento', icon: 'fas fa-map-marker-alt', path: '/rastreamento' }
  ];

  return (
    <Router>
      <div className="container">
        <aside className="sidebar">
          <div className="sidebar-logo"><i className="fas fa-shield-alt"></i> <span>Frota PM</span></div>
          <ul className="sidebar-menu">
            {menuItems.map(item => (
              <li key={item.id}>
                <Link to={item.path} className={activeMenu === item.id ? 'active' : ''} onClick={() => setActiveMenu(item.id)}>
                  <i className={item.icon}></i> <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <main className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <nav className="navbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Frota PM - Blumenau</h1>
            </div>
            <div className="navbar-search"><input type="text" placeholder="🔍 Pesquisar viaturas..." /></div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <i className="fas fa-bell" style={{ cursor: 'pointer' }}></i>
              <i className="fas fa-cog" style={{ cursor: 'pointer' }}></i>
            </div>
          </nav>
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/viaturas" element={<Viaturas />} />
              <Route path="/rastreamento" element={<Rastreamento />} />
              <Route path="/ordens" element={<OrdenServico />} />
              <Route path="/historico" element={<Historico />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
