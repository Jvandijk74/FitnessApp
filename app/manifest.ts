import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Endurance Coach',
    short_name: 'Coach',
    description: 'Fixed-cadence training and strength logging.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0b1220',
    theme_color: '#0ea5e9',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      }
    ]
  };
}
