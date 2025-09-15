import React, { useState, useEffect } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider, db } from "../firebase";
import QRScanner from "../components/QRScanner";
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { metersBetween } from "../utils/geo";

export default function ScanPage(){
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return () => unsub();
  }, []);

  async function handleLogin(){
    try {
      await signInWithPopup(auth, provider);
    } catch(e){
      console.error(e); setMessage("Error en login: " + e.message);
    }
  }
  async function handleLogout(){ await signOut(auth); setMessage("Sesión cerrada"); }

  async function handleScan(qrText){
    setMessage("QR leído: " + qrText);
    if (!user) { setMessage("Iniciá sesión primero"); return; }

    // parseamos QR -> formato: "AULA101|COM001"
    const parts = qrText.split("|");
    if (parts.length < 2) { setMessage("QR inválido"); return; }
    const [aulaId, comisionId] = parts;

    try {
      // obtener aula
      const aulaSnap = await getDoc(doc(db, "aulas", aulaId));
      if (!aulaSnap.exists()) { setMessage("Aula no encontrada en la DB"); return; }
      const aula = aulaSnap.data();

      // ubicación actual
      if (!navigator.geolocation) { setMessage("Geolocalización no soportada"); return; }
      navigator.geolocation.getCurrentPosition(async pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const dist = metersBetween(lat, lng, aula.ubicacion.lat, aula.ubicacion.lng);
        if (dist > 20) {
          setMessage(`Estás fuera del rango (a ${Math.round(dist)} m). Debés estar a <= 20 m.`);
          return;
        }

        // validar comision
        const comSnap = await getDoc(doc(db, "comisiones", comisionId));
        if (!comSnap.exists()) { setMessage("Comisión no encontrada"); return; }
        const com = comSnap.data();

        // validar fecha y hora: com.fecha == hoy, y hora actual entre inicio y fin
        const hoy = new Date();
        const hoyStr = hoy.toISOString().slice(0,10);
        if (com.fecha !== hoyStr) {
          setMessage("La comisión no coincide con la fecha de hoy.");
          return;
        }
        // convertir horas hh:mm
        const [hiH, hiM] = com.horaInicio.split(":").map(Number);
        const [hfH, hfM] = com.horaFin.split(":").map(Number);
        const start = new Date(hoy); start.setHours(hiH, hiM, 0, 0);
        const end = new Date(hoy); end.setHours(hfH, hfM, 0, 0);
        if (!(hoy >= start && hoy <= end)) {
          setMessage("No estás dentro de la franja horaria de la comisión.");
          return;
        }

        // evitar duplicados: buscar si ya registró hoy esa comision
        const q = query(collection(db,"asistencias"),
                        where("alumno.uid","==", user.uid),
                        where("comisionId","==", comisionId),
                        where("fecha","==", hoyStr));
        const docsq = await getDocs(q);
        if (!docsq.empty) {
          setMessage("Ya registraste asistencia para esta comisión hoy.");
          return;
        }

        // guardar asistencia
        const nombreCompleto = user.displayName || "";
        const [nombre, ...rest] = nombreCompleto.split(" ");
        const apellido = rest.join(" ");
        await addDoc(collection(db,"asistencias"), {
          alumno: { uid: user.uid, nombre, apellido, email: user.email },
          materiaId: com.materiaId,
          comisionId,
          aulaId,
          fecha: hoyStr,
          hora: hoy.toTimeString().slice(0,5),
          geo: { lat, lng },
          creadoEn: serverTimestamp(),
          estado: "PRESENTE"
        });

        setMessage("Asistencia registrada correctamente ✅");
      }, err => {
        setMessage("Error obteniendo ubicación: " + err.message);
      }, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });

    } catch(e){
      console.error(e); setMessage("Error: " + e.message);
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Escanear QR - Alumnos</h2>
      {!user ? (
        <div>
          <button onClick={handleLogin}>Iniciar sesión con Google</button>
        </div>
      ) : (
        <div>
          <div>Sesión: {user.displayName} ({user.email}) <button onClick={handleLogout}>Cerrar sesión</button></div>
          <p>Pantalla de cámara:</p>
          <QRScanner onResult={handleScan} />
        </div>
      )}
      <div style={{marginTop:12}}>{message}</div>
    </div>
  )
}
