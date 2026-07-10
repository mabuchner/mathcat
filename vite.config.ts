/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

// Overridden by CI for PR preview deployments (e.g. /mathcat/pr-123/).
const base = process.env.MATHCAT_BASE ?? '/mathcat/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'MathCat',
        short_name: 'MathCat',
        description: 'A friendly mental-arithmetic practice game covering addition, subtraction, and multiplication, with cat picture rewards.',
        theme_color: '#6d28d9',
        background_color: '#6d28d9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The production service worker's scope (/mathcat/) also covers the
        // PR preview subfolders; without this, its navigation fallback would
        // serve the production index.html for preview URLs.
        navigateFallbackDenylist: [/\/pr-\d+\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cataas\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cat-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      // Count all source files, not just the ones tests happen to load.
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/test/**', 'src/main.tsx'],
      reporter: ['text', 'lcov'],
    },
  },
})
