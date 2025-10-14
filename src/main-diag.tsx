import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import ReactWorking from './diagnostics/ReactWorking'
import { ErrorBoundary } from './diagnostics/ErrorBoundary'
import { SuspenseFallback } from './diagnostics/safeLazy'
import './diagnostics/monitor'

const wantsDiag =
  new URLSearchParams(location.search).get('diag') === '1' ||
  (typeof localStorage !== 'undefined' && localStorage.getItem('efh_diag') === '1') ||
  (import.meta as any).env?.VITE_DIAG_MODE === '1'

// Lazy load the full app
const App = lazy(() => import('./App').catch(err => {
  console.error('[EFH] Failed to import full App, falling back to diagnostics:', err)
  return { default: ReactWorking }
}))

const Root = () => (
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<SuspenseFallback />}>
        {wantsDiag ? <ReactWorking /> : <App />}
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
)

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
