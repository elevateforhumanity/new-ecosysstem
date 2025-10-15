import React from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { initGA } from './utils/analytics'
import App from './App.jsx'
import './index.css'
import './styles/shadcn.css'

// Initialize Google Analytics
if (import.meta.env.PROD) {
  initGA();
}

// Initialize Sentry for error tracking
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    // Filter out development errors
    beforeSend(event) {
      // Don't send errors from localhost
      if (window.location.hostname === 'localhost') {
        return null;
      }
      return event;
    },
  });
  console.log('[EFH] Sentry initialized');
} else {
  console.log('[EFH] Sentry disabled (dev mode or DSN not set)');
}

function showFatal(e) {
  const el = document.createElement('div')
  el.style.cssText = 'position:fixed;z-index:99999;top:0;left:0;right:0;padding:12px;background:#ff0033;color:#fff;font:14px/1.4 system-ui'
  el.textContent = 'React failed to mount: ' + (e?.message || e)
  document.body.appendChild(el)
  console.error('[EFH] React mount error:', e)
}

console.log('[EFH] Starting React app...')
console.log('[EFH] Environment:', {
  mode: import.meta.env.MODE,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
  siteUrl: import.meta.env.VITE_SITE_URL || 'not set'
})

try {
  const rootEl = document.getElementById('root')
  if (!rootEl) throw new Error('#root not found in index.html')
  console.log('[EFH] Root element found, mounting React...')
  createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('[EFH] React mounted successfully')
} catch (e) {
  console.error('[EFH] FATAL ERROR:', e)
  showFatal(e)
}