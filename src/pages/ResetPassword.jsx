/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5", padding: 20 }}>
      <div style={{ maxWidth: 440, backgroundColor: "#fff", borderRadius: 12, padding: 48, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Reset Password</h1>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
          Enter your new password below.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          style={{ width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, marginBottom: 16 }}
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          style={{ width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, marginBottom: 16 }}
        />
        <button style={{ width: "100%", padding: "12px 24px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: 6, fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 16 }}>
          Reset Password
        </button>
        <Link to="/login" style={{ display: "block", textAlign: "center", color: "#007bff", textDecoration: "none", fontSize: 14 }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}
