/**
 * Service Worker Registration
 * Copy to: src/lib/register-sw.ts
 *
 * Call registerServiceWorker() in your main.tsx after app mounts.
 *
 * Note: If using vite-plugin-pwa, use registerSW() from 'virtual:pwa-register' instead.
 * This manual registration is for custom service worker setups.
 */

export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Every hour

          // Handle updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                  console.log('New content available; please refresh.');
                  // Optionally show a toast/notification to user
                  dispatchEvent(new CustomEvent('sw-update-available'));
                } else {
                  // Content cached for offline use
                  console.log('Content cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    });
  }
}

/**
 * Skip waiting and activate new service worker immediately
 * Call this when user clicks "Update" on your update notification
 */
export function skipWaiting(): void {
  navigator.serviceWorker.ready.then((registration) => {
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
  });
}

/**
 * Unregister all service workers (useful for debugging)
 */
export async function unregisterAll(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('All service workers unregistered');
  }
}

/**
 * Usage with vite-plugin-pwa (preferred):
 *
 * import { registerSW } from 'virtual:pwa-register';
 *
 * const updateSW = registerSW({
 *   onNeedRefresh() {
 *     // Show "Update available" toast
 *   },
 *   onOfflineReady() {
 *     // Show "Ready for offline" toast
 *   },
 * });
 *
 * // Call updateSW() when user clicks "Update"
 */
