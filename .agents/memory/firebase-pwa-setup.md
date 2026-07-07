---
name: Firebase Vite PWA setup
description: How to wire Firebase + vite-plugin-pwa in the react-vite scaffold for installable web apps.
---

## Rule
For Firebase-first apps, skip OpenAPI/codegen entirely. All real-time data goes through Firestore listeners. Store Firebase config as VITE_FIREBASE_* env vars (non-secret — they're public-facing).

**Why:** Firebase config is intentionally public; security is enforced by Firestore rules, not by hiding the config. Putting them in shared env vars (not secrets) avoids the requestSecrets flow blocking the build.

## PWA Setup
1. `pnpm add -D vite-plugin-pwa` in the artifact package
2. Add `VitePWA({ registerType: 'autoUpdate', manifest: false, devOptions: { enabled: true } })` to vite.config.ts
3. Create `public/manifest.json` with name, icons, theme_color, display: standalone
4. Add `<link rel="manifest">`, `<meta name="theme-color">`, `<meta name="apple-mobile-web-app-capable">`, and `<link rel="apple-touch-icon">` to index.html
5. Copy the app icon to `public/` so it's served as a static asset

**How to apply:** Any time the user wants "install from browser" / "download as app" / PWA for an existing react-vite artifact.
