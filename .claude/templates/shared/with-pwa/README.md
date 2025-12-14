# PWA Add-on

This add-on enables Progressive Web App features using vite-plugin-pwa and Workbox.

## Features

- Automatic service worker generation
- Offline support
- App manifest for installation
- Runtime caching for API calls
- Update prompts for new versions

## Setup

### 1. Install Dependencies

```bash
npm install vite-plugin-pwa workbox-window
```

### 2. Add to Vite Config

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { pwaConfig } from "./vite-pwa.config";

export default defineConfig({
  plugins: [react(), pwaConfig],
});
```

### 3. Register Service Worker

```typescript
// main.tsx
import { registerSW } from "./register-sw";

// Register after app renders
registerSW();
```

### 4. Add Icons

Place in `/public`:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `apple-touch-icon.png` (180x180)
- `favicon.ico`

### 5. Add Meta Tags

```html
<!-- index.html -->
<head>
  <meta name="theme-color" content="#3b82f6" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
</head>
```

## Customization

### Manifest

Edit `vite-pwa.config.ts` manifest section:
- `name` - Full app name
- `short_name` - Name on home screen
- `theme_color` - Browser UI color
- `background_color` - Splash screen background
- `icons` - App icons

### Caching Strategy

Edit `workbox.runtimeCaching`:
- `NetworkFirst` - Try network, fall back to cache
- `CacheFirst` - Try cache, fall back to network
- `StaleWhileRevalidate` - Serve cache, update in background

## Utilities

```typescript
import { isRunningAsPWA, isOnline, onConnectivityChange } from "./register-sw";

// Check if running as installed PWA
if (isRunningAsPWA()) {
  console.log("Running as PWA");
}

// Check connectivity
if (!isOnline()) {
  showOfflineBanner();
}

// Listen for connectivity changes
onConnectivityChange((online) => {
  if (online) {
    hideOfflineBanner();
  } else {
    showOfflineBanner();
  }
});
```

## Offline Page

For a custom offline page, add `/offline.html` to `/public` and configure in `vite-pwa.config.ts`:

```typescript
workbox: {
  navigateFallback: '/offline.html',
  navigateFallbackDenylist: [/^\/api/],
}
```
