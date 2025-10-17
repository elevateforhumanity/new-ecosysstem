/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';

export default function NotFound() {
  return (
    <AppLayout>
      <div
        style={{
          maxWidth: 700,
          margin: '0 auto',
          padding: 48,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            color: 'var(--brand-info)',
            marginBottom: 16,
          }}
        >
          404
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
          Page Not Found
        </h1>

        <p
          style={{
            fontSize: 18,
            color: 'var(--brand-text-muted)',
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          Oops! The page you're looking for doesn't exist. It might have been
          moved or deleted.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            marginBottom: 48,
          }}
        >
          <Link
            to="/"
            style={{
              padding: '14px 28px',
              backgroundColor: 'var(--brand-info)',
              color: '#fff',
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Go to Homepage
          </Link>
          <Link
            to="/courses"
            style={{
              padding: '14px 28px',
              backgroundColor: '#fff',
              color: 'var(--brand-info)',
              border: '1px solid var(--brand-info)',
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Browse Courses
          </Link>
        </div>

        <div
          style={{
            paddingTop: 32,
            borderTop: '1px solid var(--brand-border)',
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Popular Pages
          </p>
          <div
            style={{
              display: 'flex',
              gap: 24,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/about"
              style={{
                color: 'var(--brand-info)',
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              About Us
            </Link>
            <Link
              to="/support"
              style={{
                color: 'var(--brand-info)',
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              Support
            </Link>
            <Link
              to="/partners"
              style={{
                color: 'var(--brand-info)',
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              Partners
            </Link>
            <Link
              to="/contact"
              style={{
                color: 'var(--brand-info)',
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
