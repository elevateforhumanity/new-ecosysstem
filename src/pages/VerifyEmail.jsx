/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from 'react';
import { Link } from 'react-router-dom';

export default function VerifyEmail() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 500,
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 48,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 24 }}>✉️</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
          Verify Your Email
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'var(--brand-text-muted)',
            marginBottom: 24,
          }}
        >
          We've sent a verification link to your email address. Please check
          your inbox and click the link to verify your account.
        </p>
        <Link
          to="/login"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: 'var(--brand-info)',
            color: '#fff',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
