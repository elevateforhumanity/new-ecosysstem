/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React, { useState } from "react";
import AppLayout from "../layouts/AppLayout";

export default function VerifyCertificate() {
  const [certId, setCertId] = useState("");
  return (
    <AppLayout>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: 48, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🏆</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Verify Certificate</h1>
        <p style={{ fontSize: 16, color: "#666", marginBottom: 32 }}>
          Enter a certificate ID to verify its authenticity.
        </p>
        <input
          type="text"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          placeholder="CERT-2024-001234"
          style={{ width: "100%", maxWidth: 400, padding: "12px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, marginBottom: 16 }}
        />
        <button style={{ padding: "12px 32px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: 6, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
          Verify Certificate
        </button>
      </div>
    </AppLayout>
  );
}
