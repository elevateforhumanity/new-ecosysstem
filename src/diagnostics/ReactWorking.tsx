import React from 'react'

const env = (k: string) => (import.meta as any).env?.[k] ?? 'NOT SET'

export default function ReactWorking() {
  const reactVersion: string = (React as any).version || 'unknown'

  return (
    <main style={{fontFamily:'system-ui,-apple-system,Segoe UI,Roboto',padding:'2rem',lineHeight:1.5,maxWidth:900,margin:'0 auto'}}>
      <h1>✅ React is Working!</h1>
      <p>If you see this, the JavaScript bundles are loading and executing correctly.</p>

      <h2>Environment Check:</h2>
      <ul>
        <li>✅ React: <strong>{reactVersion}</strong></li>
        <li>✅ Mode: <strong>{import.meta.env.MODE}</strong></li>
        <li>✅ Supabase URL: <strong>{env('VITE_SUPABASE_URL')}</strong></li>
        <li>✅ Site URL: <strong>{env('VITE_SITE_URL')}</strong></li>
      </ul>

      <p style={{marginTop:'1rem'}}>This is a minimal test app. The full app with all routes is in <code>App.jsx</code>.</p>

      <div style={{marginTop:'2rem',padding:'1rem',background:'#f6f7f9',border:'1px solid #e7e9ee',borderRadius:12}}>
        <h3 style={{marginTop:0}}>🎯 PERFECT! We found the issue!</h3>
        <p>
          The minimal app works, which means the problem is in your full <code>App</code>—likely one of those lazy-loaded components is crashing on import.
          We'll restore the full app with safer lazy loading and an error boundary so one bad import can't blank the whole site.
        </p>
      </div>

      <div style={{marginTop:'1rem',padding:'1rem',background:'#fff3cd',border:'1px solid #ffc107',borderRadius:8}}>
        <h4 style={{marginTop:0}}>🔧 To see the full app:</h4>
        <p>Remove <code>?diag=1</code> from the URL or visit the homepage without the parameter.</p>
      </div>
    </main>
  )
}
