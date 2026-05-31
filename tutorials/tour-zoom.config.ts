// Feature-tour videos at 125% ZOOM (like Ctrl+= once), full-screen output.
//
// HOW THE ZOOM WORKS: the app lays out at a 1536×864 viewport (a "zoomed-in"
// desktop width) and records 1:1 at that size (deviceScaleFactor 2 keeps it
// crisp). The convert step then upscales 1536×864 → 1920×1080, which is exactly
// 1.25× — i.e. a clean 125%-zoom 1080p video with NO letterbox gray (recording
// a smaller viewport into a larger video.size leaves gray, so we match them).
//
// Run:  npx playwright test --config=tutorials/tour-zoom.config.ts
// Out:  tutorials/output/tour-zoom/<spec-name>/video.webm   (1536×864)
//       → upscale to 1920×1080 in the mp4 convert step.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tour-zoom',
  timeout: 240_000,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  outputDir: './output/tour-zoom',
  use: {
    baseURL: 'https://wafflestack-app.vercel.app',
    viewport: { width: 1536, height: 864 },
    deviceScaleFactor: 2,           // crisp capture; downscaled into video.size
    headless: true,
    locale: 'he-IL',
    timezoneId: 'Asia/Jerusalem',
    video: {
      mode: 'on',
      size: { width: 1536, height: 864 },   // MATCHES viewport → fills, no gray
    },
    launchOptions: {
      args: ['--enable-unsafe-swiftshader', '--use-gl=swiftshader'],
    },
  },
  projects: [
    { name: 'tour-zoom', use: { browserName: 'chromium' } },
  ],
});
