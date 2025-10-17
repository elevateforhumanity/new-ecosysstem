/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { useAnalytics } from '../hooks/useAnalytics';

export default function Account() {
  useAnalytics('Account');

  const [user] = useState({
    name: 'Student User',
    email: 'student@example.com',
    role: 'Student',
    enrolledSince: 'January 2025',
    coursesCompleted: 3,
    certificatesEarned: 2,
  });

  return (
    <AppLayout title="My Account">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            marginBottom: '2rem',
            color: 'var(--brand-text)',
          }}
        >
          My Account
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Profile Summary */}
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid var(--brand-border)',
            }}
          >
            <div
              style={{
                width: '100px',
                height: '100px',
                background: 'var(--brand-info)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '3rem',
                margin: '0 auto 1.5rem',
              }}
            >
              {user.name.charAt(0)}
            </div>
            <h2
              style={{
                fontSize: '1.5rem',
                textAlign: 'center',
                marginBottom: '0.5rem',
                color: 'var(--brand-text)',
              }}
            >
              {user.name}
            </h2>
            <p
              style={{
                textAlign: 'center',
                color: 'var(--brand-text-muted)',
                marginBottom: '1rem',
              }}
            >
              {user.email}
            </p>
            <div
              style={{
                textAlign: 'center',
                padding: '0.5rem 1rem',
                background: 'var(--brand-surface)',
                color: 'var(--brand-info)',
                borderRadius: '20px',
                display: 'inline-block',
                width: '100%',
                fontWeight: '600',
              }}
            >
              {user.role}
            </div>
          </div>

          {/* Account Stats */}
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid var(--brand-border)',
            }}
          >
            <h3
              style={{
                fontSize: '1.25rem',
                marginBottom: '1.5rem',
                color: 'var(--brand-text)',
              }}
            >
              Account Statistics
            </h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--brand-text-muted)',
                  marginBottom: '0.5rem',
                }}
              >
                Member Since
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--brand-text)',
                }}
              >
                {user.enrolledSince}
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--brand-text-muted)',
                  marginBottom: '0.5rem',
                }}
              >
                Courses Completed
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--brand-success)',
                }}
              >
                {user.coursesCompleted}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--brand-text-muted)',
                  marginBottom: '0.5rem',
                }}
              >
                Certificates Earned
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--brand-secondary)',
                }}
              >
                {user.certificatesEarned}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid var(--brand-border)',
            }}
          >
            <h3
              style={{
                fontSize: '1.25rem',
                marginBottom: '1.5rem',
                color: 'var(--brand-text)',
              }}
            >
              Quick Actions
            </h3>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <Link
                to="/profile"
                style={{
                  padding: '1rem',
                  background: 'var(--brand-surface)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'var(--brand-text)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                👤 Edit Profile
              </Link>
              <Link
                to="/settings"
                style={{
                  padding: '1rem',
                  background: 'var(--brand-surface)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'var(--brand-text)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                ⚙️ Settings
              </Link>
              <Link
                to="/certificates"
                style={{
                  padding: '1rem',
                  background: 'var(--brand-surface)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'var(--brand-text)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                🎓 My Certificates
              </Link>
              <Link
                to="/student-dashboard"
                style={{
                  padding: '1rem',
                  background: 'var(--brand-surface)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'var(--brand-text)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                📚 My Courses
              </Link>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div
          style={{
            marginTop: '2rem',
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid var(--brand-border)',
          }}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              marginBottom: '1.5rem',
              color: 'var(--brand-text)',
            }}
          >
            Security & Privacy
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--brand-text)',
                }}
              >
                Password
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--brand-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                Last changed 30 days ago
              </div>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--brand-info)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Change Password
              </button>
            </div>
            <div>
              <div
                style={{
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--brand-text)',
                }}
              >
                Two-Factor Authentication
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--brand-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                Not enabled
              </div>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--brand-success)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Enable 2FA
              </button>
            </div>
            <div>
              <div
                style={{
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--brand-text)',
                }}
              >
                Privacy Settings
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--brand-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                Manage your data
              </div>
              <Link
                to="/privacy-policy"
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: 'var(--brand-text-muted)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                }}
              >
                View Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
