import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VoucherList from './components/VoucherList';

const API_URL = 'http://localhost:4000/vouchers';

function App() {
  const [vouchers, setVouchers] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVouchers = async () => {
    setLoading(true);
    const res = await axios.get(API_URL);
    setVouchers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await axios.post(API_URL, { text });
    setText('');
    fetchVouchers();
  };

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
        <h1 style={{
          textAlign: 'center',
          color: '#f76b1c',
          fontWeight: 800,
          letterSpacing: 1,
          marginBottom: 32,
          fontSize: 32,
          fontFamily: 'inherit',
        }}>
          🎟️ Voucher Store
        </h1>
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
        {loading ? <p style={{textAlign:'center'}}>Loading...</p> : <VoucherList vouchers={vouchers} onChange={fetchVouchers} />}
      </div>
    </div>
  );
}

export default App; 
