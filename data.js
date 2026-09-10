// data.js - Todos os dados do sistema em um só lugar

const viaturas = [
  { numero: 'PM-001', placa: 'ABC1234', modelo: 'Toyota Hilux', ano: 2022, km: 45000, unidade: 'ROTAM', status: 'Em operação' },
  { numero: 'PM-002', placa: 'DEF5678', modelo: 'Ford Ranger', ano: 2021, km: 62000, unidade: 'RADU', status: 'Em manutenção' },
  { numero: 'PM-003', placa: 'GHI9012', modelo: 'Chevrolet S10', ano: 2023, km: 12000, unidade: 'ROTAM', status: 'Em operação' },
  { numero: 'PM-004', placa: 'JKL3456', modelo: 'Honda CRV', ano: 2020, km: 85000, unidade: 'COMANDO', status: 'Indisponível' },
  { numero: 'PM-005', placa: 'MNO7890', modelo: 'Volkswagen Amarok', ano: 2022, km: 55000, unidade: 'RADU', status: 'Em operação' }
];

const ordensServico = [
  { numero: 'OS-001', viatura: 'PM-001', data: '15/06/2024', responsavel: 'João Silva', problema: 'Freios desgastados', custo: 350.00, status: 'Finalizada' },
  { numero: 'OS-002', viatura: 'PM-002', data: '10/06/2024', responsavel: 'Maria Santos', problema: 'Troca de óleo', custo: 150.00, status: 'Finalizada' },
  { numero: 'OS-003', viatura: 'PM-003', data: '12/06/2024', responsavel: 'Carlos Oliveira', problema: 'Alinhamento necessário', custo: 200.00, status: 'Finalizada' }
];

const historicoManutencao = [
  { descricao: 'Freios desgastados', data: '15/06/2024', custo: 350.00, tempoParada: 4 },
  { descricao: 'Troca de óleo', data: '10/06/2024', custo: 150.00, tempoParada: 1.5 },
  { descricao: 'Alinhamento necessário', data: '12/06/2024', custo: 200.00, tempoParada: 2 }
];

// Manutenções por mês (para o gráfico)
const manutencoesPorMes = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  data: [3, 5, 2, 4, 6, 3]
};
