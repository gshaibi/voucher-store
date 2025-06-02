import React from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:4000/vouchers';

function VoucherItem({ voucher, onChange }) {
  const handleUsedChange = async (e) => {
    await axios.patch(`${API_URL}/${voucher.id}/used`, { used: e.target.checked });
    onChange();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Voucher',
          text: voucher.text,
        });
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(voucher.text);
      alert('Voucher copied to clipboard!');
    }
  };

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      background: voucher.used ? '#f8f8f8' : '#fff',
      opacity: voucher.used ? 0.6 : 1,
      position: 'relative',
    }}>
      <div style={{ marginBottom: 8, whiteSpace: 'pre-wrap' }}>{voucher.text}</div>
      <div style={{ fontSize: 14, color: '#555' }}>
        Expiration: {voucher.expiration || 'Unknown'}<br />
        Codes: {voucher.codes && voucher.codes.length ? voucher.codes.join(', ') : 'None'}
      </div>
      <div style={{ marginTop: 8 }}>
        <label>
          <input type="checkbox" checked={voucher.used} onChange={handleUsedChange} /> Used
        </label>
        <button style={{ marginLeft: 16 }} onClick={handleShare}>Share</button>
      </div>
    </div>
  );
}

export default VoucherItem; 
