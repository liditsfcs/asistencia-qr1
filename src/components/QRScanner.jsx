import React from "react";
import QrScanner from 'react-qr-scanner';

export default function QRScanner({ onResult }) {
  return (
    <div>
      <QrScanner
        delay={300}
        onError={(err) => console.error(err)}
        onScan={(data) => {
          if (data) console.log(data);
        }}
        style={{ width: '100%' }}
      />
    </div>
  );
}
