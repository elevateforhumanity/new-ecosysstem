/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }
    
    try {
      const { supabase } = await import('../supabaseClient');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) throw error;
      
      // Redirect to dashboard on success
      window.location.href = '/lms/dashboard';
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      if (import.meta.env.DEV) {
        console.error('Login error:', err);
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 48,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Logo/Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#333",
              marginBottom: 8,
            }}
          >
            Elevate for Humanity
          </h1>
          <p style={{ color: "#666", fontSize: 16 }}>
            Sign in to your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: 12,
              backgroundColor: "#f8d7da",
              color: "#721c24",
              borderRadius: 6,
              marginBottom: 20,
              fontSize: 14,
              border: "1px solid #f5c6cb",
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 500,
                fontSize: 14,
                color: "#333",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#007bff")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 500,
                fontSize: 14,
                color: "#333",
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#007bff")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                style={{
                  marginRight: 8,
                  width: 16,
                  height: 16,
                  cursor: "pointer",
                }}
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              style={{
                fontSize: 14,
                color: "#007bff",
                textDecoration: "none",
              }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "24px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              backgroundColor: "#e0e0e0",
            }}
          />
          <span
            style={{
              padding: "0 16px",
              fontSize: 14,
              color: "#666",
            }}
          >
            OR
          </span>
          <div
            style={{
              flex: 1,
              height: 1,
              backgroundColor: "#e0e0e0",
            }}
          />
        </div>

        {/* Social Login Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            type="button"
            style={{
              width: "100%",
              padding: "12px 24px",
              backgroundColor: "#fff",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f8f8f8")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            style={{
              width: "100%",
              padding: "12px 24px",
              backgroundColor: "#fff",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f8f8f8")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </button>
        </div>

        {/* Sign Up Link */}
        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 14,
            color: "#666",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Sign up
          </Link>
        </div>

        {/* Footer Links */}
        <div
          style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "center",
            gap: 24,
            fontSize: 13,
          }}
        >
          <Link
            to="/privacy-policy"
            style={{
              color: "#666",
              textDecoration: "none",
            }}
          >
            Privacy
          </Link>
          <Link
            to="/terms-of-service"
            style={{
              color: "#666",
              textDecoration: "none",
            }}
          >
            Terms
          </Link>
          <Link
            to="/support"
            style={{
              color: "#666",
              textDecoration: "none",
            }}
          >
            Help
          </Link>
        </div>
      </div>
    </div>
  );
}
