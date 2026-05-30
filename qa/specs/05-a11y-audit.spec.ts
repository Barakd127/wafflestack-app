/**
 * Story Type : Accessibility audit — full axe sweep
 * Gate Level : BLOCKING on critical violations only
 *              Non-critical violations logged for review, not failed
 *
 * Covers:
 *  TC-A11Y-01  Landing page: zero axe CRITICAL violations
 *  TC-A11Y-02  Study/quiz view: zero axe CRITICAL violations
 *  TC-A11Y-03  Summary report logged to console for all violations across both views
 */

import { test, expect } from '../fixtures/base';
import AxeBuilder from '@axe-core/playwright';
import { waitForApp } from '../utils/page';

interface ViolationSummary {
  id: string;
  impact: string | undefined;
  description: string;
  nodeCount: number;
}

function summarize(violations: Parameters<typeof Array.prototype.map>[0] extends (v: infer V) => unknown ? V[] : never): ViolationSummary[] {
  return (violations as any[]).map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    nodeCount: v.nodes.length,
  }));
}

async function runAxeAndAssert(page: import('@playwright/test').Page, label: string) {
  const results = await new AxeBuilder({ page })
    // Exclude 3D canvas from accessibility tree analysis — WebGL canvas has no accessible role
    .exclude('canvas')
    .analyze();

  const critical = results.violations.filter((v) => v.impact === 'critical');
  const serious  = results.violations.filter((v) => v.impact === 'serious');
  const other    = results.violations.filter((v) => v.impact !== 'critical' && v.impact !== 'serious');

  if (results.violations.length > 0) {
    console.log(
      `\n[a11y:${label}] ${results.violations.length} violations total:`,
      `\n  CRITICAL : ${critical.length}`,
      `\n  SERIOUS  : ${serious.length}`,
      `\n  OTHER    : ${other.length}`,
      '\n  Details  :',
      JSON.stringify(summarize(results.violations as any), null, 2)
    );
  } else {
    console.log(`[a11y:${label}] ✓ Zero violations`);
  }

  expect(
    critical,
    `[${label}] Critical a11y violations: ${critical.map((v) => v.id).join(', ')}`
  ).toHaveLength(0);
}

test.describe('Accessibility audit', () => {
  // Axe analysis on a WebGL-heavy page is slow — override timeout for this suite
  test.setTimeout(90_000);

  /**
   * TC-A11Y-01
   * Page     : Landing (/)
   * Expected : Zero axe CRITICAL violations
   */
  test('TC-A11Y-01 — landing page: zero critical a11y violations', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    // Wait for fonts/content to settle before auditing
    await page.waitForTimeout(1_000);
    await runAxeAndAssert(page, 'landing');
  });

  /**
   * TC-A11Y-02
   * Page     : Study/quiz view (navigated via CTA)
   * Expected : Zero axe CRITICAL violations
   */
  test('TC-A11Y-02 — study/quiz view: zero critical a11y violations', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);

    // Attempt to navigate into the study view
    const studyCTA = page
      .getByRole('button', { name: /אזור למידה|למידה|learn|study|התחל/i })
      .or(page.getByRole('link', { name: /אזור למידה|למידה|learn|study|התחל/i }));

    if (await studyCTA.count() > 0) {
      await studyCTA.first().click({ force: true }); // animation in progress — force click
      await page.waitForTimeout(1_500);
    }

    await runAxeAndAssert(page, 'study-view');
  });
});
