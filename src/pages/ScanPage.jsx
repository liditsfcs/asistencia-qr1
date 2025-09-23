import React, { useState, useEffect } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider, db } from "../firebase";
import QRScanner from "../components/QRScanner";
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { metersBetween } from "../utils/geo";

export default function ScanPage() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  // Nuevo estado para controlar si la cámara está activa
  const [isScanning, setIsScanning] = useState(true);

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

  // Reinicia la cámara y el mensaje para un nuevo intento
  function resetScanner() {
    setMessage("");
    setIsScanning(true);
  }


  async function handleScan(qrText) {
  setMessage("QR leído: " + qrText);
  if (!user) {
    setMessage("Iniciá sesión primero");
    return;
  }

  setIsScanning(false);

  const aulaId = qrText;

  try {
    const aulaSnap = await getDoc(doc(db, "aulas", aulaId));
    if (!aulaSnap.exists()) {
      setMessage("Aula no encontrada en la DB");
      setIsScanning(true);
      return;
    }
    const aula = aulaSnap.data();

    if (!navigator.geolocation) {
      setMessage("Geolocalización no soportada");
      setIsScanning(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const dist = metersBetween(lat, lng, aula.ubicacion.lat, aula.ubicacion.lng);
      if (dist > 20) {
        setMessage(`Estás fuera del rango (a ${Math.round(dist)} m). Debés estar a <= 20 m.`);
        setIsScanning(true);
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
        setIsScanning(true);
        return;
      }

      let comisionValida = null;
      comisionesEncontradas.forEach(doc => {
        const com = doc.data();
        const [hiH, hiM] = com.horaInicio.split(":").map(Number);
        const [hfH, hfM] = com.horaFin.split(":").map(Number);
        const start = new Date(hoy);
        start.setHours(hiH, hiM, 0, 0);
        const end = new Date(hoy);
        end.setHours(hfH, hfM, 0, 0);

        if (hoy >= start && hoy <= end) {
          comisionValida = {
            id: doc.id,
            data: com
          };
        }
      });

      if (!comisionValida) {
        setMessage("No estás dentro de la franja horaria de ninguna comisión hoy.");
        setIsScanning(true);
        return;
      }

      const comisionId = comisionValida.id;
      const hoyStr = hoy.toISOString().slice(0, 10);

      const q2 = query(
        collection(db, "asistencias"),
        where("alumno.uid", "==", user.uid),
        where("comisionId", "==", comisionId),
        where("fecha", "==", hoyStr)
      );
      const docsq = await getDocs(q2);
      if (!docsq.empty) {
        // En caso de que ya exista un registro, muestra el mensaje y no reactiva el escáner.
        setMessage("Ya registraste asistencia para esta comisión hoy.");
        return;
      }

      const nombreCompleto = user.displayName || "";
      const [nombre, ...rest] = nombreCompleto.split(" ");
      const apellido = rest.join(" ");

      await addDoc(collection(db, "asistencias"), {
        alumno: {
          uid: user.uid,
          nombre,
          apellido,
          email: user.email
        },
        materiaId: comisionValida.data.materiaId,
        comisionId,
        aulaId,
        fecha: hoyStr,
        geo: {
          lat,
          lng
        },
        creadoEn: serverTimestamp(),
      });

      // Si la asistencia se registró con éxito, muestra el mensaje final.
      setMessage("Asistencia registrada correctamente ✅");

    }, err => {
      setMessage("Error obteniendo ubicación: " + err.message);
      setIsScanning(true);
    }, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    });

  } catch (e) {
    console.error(e);
    setMessage("Error: " + e.message);
    setIsScanning(true);
  }
}

  return (
    <div className="container">
      <h2>Escanear QR - Alumnos</h2>
      {!user ? (
        <div>
          <button className="main-button" onClick={handleLogin}>Iniciar sesión con Google</button>
          <p className="status-message">{message}</p>
        </div>
      ) : (
        <div>
          <div className="profile-card">
            <img className="user-photo" src={user.photoURL || "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"} alt="Foto de perfil" />
            <div className="user-name">{user.displayName}</div>
            <div className="user-email">{user.email}</div>
          </div>
          <div className="user-actions">
            {/* Solo muestra el escáner si isScanning es true */}
            {isScanning ? (
              <>
                <p>Pantalla de cámara:</p>
                <QRScanner onResult={handleScan} />
              </>
            ) : (
              <>
                <p className="status-message">{message}</p>
                {/* Botón para reintentar solo si hubo un error */}
                {message.includes("Error") || message.includes("No") ? (
                  <button className="main-button" onClick={resetScanner}>Reintentar</button>
                ) : null}
              </>
            )}
            <button className="secondary-button" onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        </div>
      )}
    </div>
  )
}