require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 4000;

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

app.use(cors());
app.use(bodyParser.json());
app.use(session({ secret: 'voucher_store_secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

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

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  // You can store user info in DB here if needed
  return done(null, {
    id: profile.id,
    displayName: profile.displayName,
    email: profile.emails && profile.emails[0] && profile.emails[0].value,
  });
}));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), (req, res) => {
  // Issue JWT
  const token = jwt.sign(req.user, JWT_SECRET, { expiresIn: '7d' });
  // Send token to frontend (as query param for simplicity)
  res.redirect(`http://localhost:3000/?token=${token}`);
});

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      return next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
  return res.status(401).json({ error: 'No token provided' });
}

// Protect voucher endpoints
app.get('/vouchers', authenticateJWT, async (req, res) => {
  await ensureTable();
  const result = await pool.query('SELECT * FROM vouchers ORDER BY expiration NULLS LAST, created_at DESC');
  res.json(result.rows);
});

app.post('/vouchers', authenticateJWT, async (req, res) => {
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

app.patch('/vouchers/:id/used', authenticateJWT, async (req, res) => {
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
