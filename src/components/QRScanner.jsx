import React from "react";
import QrScanner from 'react-qr-scanner';

export default function QRScanner({ onResult }) {
  const constraints = {
    video: {
      facingMode: "environment"
    }
  };

  return (
    <div>
      <QrScanner
        delay={300}
        onError={(err) => console.error(err)}
        onScan={(data) => {
          if (data) {
            // Check if data exists and then access the "text" property
            if (data.text) {
              console.log("QR code data:", data.text); // For debugging
              if (onResult) {
                onResult(data.text);
              }
            }
          }
        }}
        style={{ width: '100%' }}
        constraints={constraints}
      />
    </div>
  );
}