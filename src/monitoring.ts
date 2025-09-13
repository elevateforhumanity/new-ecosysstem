export function startMonitoring() {
  // Web Vitals (lightweight)
  import('web-vitals').then(({ onCLS, onFID, onLCP }) => {
    onCLS(console.log); onFID(console.log); onLCP(console.log)
  }).catch(() => {})
  // Sentry (optional; enable when DSN is present)
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (dsn) {
    import('@sentry/browser').then(Sentry => {
      Sentry.init({ dsn, tracesSampleRate: 0.1, environment: import.meta.env.MODE })
    }).catch(() => {})
  }
}
