import { VitePWA } from "vite-plugin-pwa";

/**
 * PWA Configuration for Vite
 *
 * Usage:
 *   import { pwaConfig } from './vite-pwa.config';
 *   export default defineConfig({
 *     plugins: [react(), pwaConfig],
 *   });
 */
export const pwaConfig = VitePWA({
  registerType: "autoUpdate",
  includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],

  manifest: {
    name: "{{APP_NAME}}",
    short_name: "{{APP_NAME}}",
    description: "{{APP_NAME}} - A Progressive Web App",
    theme_color: "#3b82f6",
    background_color: "#ffffff",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    start_url: "/",
    icons: [
      {
        src: "icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },

  workbox: {
    // Cache static assets
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],

    // Runtime caching for API calls
    runtimeCaching: [
      {
        // Cache API responses
        urlPattern: /^https:\/\/.*\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60, // 1 hour
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        // Cache images
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "image-cache",
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
  },
});
