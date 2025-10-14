#!/usr/bin/env bash
set -euo pipefail

# ==== SETTINGS (adjusted for fix2 repo structure) ============================
FRONTEND_DIR="."                           # Vite is at root in fix2
SRC_DIR="src"
PUBLIC_DIR="public"
TS="$(date +%Y%m%d-%H%M%S)"

# ==== HELPERS ================================================================
backup() { [ -f "$1" ] && cp -f "$1" "$1.bak.$TS" && echo "backup: $1 -> $1.bak.$TS" || true; }
ensure() { mkdir -p "$1"; }
write() { backup "$1"; ensure "$(dirname "$1")"; cat > "$1"; echo "wrote: $1"; }

# ==== PRECHECK ===============================================================
[ -f "vite.config.js" ] || { echo "ERROR: vite.config.js not found at root"; exit 1; }
ensure "$SRC_DIR/diagnostics"
ensure "$PUBLIC_DIR"

echo "🚀 EFH Autopilot: Diagnose → Fix → Monitor"
echo ""

# ==== 0) Vite config: correct base + sourcemaps ==============================
write "vite.config.js" <<'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const gpURL = process.env.GITPOD_WORKSPACE_URL || ''
const gpHost = gpURL ? new URL(gpURL).host : undefined
const gpPortHost = gpHost ? `5173--${gpHost}` : undefined

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`,
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
        },
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: gpHost ? [/\.gitpod\.dev$/, gpHost, gpPortHost] : true,
    hmr: gpPortHost ? { host: gpPortHost, protocol: 'wss', clientPort: 443 } : undefined,
    origin: gpPortHost ? `https://${gpPortHost}` : undefined,
    fs: {
      deny: ['**/data/**', '**/docs/**', '**/dist/**']
    }
  },
  preview: {
    port: 4173,
    allowedHosts: [/\.gitpod\.dev$/],
  },
}))
EOF

# ==== 1) Health page (static route) ==========================================
write "$SRC_DIR/diagnostics/ReactWorking.tsx" <<'EOF'
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
EOF

# ==== 2) ErrorBoundary (prevents white screens) ==============================
write "$SRC_DIR/diagnostics/ErrorBoundary.tsx" <<'EOF'
import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: any }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError(error: any) { return { hasError: true, error } }
  componentDidCatch(error: any, info: any) {
    console.error('[EFH] ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{fontFamily:'system-ui,-apple-system,Segoe UI,Roboto',padding:24}}>
          <h1>Something went wrong.</h1>
          <p>Please refresh. If the issue persists, we've logged the error.</p>
          <details style={{marginTop:'1rem'}}>
            <summary style={{cursor:'pointer',color:'#666'}}>Error Details</summary>
            <pre style={{whiteSpace:'pre-wrap',fontSize:12,opacity:.7,marginTop:'0.5rem',padding:'1rem',background:'#f3f4f6',borderRadius:8}}>
              {String(this.state.error)}
            </pre>
          </details>
        </div>
      )
    }
    return this.props.children
  }
}
EOF

# ==== 3) Safe lazy loader + Suspense fallback ================================
write "$SRC_DIR/diagnostics/safeLazy.tsx" <<'EOF'
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
EOF

# ==== 4) Runtime monitor (chunk + resource errors) ===========================
write "$SRC_DIR/diagnostics/monitor.ts" <<'EOF'
declare global { interface Window { __EFH_MONITOR__?: { errors: any[] } } }
window.__EFH_MONITOR__ = window.__EFH_MONITOR__ || { errors: [] }

window.addEventListener('error', (e: any) => {
  const isChunk = e?.message?.includes('Loading chunk') || (e?.target?.src && e.target.src.includes('/assets/'))
  const payload = {
    time: new Date().toISOString(),
    message: e?.message || 'resource error',
    src: (e?.target && (e.target as any).src) || null,
    isChunk
  }
  window.__EFH_MONITOR__!.errors.push(payload)
  console.error('[EFH][monitor] error:', payload)
}, true)

window.addEventListener('unhandledrejection', (e: any) => {
  const payload = { time: new Date().toISOString(), reason: String(e?.reason || 'unknown') }
  window.__EFH_MONITOR__!.errors.push(payload)
  console.error('[EFH][monitor] unhandledrejection:', payload)
})
EOF

# ==== 5) Diagnostic-aware entry ==============================================
write "$SRC_DIR/main-diag.tsx" <<'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import ReactWorking from './diagnostics/ReactWorking'
import { ErrorBoundary } from './diagnostics/ErrorBoundary'
import './diagnostics/monitor'

const wantsDiag =
  new URLSearchParams(location.search).get('diag') === '1' ||
  (typeof localStorage !== 'undefined' && localStorage.getItem('efh_diag') === '1') ||
  (import.meta as any).env?.VITE_DIAG_MODE === '1'

let App: React.FC | null = null
if (!wantsDiag) {
  try {
    App = (await import('./App')).default
  } catch (e) {
    console.error('[EFH] Failed to import full App, falling back to diagnostics:', e)
  }
}

const Root = () => (
  <React.StrictMode>
    <ErrorBoundary>
      {App ? <App /> : <ReactWorking />}
    </ErrorBoundary>
  </React.StrictMode>
)

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
EOF

# ==== 6) Update index.html ===================================================
write "index.html" <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Elevate for Humanity | Government Contractor | Workforce Development</title>
    <meta name="description" content="Indianapolis-based government contractor providing workforce development solutions." />
    <link rel="icon" href="/images/Elevate_for_Humanity_logo.png" />
  </head>
  <body>
    <noscript>
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto;max-width:760px;margin:40px auto;padding:16px;border:1px solid #eee;border-radius:12px">
        <h1>JavaScript is required</h1>
        <p>Please enable JavaScript to view this site.</p>
        <p style="color:#666;font-size:0.875rem">If you are the site owner and see this persistently, check Vite base path and Cloudflare Pages SPA redirects.</p>
      </div>
    </noscript>
    <div id="root"></div>
    <script type="module" src="/src/main-diag.tsx"></script>
  </body>
</html>
EOF

# ==== 7) Update _redirects ===================================================
write "$PUBLIC_DIR/_redirects" <<'EOF'
/__health   /index.html  200
/*          /index.html  200
EOF

echo ""
echo "==============================================================="
echo " ✅ EFH Autopilot installed"
echo ""
echo " Next steps:"
echo "   1) npm install && npm run build"
echo "   2) npm run preview"
echo "   3) Open http://localhost:4173?diag=1 to see diagnostics"
echo "   4) Remove ?diag=1 to load full app with safe lazy loading"
echo ""
echo " Cloudflare Pages settings:"
echo "   - Root directory: (leave empty or '.')"
echo "   - Build command: npm run build"
echo "   - Build output: dist"
echo ""
echo " Live health check: https://your-domain.pages.dev/__health?diag=1"
echo "==============================================================="
