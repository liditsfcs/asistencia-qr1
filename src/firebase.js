import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAlbGLCImv8v8yj8GpriBYOJuXSDg5vlxg",
  authDomain: "asistencia-aulas.firebaseapp.com",
  projectId: "asistencia-aulas",
  storageBucket: "asistencia-aulas.firebasestorage.app",
  messagingSenderId: "539245137989",
  appId: "1:539245137989:web:65021c3d40c300acb3532c",
  measurementId: "G-QVTB5ZBBSW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
