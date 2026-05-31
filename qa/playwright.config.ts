import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  outputDir: './report',
  // 60s per test — R3F 3D landing takes ~15-20s to initialize in headless Chromium
  timeout: 60_000,
  retries: 1,

  reporter: [
    ['html', { outputFolder: 'report', open: 'never' }],
    ['json', { outputFile: 'report/results.json' }],
  ],

  use: {
    baseURL: 'https://wafflestack-app.vercel.app',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'he-IL',
    timezoneId: 'Asia/Jerusalem',
    // Keep WebGL enabled — the app's auth form and CTA are React overlays ON the
    // 3D canvas; disabling WebGL leaves the page blank. We accept the GPU stall
    // noise in exchange for a real browser environment.
    launchOptions: {
      args: ['--enable-unsafe-swiftshader'],
    },
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } },
    },
    {
      // Pure Chromium mobile emulation — no WebKit binary required
      name: 'chromium-mobile',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
      },
    },
  ],
});

// NOTE on landscape: phone-landscape width (e.g. 844px) exceeds the app's own
// mobile breakpoint (max-width: 768px), so landscape renders the desktop sidebar
// layout — already covered by chromium-desktop. A dedicated landscape project
// would only produce skips, so it is intentionally omitted.
