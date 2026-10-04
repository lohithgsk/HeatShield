import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('HeatShield ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
          color: 'var(--text-primary)',
          padding: '24px',
          fontFamily: 'var(--font-sans)',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '540px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '32px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--semantic-red)' }}>
              Interface Initialization Notice
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
              A component error was captured during interface rendering. You can reset the session or reload to restore full operation.
            </p>
            <pre style={{
              background: 'var(--bg-card)',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '11px',
              color: 'var(--semantic-amber-lt)',
              overflowX: 'auto',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: 'var(--semantic-blue)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reload Platform
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
