import React, { useState, useEffect } from "react";
import { auth, provider, db } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function TeacherPage(){
  const [user,setUser] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [comisiones, setComisiones] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return () => unsub();
  }, []);

  async function login(){
    try {
      await signInWithPopup(auth, provider);
      setMsg("");
    } catch(e){ setMsg("Error login: "+e.message); }
  }
  async function logout(){ await signOut(auth); setUser(null); setMaterias([]); setComisiones([]); }

  useEffect(() => {
    if (!user) return;
    (async ()=>{
      // buscar materias donde sea profesor
      const q = query(collection(db,"materias"), where("profesores","array-contains", user.email));
      const snap = await getDocs(q);
      const arr = snap.docs.map(d=>({ id:d.id, ...d.data() }));
      setMaterias(arr);
      if (arr.length === 0) setMsg("Tu mail no está asignado a ninguna materia.");
    })();
  }, [user]);

  useEffect(() => {
    if (!selectedMateria) return;
    (async () => {
      const q = query(collection(db,"comisiones"), where("materiaId","==", selectedMateria.id));
      const snap = await getDocs(q);
      setComisiones(snap.docs.map(d=>({id:d.id, ...d.data()})));
    })();
  }, [selectedMateria]);

  async function exportAsistencia(comisionId){
    // buscar asistencias para esa comision
    const q = query(collection(db,"asistencias"), where("comisionId","==", comisionId));
    const snap = await getDocs(q);
    if (snap.empty) { setMsg("No hay asistencias para esa comisión"); return; }
    const rows = snap.docs.map(d => {
      const data = d.data();
      return {
        Fecha: data.fecha,
        Aula: data.aulaId,
        Comisión: data.comisionId,
        Alumno: (data.alumno?.nombre || "") + " " + (data.alumno?.apellido || ""),
        Email: data.alumno?.email,
        Hora: data.hora
      }
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencias");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout],{type:"application/octet-stream"}), `asistencias_${selectedMateria.nombre || selectedMateria.id}_${comisionId}.xlsx`);
  }

  return (
    <div className="container">
      <h2>Panel Profesores</h2>
      {!user ? (
        <div>
          <button className="main-button" onClick={login}>Login con Google</button>
          <div className="message">{msg}</div>
        </div>
      ) : (
        <div>
          <div className="user-info">
            <span>Sesión: {user.displayName} ({user.email})</span>
            <button className="main-button" onClick={logout}>Cerrar sesión</button>
          </div>

          <div style={{marginTop:12}}>
            <h3>Mis Materias</h3>
            <div className="card-list">
              {materias.map(m => (
                <div 
                  key={m.id} 
                  className={`card ${selectedMateria && selectedMateria.id === m.id ? 'selected' : ''}`}
                  onClick={()=>setSelectedMateria(m)}
                >
                    <div className="card-title">{m.nombre}</div>
                    <div className="card-subtitle">ID: {m.id}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedMateria && (
            <div style={{marginTop:24}}>
              <h4>Comisiones de {selectedMateria.nombre}</h4>
              <div className="card-list">
                {comisiones.map(c => (
                  <div key={c.id} className="card">
                    <div className="card-title">{c.nombre}</div>
                    <div className="card-subtitle">
                        Aula: {c.aulaId} | {c.diaSemana} ({c.horaInicio} - {c.horaFin})
                    </div>
                    <button 
                        className="card-action-button" 
                        onClick={()=>exportAsistencia(c.id)}
                    >
                        Exportar XLSX
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="message">{msg}</div>
        </div>
      )}
    </div>
  )
}