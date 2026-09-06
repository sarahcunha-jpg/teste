const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('client/public'));

// Dados simulados
let viaturas = [
  { id: 1, numero: 'PM-001', placa: 'ABC1234', modelo: 'Toyota Hilux', ano: 2022, quilometragem: 45000, unidade: 'ROTAM', status: 'Em operação', ultimaRevisao: '2024-06-15', proximaRevisao: '2024-07-15' },
  { id: 2, numero: 'PM-002', placa: 'DEF5678', modelo: 'Ford Ranger', ano: 2021, quilometragem: 62000, unidade: 'RADU', status: 'Em manutenção', ultimaRevisao: '2024-05-20', proximaRevisao: '2024-07-20' },
  { id: 3, numero: 'PM-003', placa: 'GHI9012', modelo: 'Chevrolet S10', ano: 2023, quilometragem: 12000, unidade: 'ROTAM', status: 'Em operação', ultimaRevisao: '2024-06-10', proximaRevisao: '2024-08-10' },
  { id: 4, numero: 'PM-004', placa: 'JKL3456', modelo: 'Honda CRV', ano: 2020, quilometragem: 85000, unidade: 'COMANDO', status: 'Indisponível', ultimaRevisao: '2024-04-01', proximaRevisao: '2024-07-01' },
  { id: 5, numero: 'PM-005', placa: 'MNO7890', modelo: 'Volkswagen Amarok', ano: 2022, quilometragem: 55000, unidade: 'RADU', status: 'Em operação', ultimaRevisao: '2024-06-01', proximaRevisao: '2024-07-01' }
];

let ordensServico = [
  { id: 1, numero: 'OS-001', viaturaId: 1, data: '2024-06-15', problemaIdentificado: 'Freios desgastados', servicoExecutado: 'Troca de pastilhas de freio', responsavel: 'João Silva', pecasUtilizadas: ['Pastilhas de freio', 'Líquido de freio'], custo: 350, tempoParada: 4, status: 'Finalizada' },
  { id: 2, numero: 'OS-002', viaturaId: 2, data: '2024-06-10', problemaIdentificado: 'Troca de óleo', servicoExecutado: 'Troca de óleo e filtro', responsavel: 'Maria Santos', pecasUtilizadas: ['Óleo SAE 40', 'Filtro de óleo'], custo: 150, tempoParada: 1.5, status: 'Finalizada' },
  { id: 3, numero: 'OS-003', viaturaId: 3, data: '2024-06-12', problemaIdentificado: 'Alinhamento necessário', servicoExecutado: 'Alinhamento e balanceamento', responsavel: 'Carlos Oliveira', pecasUtilizadas: ['Balanceamento dos pneus'], custo: 200, tempoParada: 2, status: 'Finalizada' }
];

let localizacoes = {};
viaturas.forEach((v, i) => {
  localizacoes[v.id] = {
    id: v.id,
    numero: v.numero,
    latitude: -26.92 + (i * 0.01),
    longitude: -49.07 + (i * 0.01),
    velocidade: Math.random() * 80,
    motorLigado: v.status === 'Em operação',
    combustivel: Math.random() * 100,
    timestamp: new Date()
  };
});

// Routes
app.get('/api/viaturas', (req, res) => {
  res.json(viaturas);
});

app.get('/api/viaturas/:id', (req, res) => {
  const viatura = viaturas.find(v => v.id == req.params.id);
  if (!viatura) return res.status(404).json({ erro: 'Viatura não encontrada' });
  res.json(viatura);
});

app.post('/api/viaturas', (req, res) => {
  const novaViatura = {
    id: Math.max(...viaturas.map(v => v.id)) + 1,
    ...req.body
  };
  viaturas.push(novaViatura);
  res.status(201).json(novaViatura);
});

app.put('/api/viaturas/:id', (req, res) => {
  const viatura = viaturas.find(v => v.id == req.params.id);
  if (!viatura) return res.status(404).json({ erro: 'Viatura não encontrada' });
  Object.assign(viatura, req.body);
  res.json(viatura);
});

app.get('/api/localizacoes', (req, res) => {
  res.json(Object.values(localizacoes));
});

app.get('/api/ordens-servico', (req, res) => {
  res.json(ordensServico);
});

app.post('/api/ordens-servico', (req, res) => {
  const novaOrdem = {
    id: Math.max(...ordensServico.map(o => o.id), 0) + 1,
    ...req.body
  };
  ordensServico.push(novaOrdem);
  io.emit('nova-ordem', novaOrdem);
  res.status(201).json(novaOrdem);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('✓ Cliente conectado:', socket.id);

  socket.on('atualizar-localizacao', (dados) => {
    localizacoes[dados.id] = {
      ...dados,
      timestamp: new Date()
    };
    io.emit('localizacao-atualizada', localizacoes[dados.id]);
  });

  socket.on('disconnect', () => {
    console.log('✗ Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
