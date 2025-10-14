import React, { lazy } from 'react'

export const safeLazy = (importFn: () => Promise<any>, componentName: string) => {
  return lazy(() =>
    importFn().catch(err => {
      console.error(`[EFH] Failed to load ${componentName}:`, err)
      return {
        default: () => (
          <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <h2 style={{color: '#dc2626'}}>Component Load Error</h2>
            <p>Failed to load: <code style={{padding:'0.25rem 0.5rem',background:'#f3f4f6',borderRadius:4}}>{componentName}</code></p>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>{String(err?.message || err)}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{marginTop:'1rem',padding:'0.5rem 1rem',background:'#2563eb',color:'white',border:'none',borderRadius:6,cursor:'pointer'}}
            >
              Refresh Page
            </button>
          </div>
        )
      }
    })
  )
}

export const SuspenseFallback = () => (
  <div style={{padding:'2rem',textAlign:'center',fontFamily:'system-ui,-apple-system,sans-serif'}}>
    <div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>⏳</div>
    <div>Loading...</div>
  </div>
)
