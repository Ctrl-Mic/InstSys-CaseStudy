import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Popup from "../utils/popups";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./modules/register.jsx";
import VerifyCode from "./modules/VerifyCode.jsx";

function VerifyCode() {
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });

  const handleVerify = async () => {
    if (!code) {
      setPopup({ show: true, type: "error", message: "❌ Please enter the code." });
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_EXPRESS_API}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        setPopup({ show: true, type: "success", message: "✅ Code verified successfully!" });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setPopup({ show: true, type: "error", message: data.error || "❌ Verification failed." });
      }
    } catch (err) {
      setPopup({ show: true, type: "error", message: "⚠ Server error. Please try again later." });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify Your Account</h2>
        <p className="text-center text-gray-600 mb-4">
          Please enter the verification code sent to your email.
        </p>
        <div className="mb-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter verification code"
          />
        </div>
        <button
          onClick={handleVerify}
          className="w-full py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-all duration-300"
        >
          Verify Code
        </button>
      </div>

      <Popup
        show={popup.show}
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ show: false, type: "", message: "" })}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/verify-code" element={<VerifyCode />} />
      </Routes>
    </Router>
  );
}

export default App;