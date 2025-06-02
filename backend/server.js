const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render') ? { rejectUnauthorized: false } : false,
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id UUID PRIMARY KEY,
      text TEXT NOT NULL,
      expiration DATE,
      codes TEXT[],
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

function parseExpiration(text) {
  // Match DD-MM-YYYY or DD/MM/YYYY
  const match = text.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
  if (match) {
    const [day, month, year] = match[1].replace(/\//g, '-').split('-');
    return `${year}-${month}-${day}`;
  }
  return null;
}

function parseCodes(text) {
  // Match codes like 123456789-1234
  return Array.from(text.matchAll(/\d{6,}-\d{4}/g)).map(m => m[0]);
}

app.get('/vouchers', async (req, res) => {
  await ensureTable();
  const result = await pool.query('SELECT * FROM vouchers ORDER BY expiration NULLS LAST, created_at DESC');
  res.json(result.rows);
});

app.post('/vouchers', async (req, res) => {
  await ensureTable();
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });
  const expiration = parseExpiration(text);
  const codes = parseCodes(text);
  const id = uuidv4();
  const used = false;
  const created_at = new Date();
  await pool.query(
    'INSERT INTO vouchers (id, text, expiration, codes, used, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
    [id, text, expiration, codes, used, created_at]
  );
  const result = await pool.query('SELECT * FROM vouchers WHERE id = $1', [id]);
  res.status(201).json(result.rows[0]);
});

app.patch('/vouchers/:id/used', async (req, res) => {
  await ensureTable();
  const { id } = req.params;
  const { used } = req.body;
  await pool.query('UPDATE vouchers SET used = $1 WHERE id = $2', [!!used, id]);
  const result = await pool.query('SELECT * FROM vouchers WHERE id = $1', [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

app.listen(PORT, () => {
  console.log(`Voucher Store backend running on port ${PORT}`);
}); 
