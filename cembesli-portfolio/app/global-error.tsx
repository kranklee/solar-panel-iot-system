// Top level error boundary that catches errors thrown above the locale layout
// Provides a minimal self contained reset action so the site never goes blank
'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('global error', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 48,
          fontFamily: 'system-ui',
          background: '#0b0f1a',
          color: '#f5f5f7',
          minHeight: '100vh'
        }}
      >
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>Something went wrong.</h1>
        <p style={{ opacity: 0.7 }}>{error.message}</p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 24,
            padding: '10px 20px',
            borderRadius: 999,
            background: '#6366f1',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
