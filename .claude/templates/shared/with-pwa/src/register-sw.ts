/**
 * Service Worker Registration
 *
 * Usage:
 *   import { registerSW } from './register-sw';
 *   registerSW();
 */

import { registerSW as viteRegisterSW } from "virtual:pwa-register";

export function registerSW() {
  const updateSW = viteRegisterSW({
    // Called when new content is available
    onNeedRefresh() {
      if (confirm("New content available. Reload?")) {
        updateSW(true);
      }
    },

    // Called when content has been cached for offline use
    onOfflineReady() {
      console.log("App ready to work offline");
    },

    // Called when registration fails
    onRegisterError(error) {
      console.error("SW registration error:", error);
    },
  });

  return updateSW;
}

/**
 * Check if app is running as PWA
 */
export function isRunningAsPWA(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Check if app is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function onConnectivityChange(
  callback: (online: boolean) => void
): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
