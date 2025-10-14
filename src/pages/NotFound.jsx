/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from "react";
import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

export default function NotFound() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: 48, textAlign: "center" }}>
        <div style={{ fontSize: 120, fontWeight: 700, color: "#007bff", marginBottom: 16 }}>
          404
        </div>
        
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
          Page Not Found
        </h1>
        
        <p style={{ fontSize: 18, color: "#666", marginBottom: 32, lineHeight: 1.6 }}>
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 48 }}>
          <Link
            to="/"
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
            Go to Homepage
          </Link>
          <Link
            to="/courses"
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
            Browse Courses
          </Link>
        </div>

        <div
          style={{
            paddingTop: 32,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Popular Pages
          </p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/about" style={{ color: "#007bff", textDecoration: "none", fontSize: 14 }}>
              About Us
            </Link>
            <Link to="/support" style={{ color: "#007bff", textDecoration: "none", fontSize: 14 }}>
              Support
            </Link>
            <Link to="/partners" style={{ color: "#007bff", textDecoration: "none", fontSize: 14 }}>
              Partners
            </Link>
            <Link to="/contact" style={{ color: "#007bff", textDecoration: "none", fontSize: 14 }}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
