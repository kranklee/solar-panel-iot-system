// Dynamic Open Graph image generated at the edge so social previews always reflect the current brand
// Rendered with the built in next/og ImageResponse, no external image binaries required
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Cem Besli portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0b0f1a 0%, #1f2937 60%, #4338ca 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          color: '#f5f5f7',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: '#0b0f1a',
              border: '2px solid #6366f1',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#ffffff'
            }}
          >
            C
          </div>
          <span style={{ opacity: 0.8 }}>cembesli.com</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 28, opacity: 0.7, margin: 0 }}>Software Engineer</p>
          <h1 style={{ fontSize: 128, fontWeight: 700, letterSpacing: -4, margin: 0 }}>
            Cem Besli<span style={{ color: '#6366f1' }}>.</span>
          </h1>
          <p style={{ fontSize: 32, opacity: 0.85, margin: 0 }}>
            Systems Builder and Full Stack Developer
          </p>
          <p style={{ fontSize: 22, opacity: 0.55, marginTop: 16 }}>
            Ottawa, Ontario, Canada
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 20, opacity: 0.7 }}>
          <span>Next.js</span>
          <span>TypeScript</span>
          <span>Supabase</span>
          <span>Pyodide</span>
          <span>Vercel</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
