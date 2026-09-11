require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configurável (padrão: libera tudo se não definido)
const allowed = (process.env.CORS_ORIGIN || '*').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes('*') || allowed.includes(origin)) return cb(null, true);
    cb(new Error('Origem não permitida: ' + origin));
  }
}));
app.use(express.json({ limit: '2mb' }));

// Converte snake_case → camelCase nas respostas
const toCamel = (row) => {
  if (!row) return row;
  const out = {};
  for (const k in row) {
    out[k.replace(/_([a-z])/g, (_, l) => l.toUpperCase())] = row[k];
  }
  return out;
};

// Converte camelCase → snake_case ao gravar
const VIATURA_COLS = {
  numero: 'numero', placa: 'placa', modelo: 'modelo', ano: 'ano', tipo: 'tipo',
  quilometragem: 'quilometragem', status: 'status', unidade: 'unidade',
  proximaManutencaoKm: 'proxima_manutencao_km', proximaManutencaoData: 'proxima_manutencao_data',
  endereco: 'endereco', enderecoFormatado: 'endereco_formatado',
  latitude: 'latitude', longitude: 'longitude', observacoes: 'observacoes'
};
const ORDEM_COLS = {
  viaturaId: 'viatura_id', placa: 'placa', tipo: 'tipo', data: 'data',
  descricao: 'descricao', pecas: 'pecas', quilometragem: 'quilometragem',
  responsavel: 'responsavel', custo: 'custo', tempoParada: 'tempo_parada',
  status: 'status', observacoes: 'observacoes'
};

// ================= VIATURAS =================
app.get('/api/viaturas', (req, res) => {
  const rows = db.prepare('SELECT * FROM viaturas ORDER BY id DESC').all();
  res.json(rows.map(toCamel));
});

app.get('/api/viaturas/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM viaturas WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Viatura não encontrada' });
  res.json(toCamel(row));
});

function upsertViatura(id, body) {
  const fields = Object.keys(VIATURA_COLS).filter(k => body[k] !== undefined);
  const values = fields.map(k => body[k]);
  if (id) {
    if (!fields.length) return db.prepare('SELECT * FROM viaturas WHERE id = ?').get(id);
    const setSql = fields.map(k => `${VIATURA_COLS[k]}=?`).join(', ');
    db.prepare(`UPDATE viaturas SET ${setSql}, atualizado_em=CURRENT_TIMESTAMP WHERE id=?`)
      .run(...values, id);
    return db.prepare('SELECT * FROM viaturas WHERE id = ?').get(id);
  }
  const cols = fields.map(k => VIATURA_COLS[k]).join(', ');
  const placeholders = fields.map(() => '?').join(', ');
  const info = db.prepare(`INSERT INTO viaturas (${cols}) VALUES (${placeholders})`).run(...values);
  return db.prepare('SELECT * FROM viaturas WHERE id = ?').get(info.lastInsertRowid);
}

app.post('/api/viaturas', (req, res) => {
  try {
    const v = upsertViatura(null, req.body);
    res.status(201).json(toCamel(v));
  } catch (e) {
    if (String(e.code).includes('SQLITE_CONSTRAINT'))
      return res.status(409).json({ error: 'Placa já cadastrada' });
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/viaturas/:id', (req, res) => {
  const exists = db.prepare('SELECT id FROM viaturas WHERE id = ?').get(req.params.id);
  if (!exists) return res.status(404).json({ error: 'Viatura não encontrada' });
  try {
    const v = upsertViatura(Number(req.params.id), req.body);
    res.json(toCamel(v));
  } catch (e) {
    if (String(e.code).includes('SQLITE_CONSTRAINT'))
      return res.status(409).json({ error: 'Placa já cadastrada' });
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/viaturas/:id', (req, res) => {
  const info = db.prepare('DELETE FROM viaturas WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Viatura não encontrada' });
  res.json({ ok: true });
});

// ================= ORDENS =================
function decodeOrdem(row) {
  const o = toCamel(row);
  if (o.pecas) o.pecas = String(o.pecas).split(',').map(s => s.trim()).filter(Boolean);
  else o.pecas = [];
  return o;
}

app.get('/api/ordens', (req, res) => {
  const rows = db.prepare('SELECT * FROM ordens_servico ORDER BY data DESC, id DESC').all();
  res.json(rows.map(decodeOrdem));
});

app.get('/api/ordens/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM ordens_servico WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Ordem não encontrada' });
  res.json(decodeOrdem(row));
});

function nextOrdemNumero() {
  const c = db.prepare('SELECT COUNT(*) AS c FROM ordens_servico').get().c;
  return `OS-${String(c + 1).padStart(3, '0')}`;
}

function upsertOrdem(id, body) {
  const b = { ...body };
  if (Array.isArray(b.pecas)) b.pecas = b.pecas.join(', ');
  const fields = Object.keys(ORDEM_COLS).filter(k => b[k] !== undefined);
  const values = fields.map(k => b[k]);
  if (id) {
    const setSql = fields.map(k => `${ORDEM_COLS[k]}=?`).join(', ');
    db.prepare(`UPDATE ordens_servico SET ${setSql}, atualizado_em=CURRENT_TIMESTAMP WHERE id=?`)
      .run(...values, id);
    return db.prepare('SELECT * FROM ordens_servico WHERE id = ?').get(id);
  }
  const allFields = ['numero', ...fields];
  const allValues = [nextOrdemNumero(), ...values];
  const cols = allFields.map(k => ORDEM_COLS[k] || k).join(', ');
  const placeholders = allFields.map(() => '?').join(', ');
  const info = db.prepare(`INSERT INTO ordens_servico (${cols}) VALUES (${placeholders})`).run(...allValues);
  return db.prepare('SELECT * FROM ordens_servico WHERE id = ?').get(info.lastInsertRowid);
}

app.post('/api/ordens', (req, res) => {
  try {
    const o = upsertOrdem(null, req.body);
    res.status(201).json(decodeOrdem(o));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/ordens/:id', (req, res) => {
  const exists = db.prepare('SELECT id FROM ordens_servico WHERE id = ?').get(req.params.id);
  if (!exists) return res.status(404).json({ error: 'Ordem não encontrada' });
  try {
    const o = upsertOrdem(Number(req.params.id), req.body);
    res.json(decodeOrdem(o));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/ordens/:id', (req, res) => {
  const info = db.prepare('DELETE FROM ordens_servico WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Ordem não encontrada' });
  res.json({ ok: true });
});

// ================= HEALTH =================
app.get('/api/health', (req, res) =>
  res.json({ ok: true, ts: new Date().toISOString(), viaturas: db.prepare('SELECT COUNT(*) AS c FROM viaturas').get().c,
             ordens: db.prepare('SELECT COUNT(*) AS c FROM ordens_servico').get().c })
);

// 404 para rotas desconhecidas
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

app.listen(PORT, () => console.log(`🚀 API Frota PM em http://localhost:${PORT}`));
