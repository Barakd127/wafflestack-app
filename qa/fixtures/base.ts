/**
 * Shared Playwright fixture.
 * Wraps every test's page with a post-test navigation to about:blank.
 *
 * Why: WaffleStack's landing page runs React Three Fiber with a continuous
 * WebGL render loop. When Playwright tries to close the browser context after
 * a test, the render loop blocks teardown for 60+ seconds (GPU stall / swiftshader).
 * Navigating to about:blank first destroys the WebGL context gracefully,
 * letting context.close() complete in < 1s.
 */

import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    await use(page);
    // Destroy WebGL context before Playwright tears down the browser context
    try {
      await page.goto('about:blank', { timeout: 5_000 });
    } catch {
      // ignore — page may already be closed
    }
  },
});

export { expect };
