/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from "react";

export default function FundingImpact() {
  return (
    <main style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h1>Funding Impact</h1>
      <p>Track the impact of workforce funding programs including WIOA, WRG, and VR.</p>
      
      <div style={{ marginTop: 32 }}>
        <h2>Program Metrics</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 16 }}>
          <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
            <h3>WIOA Participants</h3>
            <p style={{ fontSize: 32, fontWeight: "bold", color: "#4f46e5" }}>247</p>
          </div>
          <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
            <h3>WRG Enrollments</h3>
            <p style={{ fontSize: 32, fontWeight: "bold", color: "var(--brand-success)" }}>89</p>
          </div>
          <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
            <h3>VR Placements</h3>
            <p style={{ fontSize: 32, fontWeight: "bold", color: "var(--brand-warning)" }}>34</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2>Success Stories</h2>
        <ul>
          <li>95% job placement rate for WIOA participants</li>
          <li>$2.3M in workforce funding secured</li>
          <li>450+ individuals trained and certified</li>
        </ul>
      </div>
    </main>
  );
}
