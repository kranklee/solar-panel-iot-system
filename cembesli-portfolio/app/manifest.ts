// Web App Manifest enabling installability and PWA style branding
// Sets icons, theme colors, and launch parameters consistent with the dark default
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cem Besli Portfolio',
    short_name: 'Cem Besli',
    description: 'Production grade interactive portfolio for Cem Besli',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f1a',
    theme_color: '#0b0f1a',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }
    ]
  };
}
