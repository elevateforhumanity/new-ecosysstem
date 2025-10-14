import React from 'react'
import ReactDOM from 'react-dom/client'

function BootError({ err }: { err: unknown }) {
  return (
    <main style={{fontFamily:'system-ui',padding:24}}>
      <h1>🚨 React init failed</h1>
      <pre style={{whiteSpace:'pre-wrap',fontSize:12,opacity:.8,background:'#f3f4f6',padding:'1rem',borderRadius:8,marginTop:'1rem'}}>
        {String(err instanceof Error ? err.stack || err.message : err)}
      </pre>
      <p style={{marginTop:'1rem',color:'#666'}}>Check import path casing, lazy imports, env usage, router setup.</p>
      <button 
        onClick={() => window.location.reload()} 
        style={{marginTop:'1rem',padding:'0.5rem 1rem',background:'#2563eb',color:'white',border:'none',borderRadius:6,cursor:'pointer'}}
      >
        Refresh Page
      </button>
    </main>
  )
}

async function start() {
  console.log('[EFH] Starting safe bootstrap...')
  
  const rootEl = document.getElementById('root')
  if (!rootEl) {
    const err = new Error('#root not found in index.html')
    console.error('[EFH]', err)
    document.body.innerHTML = '<h1 style="color:red;padding:2rem">FATAL: #root element not found</h1>'
    throw err
  }
  console.log('[EFH] Root element found')

  let App: React.FC
  try {
    console.log('[EFH] Importing App...')
    const appModule = await import('./App')
    App = appModule.default
    if (!App) {
      throw new Error('App default export missing - check that App.jsx exports default')
    }
    console.log('[EFH] App imported successfully')
  } catch (e) {
    console.error('[EFH] Failed to import App:', e)
    ReactDOM.createRoot(rootEl).render(<BootError err={e} />)
    return
  }

  try {
    console.log('[EFH] Rendering React app...')
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    console.log('[EFH] React app rendered successfully')
  } catch (e) {
    console.error('[EFH] React render failed:', e)
    ReactDOM.createRoot(rootEl).render(<BootError err={e} />)
  }
}

start().catch(err => {
  console.error('[EFH] Bootstrap failed:', err)
  document.body.innerHTML = `<div style="padding:2rem;font-family:system-ui"><h1 style="color:red">Bootstrap Failed</h1><pre>${String(err)}</pre></div>`
})
