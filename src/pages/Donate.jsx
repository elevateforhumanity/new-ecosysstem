/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import { useAnalytics } from "../hooks/useAnalytics";

export default function Donate() {
  useAnalytics("Donate");
  
  const [amount, setAmount] = useState("100");
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState("once");

  const presetAmounts = ["25", "50", "100", "250", "500", "1000"];

  const handleDonate = (e) => {
    e.preventDefault();
    const finalAmount = amount === "custom" ? customAmount : amount;
    alert(`Thank you for your ${frequency === "monthly" ? "monthly" : "one-time"} donation of $${finalAmount}!`);
  };

  return (
    <AppLayout title="Donate">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem', padding: '3rem 2rem', background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)', borderRadius: '12px', color: 'white' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '700' }}>Support Our Mission</h1>
          <p style={{ fontSize: '1.5rem', maxWidth: '800px', margin: '0 auto', opacity: 0.95 }}>
            Your donation helps provide life-changing education and workforce training
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem' }}>
          <div>
            <form onSubmit={handleDonate} style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#1f2937' }}>Make a Donation</h2>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#1f2937' }}>Donation Frequency</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setFrequency("once")} style={{ flex: 1, padding: '0.75rem', backgroundColor: frequency === "once" ? '#7c3aed' : 'white', color: frequency === "once" ? 'white' : '#1f2937', border: '2px solid #7c3aed', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>One-Time</button>
                  <button type="button" onClick={() => setFrequency("monthly")} style={{ flex: 1, padding: '0.75rem', backgroundColor: frequency === "monthly" ? '#7c3aed' : 'white', color: frequency === "monthly" ? 'white' : '#1f2937', border: '2px solid #7c3aed', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Monthly</button>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#1f2937' }}>Donation Amount</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  {presetAmounts.map(amt => (
                    <button key={amt} type="button" onClick={() => setAmount(amt)} style={{ padding: '1rem', backgroundColor: amount === amt ? '#7c3aed' : 'white', color: amount === amt ? 'white' : '#1f2937', border: '2px solid #e2e8f0', borderRadius: '6px', fontWeight: '600', fontSize: '1.125rem', cursor: 'pointer' }}>${amt}</button>
                  ))}
                </div>
                <button type="button" onClick={() => setAmount("custom")} style={{ width: '100%', padding: '1rem', backgroundColor: amount === "custom" ? '#7c3aed' : 'white', color: amount === "custom" ? 'white' : '#1f2937', border: '2px solid #e2e8f0', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginBottom: '0.75rem' }}>Custom Amount</button>
                {amount === "custom" && (
                  <input type="number" placeholder="Enter amount" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} min="1" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '1rem' }} />
                )}
              </div>

              <button type="submit" style={{ width: '100%', padding: '1rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.125rem', fontWeight: '600', cursor: 'pointer' }}>
                Donate ${amount === "custom" ? customAmount || "0" : amount} {frequency === "monthly" ? "Monthly" : "Now"}
              </button>
            </form>
          </div>

          <div>
            <div style={{ background: '#fef3c7', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#92400e' }}>Your Impact</h3>
              <div style={{ marginBottom: '1.5rem' }}><div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#92400e', marginBottom: '0.5rem' }}>$25</div><p style={{ color: '#78350f' }}>Provides course materials for one student</p></div>
              <div style={{ marginBottom: '1.5rem' }}><div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#92400e', marginBottom: '0.5rem' }}>$100</div><p style={{ color: '#78350f' }}>Covers certification exam fees</p></div>
              <div style={{ marginBottom: '1.5rem' }}><div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#92400e', marginBottom: '0.5rem' }}>$500</div><p style={{ color: '#78350f' }}>Funds a complete training program</p></div>
              <div><div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#92400e', marginBottom: '0.5rem' }}>$1,000</div><p style={{ color: '#78350f' }}>Sponsors a full scholarship</p></div>
            </div>

            <div style={{ background: '#eff6ff', padding: '2rem', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1e40af' }}>Other Ways to Give</h3>
              <p style={{ color: '#1f2937', marginBottom: '1rem' }}>Interested in corporate partnerships or planned giving?</p>
              <Link to="/philanthropy" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', backgroundColor: '#1e40af', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: '600' }}>Learn More</Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}