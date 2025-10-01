import React from "react";
import { Link } from "react-router-dom";

// IMPORTA TU LOGO AQUÍ
import UniversityLogo from '../assets/logo-fcs.jpeg'; 

export default function Home(){
  return (
    <div className="container">
      {/* ESPACIO PARA EL LOGO */}
      <div className="logo-container">
        {/* Reemplaza el src con la ruta a tu logo */}
        <img src="../assets/logo-fcs.jpeg" alt="Logo Universidad" className="logo" /> 
      </div>
      
      <h2>Registro de Asistencia</h2>
      <p style={{marginBottom: '20px'}}>Facultad de Ciencias de la Salud</p>
      
      <div className="action-area">
        <Link to="/scan">
          <button className="modern-button primary-button">Escanear QR (Alumnos)</button>
        </Link>
        <Link to="/profesores">
          <button className="modern-button secondary-button">Acceso Profesores</button>
        </Link>
      </div>
    </div>
  );
}