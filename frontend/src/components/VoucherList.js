import React from 'react';
import VoucherItem from './VoucherItem';

function VoucherList({ vouchers, onChange }) {
  if (!vouchers.length) return <p>No vouchers yet.</p>;
  return (
    <div>
      {vouchers.map(voucher => (
        <VoucherItem key={voucher.id} voucher={voucher} onChange={onChange} />
      ))}
    </div>
  );
}

export default VoucherList; 
