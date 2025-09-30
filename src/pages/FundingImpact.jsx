/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React from "react";

export default function FundingImpact() {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ color: "#2d3748", marginBottom: "2rem" }}>Funding Impact Dashboard</h1>
      
      <div style={{ 
        backgroundColor: "#f7fafc", 
        padding: "2rem", 
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        marginBottom: "2rem"
      }}>
        <h2 style={{ color: "#4a5568", marginBottom: "1rem" }}>Impact Metrics</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "8px", textAlign: "center" }}>
            <h3 style={{ color: "#3182ce", fontSize: "2rem", margin: "0" }}>$2.8M</h3>
            <p style={{ color: "#718096", margin: "0.5rem 0 0 0" }}>Total Funding Raised</p>
          </div>
          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "8px", textAlign: "center" }}>
            <h3 style={{ color: "#38a169", fontSize: "2rem", margin: "0" }}>1,247</h3>
            <p style={{ color: "#718096", margin: "0.5rem 0 0 0" }}>Lives Impacted</p>
          </div>
          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "8px", textAlign: "center" }}>
            <h3 style={{ color: "#d69e2e", fontSize: "2rem", margin: "0" }}>89%</h3>
            <p style={{ color: "#718096", margin: "0.5rem 0 0 0" }}>Success Rate</p>
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: "white", 
        padding: "2rem", 
        borderRadius: "12px",
        border: "1px solid #e2e8f0"
      }}>
        <h2 style={{ color: "#4a5568", marginBottom: "1rem" }}>Recent Funding Activities</h2>
        <div style={{ color: "#718096" }}>
          <p style={{ marginBottom: "1rem" }}>• Healthcare Initiative Grant - $500,000 awarded</p>
          <p style={{ marginBottom: "1rem" }}>• Workforce Development Program - $300,000 in progress</p>
          <p style={{ marginBottom: "1rem" }}>• Community Outreach Fund - $150,000 pending review</p>
        </div>
      </div>
    </div>
  );
}