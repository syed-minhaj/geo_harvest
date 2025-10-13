import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Geo Harvest',
    short_name: 'GeoHarvest',
    description: 'GeoHarvest is a web application that allows users monitor their fields using satellite imagery.',
    start_url: '/app/fields',
    display: 'standalone',
    background_color: '#F8FDFB',
    theme_color: '#F8FDFB',
    icons: [
      {
        src: '/ico.svg',
        sizes:"any",
        type: 'image/svg+xml',
      },
    ],
  }
}