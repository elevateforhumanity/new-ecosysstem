import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('[EFH] ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto',
            padding: 24,
          }}
        >
          <h1>Something went wrong.</h1>
          <p>Please refresh. If the issue persists, we've logged the error.</p>
          <details style={{ marginTop: '1rem' }}>
            <summary
              style={{ cursor: 'pointer', color: 'var(--brand-text-muted)' }}
            >
              Error Details
            </summary>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                fontSize: 12,
                opacity: 0.7,
                marginTop: '0.5rem',
                padding: '1rem',
                background: '#f3f4f6',
                borderRadius: 8,
              }}
            >
              {String(this.state.error)}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
