import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div className="container">
      <h1>Control de Asistencia</h1>
      <Link to="/scan">
        <button>Escanear QR (Alumnos)</button>
      </Link>
      <Link to="/profesores">
        <button>Acceso Profesores</button>
      </Link>
    </div>
  );
}