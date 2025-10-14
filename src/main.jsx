import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/shadcn.css'

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