import React from "react";
import QrScanner from 'react-qr-scanner';

export default function QRScanner({ onResult }) {
  const previewStyle = {
    height: 240,
    width: 320,
  };

  const constraints = {
    video: {
      facingMode: "environment" // This forces the rear camera
    }
  };

  return (
    <div>
      <QrScanner
        delay={300}
        onError={(err) => console.error(err)}
        onScan={(data) => {
          if (data) {
            console.log(data);
            if (onResult) onResult(data);
          }
        }}
        style={{ width: '100%' }}
        constraints={constraints} // Add this line
      />
    </div>
  );
}