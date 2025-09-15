import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div style={{padding: 24}}>
      <h1>Control de Asistencia</h1>
      <div style={{marginTop:20}}>
        <Link to="/scan"><button>Escanear QR (Alumnos)</button></Link>
      </div>
      <div style={{marginTop:12}}>
        <Link to="/profesores"><button>Acceso Profesores</button></Link>
      </div>
    </div>
  )
}
