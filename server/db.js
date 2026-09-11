const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'frota.db');
fs.mkdirSync(path.dirname(path.resolve(DB_PATH)), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS viaturas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero TEXT NOT NULL,
  placa TEXT NOT NULL UNIQUE,
  modelo TEXT,
  ano INTEGER,
  tipo TEXT,
  quilometragem INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Operacional',
  unidade TEXT,
  proxima_manutencao_km INTEGER,
  proxima_manutencao_data TEXT,
  endereco TEXT,
  endereco_formatado TEXT,
  latitude REAL,
  longitude REAL,
  observacoes TEXT,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ordens_servico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero TEXT NOT NULL,
  viatura_id INTEGER NOT NULL,
  placa TEXT,
  tipo TEXT,
  data TEXT,
  descricao TEXT,
  pecas TEXT,
  quilometragem INTEGER DEFAULT 0,
  responsavel TEXT,
  custo REAL DEFAULT 0,
  tempo_parada REAL DEFAULT 0,
  status TEXT DEFAULT 'Agendada',
  observacoes TEXT,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (viatura_id) REFERENCES viaturas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ordens_viatura ON ordens_servico(viatura_id);
CREATE INDEX IF NOT EXISTS idx_ordens_data ON ordens_servico(data);
`);

module.exports = db;
