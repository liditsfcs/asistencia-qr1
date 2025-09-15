import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from 'react-dom/client';
import App from "./App";

//import "./styles.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/asistencia-qr1">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)