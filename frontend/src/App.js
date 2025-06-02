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
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Voucher Store</h1>
      <form onSubmit={handleAdd} style={{ marginBottom: 24 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste voucher text here..."
          rows={5}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button type="submit">Add Voucher</button>
      </form>
      {loading ? <p>Loading...</p> : <VoucherList vouchers={vouchers} onChange={fetchVouchers} />}
    </div>
  );
}

export default App; 
