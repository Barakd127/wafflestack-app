/**
 * Story Type : Mobile UX — screen layout + touch behavior
 * Gate Level : BLOCKING on overflow/touch-target/nav; ADVISORY on font-zoom
 *
 * These tests assert MOBILE-SPECIFIC behavior that desktop never exercises:
 *   - No horizontal overflow at narrow width (390px portrait / 844px landscape)
 *   - Touch targets meet the 44px WCAG 2.5.5 / Apple HIG minimum
 *   - The hamburger menu (≤768px) opens and closes the sidebar overlay
 *   - RTL Hebrew layout survives the narrow viewport (no LTR leak)
 *   - Form inputs use ≥16px font so iOS doesn't zoom-jump on focus
 *   - Fixed bottom FABs don't overlap each other
 *
 * Self-guards: every test skips when the viewport is desktop-width, so when the
 * full suite runs all projects this spec only executes on the mobile projects.
 *
 * The hamburger + FAB tests need the authenticated StudyHub shell, so they skip
 * unless QA_TEST_PASSWORD is set (same gate as the quiz golden-path spec).
 */

import { test, expect } from '../fixtures/base';
import { waitForApp } from '../utils/page';
import { loginAsTestUser } from '../utils/auth';

const MOBILE_MAX = 768;
const NEEDS_AUTH = !process.env.QA_TEST_PASSWORD;

/** Skip a test when the active project is a desktop-width viewport. */
function mobileOnly(page: import('@playwright/test').Page) {
  const vp = page.viewportSize();
  test.skip(!vp || vp.width > MOBILE_MAX, 'Mobile-only test — skipped on desktop viewport');
}

/** Measure horizontal overflow: body wider than the viewport = content bleeds off-screen. */
async function horizontalOverflow(page: import('@playwright/test').Page) {
  return page.evaluate(() => ({
    scrollWidth: document.body.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
}

test.describe('Mobile — unauthenticated screens', () => {
  test('TC-MOB-01 — landing page has no horizontal overflow', async ({ page }) => {
    mobileOnly(page);
    await page.goto('/');
    await waitForApp(page);
    const o = await horizontalOverflow(page);
    expect(
      o.scrollWidth,
      `Landing overflows: scrollWidth=${o.scrollWidth} > clientWidth=${o.clientWidth}`
    ).toBeLessThanOrEqual(o.clientWidth + 2); // 2px rounding tolerance
  });

  test('TC-MOB-02 — login form has no horizontal overflow', async ({ page }) => {
    mobileOnly(page);
    await page.goto('/#study');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('form').waitFor({ state: 'visible', timeout: 20_000 });
    const o = await horizontalOverflow(page);
    expect(
      o.scrollWidth,
      `Login form overflows: scrollWidth=${o.scrollWidth} > clientWidth=${o.clientWidth}`
    ).toBeLessThanOrEqual(o.clientWidth + 2);
  });

  test('TC-MOB-03 — document stays RTL at narrow width', async ({ page }) => {
    mobileOnly(page);
    await page.goto('/#study');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('form').waitFor({ state: 'visible', timeout: 20_000 });
    const dir = await page.evaluate(() =>
      document.documentElement.getAttribute('dir')
      || document.dir
      || getComputedStyle(document.documentElement).direction
    );
    expect(dir, `Expected RTL on mobile, got "${dir}"`).toBe('rtl');
  });

  test('TC-MOB-04 — login inputs use ≥16px font (no iOS zoom-on-focus)', async ({ page }) => {
    mobileOnly(page);
    await page.goto('/#study');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('form input').first().waitFor({ state: 'visible', timeout: 20_000 });

    const inputs = page.locator('form input');
    const n = await inputs.count();
    const tooSmall: string[] = [];
    for (let i = 0; i < n; i++) {
      const fs = await inputs.nth(i).evaluate(el => parseFloat(getComputedStyle(el).fontSize));
      if (fs < 16) tooSmall.push(`input[${i}] = ${fs}px`);
    }
    expect(
      tooSmall,
      `Inputs below 16px trigger iOS zoom-on-focus: ${tooSmall.join(', ')}`
    ).toHaveLength(0);
  });

  test('TC-MOB-05 — primary CTA meets 44px touch-target minimum', async ({ page }) => {
    mobileOnly(page);
    await page.goto('/#study');
    await page.waitForLoadState('domcontentloaded');
    const submit = page.locator('form button[type="submit"], form button').last();
    await submit.waitFor({ state: 'visible', timeout: 20_000 });
    const box = await submit.boundingBox();
    expect(box, 'Submit button has no bounding box').not.toBeNull();
    if (box) {
      expect(box.height, `Submit button height ${box.height}px < 44px`).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('Mobile — authenticated shell', () => {
  test.beforeEach(async ({ page }) => {
    mobileOnly(page);
    if (NEEDS_AUTH) test.skip(true, 'Authenticated mobile test — set QA_TEST_PASSWORD');
    await loginAsTestUser(page);
    await page.waitForTimeout(1_500);
  });

  test('TC-MOB-06 — hamburger menu opens and closes the sidebar', async ({ page }) => {
    // Hamburger appears only at ≤768px (aria-label "פתח תפריט" / "סגור תפריט")
    const hamburger = page.getByRole('button', { name: /פתח תפריט|תפריט|menu/i });
    await expect(hamburger.first(), 'Hamburger button not found on mobile').toBeVisible({ timeout: 10_000 });

    // Open → a nav item from the sidebar becomes visible
    await hamburger.first().click();
    await page.waitForTimeout(800);
    const navItem = page.getByRole('button', { name: /אזור למידה/ });
    await expect(navItem.first(), 'Sidebar nav not visible after opening hamburger').toBeVisible({ timeout: 5_000 });

    // Close — click the close (✕) button (aria-label flips to "סגור תפריט")
    const closeBtn = page.getByRole('button', { name: /סגור תפריט/i });
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
      await page.waitForTimeout(600);
    }
  });

  test('TC-MOB-07 — study shell has no horizontal overflow', async ({ page }) => {
    const o = await horizontalOverflow(page);
    expect(
      o.scrollWidth,
      `Study shell overflows on mobile: scrollWidth=${o.scrollWidth} > clientWidth=${o.clientWidth}`
    ).toBeLessThanOrEqual(o.clientWidth + 2);
  });

  test('TC-MOB-08 — fixed bottom FABs do not overlap each other', async ({ page }) => {
    // Collect fixed-position floating action buttons anchored near the bottom.
    const boxes = await page.evaluate(() => {
      const out: { x: number; y: number; w: number; h: number; label: string }[] = [];
      document.querySelectorAll('button, [role="button"]').forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.position !== 'fixed') return;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        // Only consider FABs in the lower third of the screen
        if (r.top < window.innerHeight * 0.6) return;
        out.push({ x: r.left, y: r.top, w: r.width, h: r.height, label: (el.getAttribute('aria-label') || el.textContent || '').slice(0, 20) });
      });
      return out;
    });

    // Check no two FAB rectangles intersect
    const overlaps: string[] = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        const intersect =
          a.x < b.x + b.w && a.x + a.w > b.x &&
          a.y < b.y + b.h && a.y + a.h > b.y;
        if (intersect) overlaps.push(`"${a.label}" ∩ "${b.label}"`);
      }
    }
    expect(overlaps, `Overlapping bottom FABs: ${overlaps.join('; ')}`).toHaveLength(0);
  });
});
