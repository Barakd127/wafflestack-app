/**
 * Feature tour 01 — Landing page.
 * Scrolls through the marketing sections so a voiceover can pitch the product.
 */
import { test } from '@playwright/test';
import { installCursor, humanMove, beat } from '../lib/cursor';

async function smoothScroll(page: import('@playwright/test').Page, totalPx: number, durationMs = 2200) {
  const steps = Math.round(durationMs / 32);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, totalPx / steps);
    await page.waitForTimeout(durationMs / steps);
  }
}

test('01 — landing page tour', async ({ page }) => {
  await installCursor(page);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(4000); // let the 3D hero settle

  // Hero
  await beat(page, 1600);
  const cta = page.getByRole('link', { name: /התחל עכשיו|התחל/ }).or(page.getByRole('button', { name: /התחל/ }));
  if (await cta.count() > 0) { await humanMove(page, cta.first()); await beat(page, 900); }

  // Scroll through each marketing section with pauses
  for (let i = 0; i < 4; i++) {
    await smoothScroll(page, 700);
    await beat(page, 1500);
  }

  // Back to top
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await beat(page, 2000);
});
