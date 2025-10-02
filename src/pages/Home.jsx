import React from "react";
import { Link } from "react-router-dom";

// IMPORTA TU LOGO AQUÍ. Asegúrate de que la ruta sea correcta.
// Si tu logo está en 'src/assets/logo-fcs.svg', entonces:
import UniversityLogo from '../assets/logo-fcs.svg';
// Si tu logo está en 'public/logo-fcs.svg', entonces puedes usar "/logo-fcs.svg" directamente en el src de la imagen.

export default function Home(){
  return (
    <div className="container">
      {/* Contenedor del logo superior */}
      <div className="university-logo-container">
        {/* Aquí puedes usar un <img> con tu logo SVG o PNG */}
        { <img src={UniversityLogo} alt="Logo FCS" className="university-logo" /> }
        {/* O simplemente texto si no tienes el logo en imagen */}
        <span style={{color: '#fff', fontSize: '1.5rem', fontWeight: 'bold'}}>fcs</span>
      </div>
      
      <h1>Registro de Asistencia</h1>
      <h2>Facultad de Ciencias de la Salud</h2>
      
      {/* No hay sección de perfil de usuario en Home, solo los botones de navegación */}
      
      <div className="action-buttons-group">
        <Link to="/scan">
          <button className="primary-action-button">Escanear QR (Alumnos)</button>
        </Link>
        <Link to="/profesores">
          <button className="secondary-action-button">Acceso Profesores</button>
        </Link>
      </div>
    </div>
  );
}