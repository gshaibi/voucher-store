import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VoucherList from './components/VoucherList';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:4000') + '/vouchers';

function App() {
  const [vouchers, setVouchers] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);

  // Parse token from URL on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      localStorage.setItem('token', urlToken);
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // Decode user info from JWT (for display)
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setVouchers(res.data);
    } catch {
      setVouchers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchVouchers();
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await axios.post(API_URL, { text }, { headers: { Authorization: `Bearer ${token}` } });
    setText('');
    fetchVouchers();
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' }}>
        <div style={{ background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <h2 style={{ color: '#f76b1c', marginBottom: 24 }}>Voucher Store</h2>
          <a href="http://localhost:4000/auth/google" style={{
            display: 'inline-block',
            background: '#fff',
            color: '#444',
            border: '1px solid #f76b1c',
            borderRadius: 8,
            padding: '12px 32px',
            fontSize: 18,
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(247,107,28,0.08)',
            transition: 'background 0.2s',
          }}>
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 24, marginRight: 12, verticalAlign: 'middle' }} />
            Login with Google
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
      fontFamily: 'Inter, Arial, sans-serif',
      padding: 0,
      margin: 0,
    }}>
      <div style={{
        maxWidth: 600,
        margin: '48px auto',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '32px 28px 24px 28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{
            textAlign: 'center',
            color: '#f76b1c',
            fontWeight: 800,
            letterSpacing: 1,
            marginBottom: 0,
            fontSize: 32,
            fontFamily: 'inherit',
          }}>
            🎟️ Voucher Store
          </h1>
          <button onClick={handleLogout} style={{ background: '#fff', color: '#f76b1c', border: '1px solid #f76b1c', borderRadius: 8, padding: '6px 18px', fontWeight: 700, cursor: 'pointer', marginLeft: 16 }}>Logout</button>
        </div>
        {user && <div style={{ color: '#888', fontSize: 15, marginBottom: 18 }}>Logged in as <b>{user.displayName || user.email}</b></div>}
        <form onSubmit={handleAdd} style={{ marginBottom: 32 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste voucher text here..."
            rows={5}
            style={{
              width: '100%',
              marginBottom: 12,
              borderRadius: 8,
              border: '1px solid #f76b1c',
              padding: 12,
              fontSize: 16,
              fontFamily: 'inherit',
              background: '#fff8f3',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(90deg, #fda085 0%, #f6d365 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 28px',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(247,107,28,0.08)',
              transition: 'background 0.2s',
            }}
          >
            Add Voucher
          </button>
        </form>
        {loading ? (
          <p style={{textAlign:'center'}}>Loading...</p>
        ) : (
          <>
            <h2 style={{fontSize:22, color:'#f76b1c', marginBottom:12, marginTop:0, fontWeight:700}}>Active Vouchers</h2>
            <VoucherList vouchers={vouchers.filter(v => !v.used)} onChange={fetchVouchers} />
            <hr style={{margin:'32px 0 24px 0', border:'none', borderTop:'1px solid #f6d365'}} />
            <h2 style={{fontSize:18, color:'#bbb', marginBottom:12, marginTop:0, fontWeight:700}}>Archive</h2>
            <VoucherList vouchers={vouchers.filter(v => v.used)} onChange={fetchVouchers} />
          </>
        )}
      </div>
    </div>
  );
}

export default App; 
