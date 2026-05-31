/**
 * Feature tour 14 — Split (mind-map + topics) → drill to ממוצע → add its formula.
 *
 * Flow:
 *   mind-map → fit → click "סטטיסטיקה תיאורית" → "מדדי מרכז" → "ממוצע" (each click
 *   zooms in + reveals children) → open the Formula Library (הוסף משוואה) → add the
 *   arithmetic-mean formula (x̄ = Σxᵢ/n) as a node → then split the screen so the
 *   topic-choosing study area sits beside the map.
 */
import { test } from '@playwright/test';
import { installCursor, humanClick, beat } from '../lib/cursor';
import { tutorialLogin, TUTORIAL_NEEDS_AUTH } from '../lib/auth';
import { activateAdmin } from '../lib/admin';

test('14 — split: mind-map drill to ממוצע + add formula', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
  test.setTimeout(180_000);
  await installCursor(page);
  await tutorialLogin(page);
  await activateAdmin(page);

  await humanClick(page, page.getByRole('button', { name: /מפת הלמידה שלי|מפת חשיבה|מפה/ }).first());
  await beat(page, 3500);

  const mm = page.frameLocator('iframe');

  // Defensive iframe helpers (force + timeout + swallow so nothing hangs)
  const tapBtn = async (title: string, waitAfter = 1500) => {
    const b = mm.locator(`button[title*="${title}"]`);
    if (await b.count().catch(() => 0) > 0) { await b.first().click({ force: true, timeout: 6000 }).catch(() => {}); await beat(page, waitAfter); }
  };
  // 1) FIRST split the screen — topic-choosing study area beside the map.
  await tapBtn('פצל מסך', 1400);
  const studyBeside = mm.locator('button[title*="אזור הלימוד לצד המפה"], [title*="אזור הלימוד"]')
    .or(mm.getByText(/אזור הלימוד/));
  if (await studyBeside.count() > 0) { await studyBeside.first().click({ force: true }).catch(() => {}); await beat(page, 4500); }

  // The split re-mounts the map iframe; re-bind to it and fit.
  const mm2 = page.frameLocator('iframe').first();
  const fit2 = mm2.locator('button:has-text("התאם"), button[title*="Fit"]');
  if (await fit2.count() > 0) { await fit2.first().click({ force: true }).catch(() => {}); await beat(page, 1800); }

  // 2) Expand the תיאורית branch for a drill feel (one reliable level).
  const tiyurit = mm2.locator('.node-div', { hasText: 'סטטיסטיקה תיאורית' });
  if (await tiyurit.count().catch(() => 0) > 0) { await tiyurit.first().click({ force: true, timeout: 6000 }).catch(() => {}); await beat(page, 2600); }
  // Try one more level into מדדי מרכז (best-effort)
  const merkaz = mm2.locator('.node-div', { hasText: 'מדדי מרכז' });
  if (await merkaz.count().catch(() => 0) > 0) { await merkaz.first().click({ force: true, timeout: 6000 }).catch(() => {}); await beat(page, 2400); }

  // 3) Open the Formula Library and add the arithmetic mean (x̄ = Σxᵢ/n).
  //    The first formula in the library is the תיאורית→מדדי מרכז arithmetic mean.
  const eqBtn = mm2.locator('button[title*="הוסף משוואה"]');
  if (await eqBtn.count().catch(() => 0) > 0) { await eqBtn.first().click({ force: true, timeout: 6000 }).catch(() => {}); await beat(page, 1600); }
  const addNode = mm2.locator('button', { hasText: /\+\s*Node/ });
  if (await addNode.count().catch(() => 0) > 0) { await addNode.first().click({ force: true, timeout: 6000 }).catch(() => {}); await beat(page, 2800); }
  await page.keyboard.press('Escape').catch(() => {});
  if (await fit2.count() > 0) { await fit2.first().click({ force: true }).catch(() => {}); await beat(page, 1500); }

  // Hold on the final split: map with the mean formula node + topic-choosing pane.
  await beat(page, 3500);
});
