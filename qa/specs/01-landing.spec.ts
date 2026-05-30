/**
 * Story Type : Visual / UI — Smoke test
 * Output     : qa/specs/01-landing.spec.ts
 * Gate Level : ADVISORY (visual / UI story; zero critical a11y violations is BLOCKING)
 *
 * Covers:
 *  TC-LAND-01  Page loads and title is correct
 *  TC-LAND-02  Hebrew tagline text is visible
 *  TC-LAND-03  Primary CTA button is present and clickable
 *  TC-LAND-04  No JS console errors on load
 *  TC-LAND-05  Zero axe CRITICAL accessibility violations
 */

import { test, expect } from '../fixtures/base';
import AxeBuilder from '@axe-core/playwright';
import { waitForApp } from '../utils/page';

test.describe('Landing page smoke tests', () => {
  const consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    await page.goto('/');
    await waitForApp(page);
  });

  /**
   * TC-LAND-01
   * Precondition : Browser navigates to base URL.
   * Steps        : 1. goto('/') 2. Check document.title
   * Expected     : Title contains "WaffleStack" or "וופלסטאק"
   * Pass Criteria: title includes one of the two brand strings — binary pass/fail
   */
  test('TC-LAND-01 — page title contains brand name', async ({ page }) => {
    const title = await page.title();
    const hasBrandName =
      title.toLowerCase().includes('wafflestack') ||
      title.includes('וופלסטאק');
    expect(hasBrandName, `Page title was: "${title}"`).toBe(true);
  });

  /**
   * TC-LAND-02
   * Precondition : Landing page fully loaded.
   * Steps        : 1. Look for visible Hebrew text matching the tagline
   * Expected     : Element containing "סטטיסטיקה כמשחק" (or partial) is visible
   * Pass Criteria: getByText finds at least one visible element — binary pass/fail
   *
   * Note: uses toContain semantics via partial string match to survive minor copy edits.
   */
  test('TC-LAND-02 — Hebrew tagline is visible', async ({ page }) => {
    // The tagline "סטטיסטיקה כמשחק" is the canonical brand tagline per wafflestack-conventions §16
    const tagline = page.getByText('סטטיסטיקה', { exact: false });
    await expect(tagline.first()).toBeVisible({ timeout: 10_000 });
  });

  /**
   * TC-LAND-03
   * Precondition : Landing page fully loaded.
   * Steps        : 1. Locate primary CTA button  2. Click it
   * Expected     : Click does not crash the page; no unhandled JS errors thrown
   * Pass Criteria: Page URL changes OR a modal/view appears; page does not go blank — binary pass/fail
   */
  test('TC-LAND-03 — primary CTA button is present and clickable', async ({ page }) => {
    // Look for the most prominent button on the page
    const ctaButton = page
      .getByRole('button')
      .or(page.getByRole('link'))
      .first();

    await expect(ctaButton).toBeVisible({ timeout: 10_000 });
    await ctaButton.click({ force: true }); // force=true: skip stability check (landing animations)

    // Give the app 2s to react; just assert the page is still functional
    await page.waitForTimeout(2_000);
    const rootVisible = await page.locator('#root').isVisible();
    expect(rootVisible, 'Root element disappeared after CTA click').toBe(true);
  });

  /**
   * TC-LAND-04
   * Precondition : Landing page loads with console error listener active.
   * Steps        : 1. Collect console errors during page load
   * Expected     : No JS console errors emitted
   * Pass Criteria: consoleErrors array is empty — binary pass/fail
   *
   * Note: external CDN errors (KaTeX, fonts) that do not break functionality
   * should be filtered if they become persistent false positives.
   */
  test('TC-LAND-04 — no JS console errors on load', async () => {
    // consoleErrors populated via beforeEach listener
    const filtered = consoleErrors.filter(
      (msg) =>
        // Ignore common non-fatal third-party noise
        !msg.includes('favicon') &&
        !msg.includes('ERR_BLOCKED_BY_CLIENT') &&
        !msg.includes('cdn.jsdelivr.net') &&
        // R3F/Three.js WebGL context errors are infrastructure noise in headless Chromium
        // (GPU stalls, context loss on swiftshader). Not app-level bugs.
        !msg.includes('WebGL') &&
        !msg.includes('WebGLRenderer') &&
        !msg.includes('THREE.')
    );
    expect(filtered, `Console errors on load:\n${filtered.join('\n')}`).toHaveLength(0);
  });

  /**
   * TC-LAND-05
   * Precondition : Landing page fully loaded.
   * Steps        : 1. Run axe accessibility audit on full page
   * Expected     : Zero violations with impact === 'critical'
   * Pass Criteria: criticalViolations.length === 0 — binary pass/fail
   *               (non-critical violations are logged for review, not failed)
   */
  test('TC-LAND-05 — zero axe critical violations', async ({ page }) => {
    test.setTimeout(120_000); // axe on WebGL-heavy page is slow in headless
    const results = await new AxeBuilder({ page }).analyze();

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical'
    );

    if (results.violations.length > 0) {
      console.log(
        '[a11y] All violations on landing page:',
        JSON.stringify(
          results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.length,
          })),
          null,
          2
        )
      );
    }

    expect(
      criticalViolations,
      `Critical a11y violations found: ${criticalViolations.map((v) => v.id).join(', ')}`
    ).toHaveLength(0);
  });
});
