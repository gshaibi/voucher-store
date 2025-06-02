const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 4000;
const DATA_FILE = path.join(__dirname, 'vouchers.json');

app.use(cors());
app.use(bodyParser.json());

function loadVouchers() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveVouchers(vouchers) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(vouchers, null, 2));
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

app.get('/vouchers', (req, res) => {
  let vouchers = loadVouchers();
  vouchers.sort((a, b) => {
    if (!a.expiration) return 1;
    if (!b.expiration) return -1;
    return new Date(a.expiration) - new Date(b.expiration);
  });
  res.json(vouchers);
});

app.post('/vouchers', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });
  const expiration = parseExpiration(text);
  const codes = parseCodes(text);
  const voucher = {
    id: uuidv4(),
    text,
    expiration,
    codes,
    used: false,
    createdAt: new Date().toISOString(),
  };
  const vouchers = loadVouchers();
  vouchers.push(voucher);
  saveVouchers(vouchers);
  res.status(201).json(voucher);
});

app.patch('/vouchers/:id/used', (req, res) => {
  const { id } = req.params;
  const { used } = req.body;
  const vouchers = loadVouchers();
  const idx = vouchers.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  vouchers[idx].used = !!used;
  saveVouchers(vouchers);
  res.json(vouchers[idx]);
});

app.listen(PORT, () => {
  console.log(`Voucher Store backend running on port ${PORT}`);
}); 
