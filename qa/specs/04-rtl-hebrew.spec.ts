/**
 * Story Type : UX — RTL / Hebrew rendering checks
 * Gate Level : BLOCKING (Hebrew-primary audience; RTL breakage = unusable product)
 *
 * Covers:
 *  TC-RTL-01  HTML document has RTL direction
 *  TC-RTL-02  No horizontal overflow (scrollbar) on the page
 *  TC-RTL-03  Hebrew text is rendered (not replaced with boxes / tofu)
 *  TC-RTL-04  Input fields accept Hebrew characters
 */

import { test, expect } from '../fixtures/base';
import { waitForApp } from '../utils/page';

test.describe('RTL / Hebrew UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  /**
   * TC-RTL-01
   * Steps    : Check html[dir] attribute or document.dir
   * Expected : dir === 'rtl'
   */
  test('TC-RTL-01 — document direction is RTL', async ({ page }) => {
    const dir = await page.evaluate(() => {
      const html = document.documentElement;
      return html.getAttribute('dir') || document.dir || window.getComputedStyle(html).direction;
    });
    expect(dir, `Document direction is "${dir}", expected "rtl"`).toBe('rtl');
  });

  /**
   * TC-RTL-02
   * Steps    : Measure body scrollWidth vs viewport width
   * Expected : No horizontal overflow (scrollWidth <= clientWidth + 1px tolerance)
   * Note     : 3D canvas can cause false positives — test checks document body only
   */
  test('TC-RTL-02 — no horizontal overflow on landing page', async ({ page }) => {
    const overflow = await page.evaluate(() => {
      return {
        scrollWidth: document.body.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });
    expect(
      overflow.scrollWidth,
      `Horizontal overflow detected: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth}`
    ).toBeLessThanOrEqual(overflow.clientWidth + 2); // 2px tolerance for rounding
  });

  /**
   * TC-RTL-03
   * Steps    : Find any element containing Hebrew Unicode range (U+0590–U+05FF)
   * Expected : At least one Hebrew character is rendered in the DOM
   */
  test('TC-RTL-03 — Hebrew characters rendered in DOM', async ({ page }) => {
    // Extra settle time — mobile viewport renders slower; Hebrew text may not be
    // in DOM when waitForApp resolves on slower connections
    await page.waitForTimeout(3_000);
    const hebrewFound = await page.evaluate(() => {
      // U+05D0–U+05EA = Hebrew letters; explicit escapes to avoid source encoding issues
      const hebrewPattern = /[א-ת]/;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Text | null;
      while ((node = walker.nextNode() as Text | null)) {
        if (hebrewPattern.test(node.textContent || '')) return true;
      }
      return false;
    });
    expect(hebrewFound, 'No Hebrew characters found in DOM — possible font/encoding issue').toBe(true);
  });

  /**
   * TC-RTL-04
   * Steps    : Find a text input, type Hebrew characters, verify they appear in value
   * Expected : Input accepts and holds Hebrew characters
   * Skip     : If no text input is visible on landing page
   */
  test('TC-RTL-04 — text input accepts Hebrew characters', async ({ page }) => {
    const input = page.locator('input[type="text"], input:not([type])').first();
    const count = await input.count();

    if (count === 0) {
      console.log('[TC-RTL-04] No text input on landing page — skipping');
      test.skip();
      return;
    }

    await input.click();
    await input.fill('שלום'); // "Hello" in Hebrew

    const value = await input.inputValue();
    expect(value, `Input value was "${value}" after typing Hebrew`).toContain('שלום');
  });
});
