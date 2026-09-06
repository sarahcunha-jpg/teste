import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Rastreamento = () => {
  const [viaturas, setViaturas] = useState([]);
  const [localizacoes, setLocalizacoes] = useState([]);
  const [selectedViatura, setSelectedViatura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState('osm');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [v, l] = await Promise.all([
        axios.get('http://localhost:5000/api/viaturas'),
        axios.get('http://localhost:5000/api/localizacoes').catch(() => ({ data: [] }))
      ]);
      setViaturas(v.data);
      setLocalizacoes(l.data);
      if (!selectedViatura && v.data.length > 0) setSelectedViatura(v.data[0].id);
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setLoading(false);
    }
  };

  const getCoordinates = (index) => ({
    latitude: -26.92 + (index * 0.01),
    longitude: -49.07 + (index * 0.01)
  });

  const createIcon = (status) => L.divIcon({
    html: `<div style="background-color: ${status === 'Em operação' ? '#2ECC71' : status === 'Em manutenção' ? '#F39C12' : '#E74C3C'}; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">🚔</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <h1 style={{ marginBottom: '20px', fontSize: '28px', fontWeight: '700' }}>Rastreamento em Tempo Real</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '75% 1fr', gap: '20px', height: 'calc(100vh - 200px)' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <MapContainer center={[-26.92, -49.07]} zoom={13} style={{ height: '100%', width: '100%' }}>
            {mapType === 'satellite' && <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="&copy; Esri" />}
            {mapType === 'osm' && <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />}
            {mapType === 'terrain' && <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" attribution="&copy; OpenTopoMap" />}
            {viaturas.map((v, i) => {
              const coords = getCoordinates(i);
              return <Marker key={v.id} position={[coords.latitude, coords.longitude]} icon={createIcon(v.status)} onClick={() => setSelectedViatura(v.id)}><Popup><div><strong>{v.numero}</strong><br/>Placa: {v.placa}<br/>Status: {v.status}</div></Popup></Marker>;
            })}
          </MapContainer>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
          <div className="card">
            <h4 style={{ marginBottom: '10px' }}>Camadas</h4>
            <button onClick={() => setMapType('osm')} style={{ width: '100%', marginBottom: '8px', backgroundColor: mapType === 'osm' ? '#1B4F72' : '#e0e0e0', color: mapType === 'osm' ? 'white' : '#333' }}>🗺️ Rua</button>
            <button onClick={() => setMapType('satellite')} style={{ width: '100%', marginBottom: '8px', backgroundColor: mapType === 'satellite' ? '#1B4F72' : '#e0e0e0', color: mapType === 'satellite' ? 'white' : '#333' }}>📡 Satélite</button>
            <button onClick={() => setMapType('terrain')} style={{ width: '100%', backgroundColor: mapType === 'terrain' ? '#1B4F72' : '#e0e0e0', color: mapType === 'terrain' ? 'white' : '#333' }}>🏔️ Terreno</button>
          </div>
          <div className="card">
            <h4 style={{ marginBottom: '10px' }}>Viaturas Online</h4>
            {viaturas.map(v => (
              <div key={v.id} style={{ padding: '10px', backgroundColor: selectedViatura === v.id ? '#e8f8f5' : '#f9f9f9', borderLeft: `4px solid ${v.status === 'Em operação' ? '#2ECC71' : v.status === 'Em manutenção' ? '#F39C12' : '#E74C3C'}`, borderRadius: '4px', marginBottom: '8px', cursor: 'pointer' }} onClick={() => setSelectedViatura(v.id)}>
                <strong>{v.numero}</strong>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Placa: {v.placa}<br/>Modelo: {v.modelo}<br/>KM: {v.quilometragem}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rastreamento;
