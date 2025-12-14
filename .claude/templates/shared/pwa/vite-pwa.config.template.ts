// Vite PWA Plugin Configuration
// Add to vite.config.ts plugins array

import { VitePWA } from 'vite-plugin-pwa';

export const pwaConfig = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'icons/*.png', 'robots.txt'],
  manifest: {
    name: '{{APP_NAME}}',
    short_name: '{{APP_SHORT_NAME}}',
    description: '{{APP_DESCRIPTION}}',
    theme_color: '#3b82f6',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait-primary',
    scope: '/',
    start_url: '/',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\./i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
    ],
  },
  devOptions: {
    enabled: true,
    type: 'module',
  },
});

// Usage in vite.config.ts:
// import { pwaConfig } from './vite-pwa.config';
// export default defineConfig({
//   plugins: [react(), pwaConfig],
// });
