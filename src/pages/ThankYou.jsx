/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

export default function ThankYou() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: 48, textAlign: "center" }}>
        <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
        
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
          Thank You!
        </h1>
        
        <p style={{ fontSize: 18, color: "#666", marginBottom: 32, lineHeight: 1.6 }}>
          Your purchase was successful. We've sent a confirmation email with your order details and receipt.
        </p>

        <div
          style={{
            backgroundColor: "#f0f7ff",
            border: "1px solid #b3d9ff",
            borderRadius: 8,
            padding: 24,
            marginBottom: 32,
            textAlign: "left",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
            What's Next?
          </h2>
          <ul style={{ fontSize: 16, lineHeight: 1.8, margin: 0, paddingLeft: 24 }}>
            <li>Check your email for order confirmation and receipt</li>
            <li>Access your course from "My Courses" dashboard</li>
            <li>Start learning at your own pace</li>
            <li>Join our community forums to connect with other students</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 32 }}>
          <Link
            to="/courses"
            style={{
              padding: "14px 28px",
              backgroundColor: "#007bff",
              color: "#fff",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Go to My Courses
          </Link>
          <Link
            to="/"
            style={{
              padding: "14px 28px",
              backgroundColor: "#fff",
              color: "#007bff",
              border: "1px solid #007bff",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Back to Home
          </Link>
        </div>

        <div
          style={{
            paddingTop: 32,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
            Need help? Our support team is here for you.
          </p>
          <Link
            to="/support"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
