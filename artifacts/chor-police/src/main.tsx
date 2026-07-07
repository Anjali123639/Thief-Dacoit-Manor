import { createRoot } from 'react-dom/client';
import { Component, type ReactNode } from 'react';

import App from './App';
import './index.css';

class RootErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#1a0533',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'sans-serif',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ color: '#F5A623', marginBottom: 12 }}>
            App failed to start
          </h1>
          <pre
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '1.5rem',
              maxWidth: 600,
              whiteSpace: 'pre-wrap',
              fontSize: 14,
              lineHeight: 1.6,
              color: '#ffd',
              textAlign: 'left',
            }}
          >
            {error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
