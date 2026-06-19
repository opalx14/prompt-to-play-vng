import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Echo Relay',
    short_name: 'Echo Relay',
    description: 'A deterministic isometric puzzle game about recording and cooperating with your own Echo.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080a15',
    theme_color: '#111429',
    orientation: 'any',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
