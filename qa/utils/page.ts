/**
 * Shared page helpers for QA specs.
 */
import type { Page } from '@playwright/test';

/**
 * waitForApp — waits until the React app has mounted and rendered at least one child into #root.
 * Replaces bare `waitForSelector('#root')` which finds the empty div before hydration.
 */
export async function waitForApp(page: Page, timeout = 45_000): Promise<void> {
  // 'domcontentloaded' only — HTML parsed, scripts start executing.
  // Can't use 'load': large Godot .pck/.wasm preloads block it for 30+ seconds.
  // Can't use 'networkidle': R3F WebGL render loop never lets network go idle.
  await page.waitForLoadState('domcontentloaded', { timeout });
  // Wait for the auth form input OR the first #root child (canvas/shell),
  // whichever appears first. The input is the reliable signal that React
  // has fully rendered the landing page auth overlay.
  await Promise.race([
    page.locator('input').first().waitFor({ state: 'visible', timeout: 30_000 }),
    page.locator('#root > *').first().waitFor({ state: 'attached', timeout: 30_000 }),
  ]).catch(() => {});
  // Extra settle for 3D scene initialization after first render
  await page.waitForTimeout(3_000);
}
