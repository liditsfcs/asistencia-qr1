import React from "react";
import { QrReader } from "react-qr-reader";

export default function QRScanner({ onResult }) {
  return (
    <div>
      <QrReader
        constraints={{ facingMode: "environment" }}
        onResult={(result, error) => {
          if (!!result) {
            onResult(result?.text);
          }
        }}
        containerStyle={{ width: "100%" }}
      />
    </div>
  );
}
