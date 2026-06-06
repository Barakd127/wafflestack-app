/**
 * Story Type : 3D city (Godot) — smoke + visual regression
 * Gate Level : BLOCKING on boot failure; ADVISORY on visuals
 *
 * The WaffleStack 3D city is a Godot web build rendered to a <canvas> inside an
 * iframe (public/godot/). Its in-game UI (the build palette, category chips,
 * building cards) is drawn by Godot to the canvas — it is NOT in the DOM, so
 * Playwright cannot assert on element overlap. What we CAN do, and what this
 * spec does:
 *   - confirm the Godot iframe/canvas mounts and boots,
 *   - fail on hard boot errors in the console (wasm/pck load failures),
 *   - capture a full-page screenshot each run for visual regression review
 *     (e.g. the build-palette overlap that DOM checks can't see).
 *
 * Requires auth (QA_TEST_PASSWORD) — the city lives behind the sidebar
 * "העולם שלי" entry in StudyHub.
 */
import { test, expect } from '../fixtures/base';
import { loginAsTestUser } from '../utils/auth';

const NEEDS_AUTH = !process.env.QA_TEST_PASSWORD;

test.describe('3D city (Godot)', () => {
  test('TC-CITY-01 — city boots + screenshot for visual review', async ({ page }) => {
    test.skip(NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
    test.setTimeout(120_000);

    const hardErrors: string[] = [];
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      const t = m.text();
      // Hard boot failures only — ignore the WebGL/GPU performance noise.
      if (/wasm|\.pck|failed to (load|fetch)|abort\(|RuntimeError/i.test(t)) hardErrors.push(t);
    });

    await loginAsTestUser(page);
    await page.waitForTimeout(1500);

    // Sidebar → "העולם שלי" (my world / 3D city)
    await page.getByRole('button', { name: /העולם שלי|העיר|world/i }).first().click().catch(() => {});

    // Godot WASM boot — give it a long settle, then confirm a canvas exists.
    await page.waitForTimeout(12_000);
    const canvas = page.locator('iframe[src*="godot"]').or(page.locator('canvas'));
    await expect(canvas.first(), 'No Godot canvas/iframe mounted').toBeVisible({ timeout: 20_000 });

    // Visual-regression artifact (review the build-palette layout here).
    await page.screenshot({ path: 'qa/output/godot-city.png', fullPage: false });

    // Boot must not have thrown a hard load error.
    expect(hardErrors, `Godot hard boot errors:\n${hardErrors.join('\n')}`).toHaveLength(0);
  });
});
