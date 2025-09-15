import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ScanPage from "./pages/ScanPage";
import TeacherPage from "./pages/TeacherPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/profesores" element={<TeacherPage />} />
    </Routes>
  );
}
