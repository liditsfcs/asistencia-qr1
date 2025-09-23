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
          <div className="status-message">{msg}</div>
        </div>
      ) : (
        <>
          <div className="profile-card">
            <img className="user-photo" src={user.photoURL || "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"} alt="Foto de perfil" />
            <div className="user-name">{user.displayName}</div>
            <div className="user-email">{user.email}</div>
          </div>
          
          <div className="user-actions">
            <button className="main-button" onClick={logout}>Cerrar Sesión</button>
          </div>
          
          <div className="section-title">
            <h3>Mis materias</h3>
            <div className="button-group">
              {materias.map(m => (
                <button 
                  key={m.id} 
                  className="secondary-button"
                  onClick={()=>setSelectedMateria(m)}
                >
                  {m.nombre} ({m.id})
                </button>
              ))}
            </div>
          </div>

          {selectedMateria && (
            <div className="section-title">
              <h4>Comisiones de {selectedMateria.nombre}</h4>
              <div className="button-group">
                {comisiones.map(c => (
                  <div key={c.id}>
                    <span>{c.nombre} — {c.fecha} {c.horaInicio}-{c.horaFin}</span>
                    <button className="secondary-button" onClick={()=>exportAsistencia(c.id)}>Exportar CSV/XLSX</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="status-message">{msg}</div>
        </>
      )}
    </div>
  )
}