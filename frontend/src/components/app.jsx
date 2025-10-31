import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../modules/login.jsx";
import Dashboard from "../modules/dashboard.jsx";
import Register from "../modules/register.jsx";
import ChatPrompt from "../modules/chatPrompt.jsx";
import Account from "./account.jsx";
import { useState } from "react";

export default function App() {
  const [studentId, setStudentId] = useState(localStorage.getItem("studentId"));

  const handleLogin = (id) => {
    localStorage.setItem("studentId", id);
    setStudentId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem("studentId");
    setStudentId(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect "/" to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={<Dashboard onLogout={handleLogout} studentId={studentId} />}
        />

        <Route
          path="/chat"
          element={
            studentId ? (
              <ChatPrompt studentId={studentId} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/account"
          element={
            studentId ? (
              <Account studentId={studentId} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
