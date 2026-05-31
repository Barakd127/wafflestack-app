// Playwright config for FEATURE-TOUR videos (no voiceover — recorded silent,
// voiceover added later). Each spec under ./tour produces one video.webm.
//
// Run:  npx playwright test --config=tutorials/tour.config.ts
// Out:  tutorials/output/tour/<spec-name>/video.webm
//
// Recorded against PROD so no local server is needed. Set QA_TEST_PASSWORD for
// the authenticated feature tours.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tour',
  timeout: 240_000,           // generous — tours are long, WebGL is slow
  retries: 0,                 // a half-recorded video is useless; fail clean instead
  workers: 1,                 // record one at a time (stable framerate)
  reporter: [['list']],
  outputDir: './output/tour',
  use: {
    baseURL: 'https://wafflestack-app.vercel.app',
    viewport: { width: 1920, height: 1080 },
    headless: true,
    locale: 'he-IL',
    timezoneId: 'Asia/Jerusalem',
    video: {
      mode: 'on',             // always record
      size: { width: 1920, height: 1080 },
    },
    // Keep WebGL alive in headless (R3F hero + Godot city) via SwiftShader.
    launchOptions: {
      args: ['--enable-unsafe-swiftshader', '--use-gl=swiftshader'],
    },
  },
  projects: [
    { name: 'tour', use: { browserName: 'chromium' } },
  ],
});
