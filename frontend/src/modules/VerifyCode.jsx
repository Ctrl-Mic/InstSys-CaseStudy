import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function VerifyCode() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const EXPRESS_API = import.meta.env.VITE_EXPRESS_API;

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setStatus("Please enter the 6-digit code.");
      return;
    }
    try {
      const res = await fetch(`${EXPRESS_API}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      const data = await res.text();
      if (res.ok) {
        setStatus("✅ Registration complete!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setStatus(data || "❌ Invalid code.");
      }
    } catch {
      setStatus("❌ Server error.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h2 className="text-xl font-bold mb-4">Enter Verification Code</h2>
      <input
        type="text"
        maxLength={6}
        value={code}
        onChange={e => setCode(e.target.value)}
        className="border px-4 py-2 rounded mb-2 text-center"
        placeholder="6-digit code"
      />
      <button
        onClick={handleVerify}
        className="bg-yellow-500 text-white px-6 py-2 rounded font-semibold"
      >
        Verify
      </button>
      {status && <div className="mt-4 text-red-600">{status}</div>}
    </div>
  );
}

export default VerifyCode;
