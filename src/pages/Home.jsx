import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div className="container">
      {/* Puedes agregar un logo o imagen aquí si tienes uno */}
      {/* Por ejemplo: <img src="/ruta/a/tu-logo.png" alt="Logo FCS" style={{width: 80, height: 80, marginBottom: 20}} /> */}
      <img 
      src="https://pbs.twimg.com/profile_images/1323229344563646465/UdNYE4y9_400x400.jpg" 
      alt="Logo FCS" 
      class="w-24 h-24 mx-auto mb-4 rounded-full object-center scale-1500"
      />    
      <h1>Registro de Asistencia</h1>
      <h2>Facultad de Ciencias de la Salud</h2>

      <div className="user-actions">
        <Link to="/scan">
          <button className="main-button">Escanear QR (Alumnos)</button>
        </Link>
        <Link to="/profesores">
          <button className="secondary-button">Acceso Profesores</button>
        </Link>
      </div>
    </div>
  );
}