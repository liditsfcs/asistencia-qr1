import React, { useState, useEffect } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider, db } from "../firebase";
import QRScanner from "../components/QRScanner";
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { metersBetween } from "../utils/geo";

export default function ScanPage() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return () => unsub();
  }, []);

  async function handleLogin() {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e); setMessage("Error en login: " + e.message);
    }
  }
  async function handleLogout() { await signOut(auth); setMessage("Sesión cerrada"); }

  async function handleScan(qrText) {
    setMessage("QR leído: " + qrText);
    if (!user) { setMessage("Iniciá sesión primero"); return; }

    const aulaId = qrText;

    try {
      const aulaSnap = await getDoc(doc(db, "aulas", aulaId));
      if (!aulaSnap.exists()) { setMessage("Aula no encontrada en la DB"); return; }
      const aula = aulaSnap.data();

      if (!navigator.geolocation) { setMessage("Geolocalización no soportada"); return; }
      navigator.geolocation.getCurrentPosition(async pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const dist = metersBetween(lat, lng, aula.ubicacion.lat, aula.ubicacion.lng);
        if (dist > 20) {
          setMessage(`Estás fuera del rango (a ${Math.round(dist)} m). Debés estar a <= 20 m.`);
          return;
        }

        const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const hoy = new Date();
        const diaHoy = diasSemana[hoy.getDay()];

        const q = query(
          collection(db, "comisiones"),
          where("aulaId", "==", aulaId),
          where("diaSemana", "==", diaHoy)
        );
        const comisionesEncontradas = await getDocs(q);

        if (comisionesEncontradas.empty) {
          setMessage("No hay una comisión programada para esta aula hoy.");
          return;
        }

        let comisionValida = null;
        comisionesEncontradas.forEach(doc => {
          const com = doc.data();
          const [hiH, hiM] = com.horaInicio.split(":").map(Number);
          const [hfH, hfM] = com.horaFin.split(":").map(Number);
          const start = new Date(hoy); start.setHours(hiH, hiM, 0, 0);
          const end = new Date(hoy); end.setHours(hfH, hfM, 0, 0);

          if (hoy >= start && hoy <= end) {
            comisionValida = { id: doc.id, data: com };
          }
        });

        if (!comisionValida) {
          setMessage("No estás dentro de la franja horaria de ninguna comisión hoy.");
          return;
        }

        const comisionId = comisionValida.id;
        const q2 = query(
          collection(db, "asistencias"),
          where("alumno.uid", "==", user.uid),
          where("comisionId", "==", comisionId),
          where("diaSemana", "==", diaHoy)
        );
        const docsq = await getDocs(q2);
        if (!docsq.empty) {
          setMessage("Ya registraste asistencia para esta comisión hoy.");
          return;
        }

        const nombreCompleto = user.displayName || "";
        const [nombre, ...rest] = nombreCompleto.split(" ");
        const apellido = rest.join(" ");
        await addDoc(collection(db, "asistencias"), {
          alumno: { uid: user.uid, nombre, apellido, email: user.email },
          materiaId: comisionValida.data.materiaId,
          comisionId,
          aulaId,
          fecha: hoyStr, 
          diaSemana: diaHoy, 
          hora: hoy.toTimeString().slice(0, 5),
          geo: { lat, lng },
          creadoEn: serverTimestamp(),
        });

        setMessage("Asistencia registrada correctamente ✅");
      }, err => {
        setMessage("Error obteniendo ubicación: " + err.message);
      }, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });

    } catch (e) {
      console.error(e); setMessage("Error: " + e.message);
    }
  }

  return (
    <div className="container">
      {!user ? (
        <>
          <h1>Registro de Asistencia</h1>
          <h2>Facultad de Ciencias de la Salud</h2>
          <div className="user-actions">
            <button className="main-button" onClick={handleLogin}>Iniciar sesión con Google</button>
          </div>
          <p className="status-message">{message}</p>
        </>
      ) : (
        <>
          <div className="profile-card">
            <img className="user-photo" src={user.photoURL || "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"} alt="Foto de perfil" />
            <div className="user-name">{user.displayName}</div>
            <div className="user-email">{user.email}</div>
          </div>
          <div className="user-actions">
            <button className="main-button" onClick={() => handleScan('tu_aula')}>
              Registrar mi asistencia
            </button>
            <button className="secondary-button" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
          <p className="status-message">{message}</p>
        </>
      )}
    </div>
  )
}