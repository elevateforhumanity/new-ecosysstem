/**
 * PRODUCTION-READY FRONTEND
 * Elevate for Humanity - Complete Integration
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Import Sentry
import { initSentry, ErrorBoundary } from './config/sentry';

// Initialize Sentry FIRST
initSentry();

// Log startup
console.log('🚀 Elevate for Humanity Frontend');
console.log('================================');
console.log(`✅ Environment: ${import.meta.env.MODE}`);
console.log(`✅ API URL: ${import.meta.env.VITE_API_URL || 'http://localhost:3000'}`);
console.log(`✅ Sentry: ${import.meta.env.VITE_SENTRY_DSN ? 'Enabled' : 'Disabled'}`);
console.log(`✅ Supabase: ${import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Not configured'}`);
console.log('================================');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#dc2626' }}>
            Oops! Something went wrong
          </h1>
          <p style={{ marginBottom: '2rem', color: '#6b7280', maxWidth: '500px' }}>
            We've been notified and are working on it. Please try refreshing the page.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={resetError}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Go Home
            </button>
          </div>
          {import.meta.env.DEV && (
            <details style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', color: '#6b7280' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.5rem',
                overflow: 'auto',
                fontSize: '0.875rem'
              }}>
                {error.toString()}
              </pre>
            </details>
          )}
        </div>
      )}
      showDialog={false}
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
