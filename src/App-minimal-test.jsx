import React from 'react'

export default function App() {
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>
        ✅ React is Working!
      </h1>
      <p style={{ marginBottom: '1rem' }}>
        If you see this, the JavaScript bundles are loading and executing correctly.
      </p>
      <div style={{
        padding: '1rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Environment Check:</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>✅ React: {React.version}</li>
          <li>✅ Mode: {import.meta.env.MODE}</li>
          <li>✅ Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET'}</li>
          <li>✅ Site URL: {import.meta.env.VITE_SITE_URL || 'NOT SET'}</li>
        </ul>
      </div>
      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
        This is a minimal test app. The full app with all routes is in App.jsx.
      </p>
    </div>
  )
}
