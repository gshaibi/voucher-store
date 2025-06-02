import React from 'react';
import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:4000') + '/vouchers';

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
    <div
      style={{
        border: '1px solid #f6d365',
        borderLeft: voucher.used ? '8px solid #bbb' : '8px solid #f76b1c',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        background: voucher.used ? '#f3f3f3' : '#fffdfa',
        opacity: voucher.used ? 0.7 : 1,
        boxShadow: '0 2px 8px rgba(253,160,133,0.07)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        position: 'relative',
        cursor: voucher.used ? 'not-allowed' : 'pointer',
      }}
      onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(253,160,133,0.18)'}
      onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(253,160,133,0.07)'}
    >
      <div style={{ marginBottom: 10, whiteSpace: 'pre-wrap', fontSize: 16, color: '#222' }}>{voucher.text}</div>
      <div style={{ fontSize: 14, color: '#f76b1c', marginBottom: 8 }}>
        <b>Expiration:</b> {voucher.expiration || <span style={{color:'#aaa'}}>Unknown</span>}
      </div>
      <div style={{ fontSize: 14, color: '#555', marginBottom: 12 }}>
        <b>Codes:</b> {voucher.codes && voucher.codes.length ? voucher.codes.join(', ') : <span style={{color:'#aaa'}}>None</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: voucher.used ? '#bbb' : '#f76b1c' }}>
          <input
            type="checkbox"
            checked={voucher.used}
            onChange={handleUsedChange}
            style={{ accentColor: '#f76b1c', width: 18, height: 18 }}
          />
          Used
        </label>
        <button
          onClick={handleShare}
          style={{
            background: 'linear-gradient(90deg, #fda085 0%, #f6d365 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '7px 18px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(247,107,28,0.08)',
            transition: 'background 0.2s',
            opacity: voucher.used ? 0.5 : 1,
            pointerEvents: voucher.used ? 'none' : 'auto',
          }}
        >
          Share
        </button>
      </div>
      {voucher.used && <span style={{position:'absolute',top:10,right:18,color:'#bbb',fontWeight:700,fontSize:13,letterSpacing:1}}>USED</span>}
    </div>
  );
}

export default VoucherItem; 
