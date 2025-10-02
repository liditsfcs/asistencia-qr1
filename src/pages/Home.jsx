import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div className="container">
      {/* Logo */}
      <img 
        src="https://pbs.twimg.com/profile_images/1323229344563646465/UdNYE4y9_400x400.jpg" 
        alt="Logo FCS" 
        className="logo-fcs"
      /> 
      
      <h1>Registro de Asistencia</h1>
      <h2>Facultad de Ciencias de la Salud</h2>
      
      <div className="action-buttons-group">
        <Link to="/scan" style={{width: '100%'}}>
          {/* Botón de Alumnos con estilo Verde Esmeralda */}
          <button className="modern-button primary-button-emerald">
            Escanear QR (Alumnos)
          </button>
        </Link>
        <Link to="/profesores" style={{width: '100%'}}>
          {/* Botón de Profesores con estilo Azul Cielo */}
          <button className="modern-button primary-button-sky">
            Acceso Profesores
          </button>
        </Link>
      </div>
    </div>
  );
}