/**
 * Feature tour 11 — Mind-map: notebook toggle + every feature group.
 * The mind-map is an iframe (mindmap.html). Buttons carry Hebrew title= tooltips,
 * so we target them by title inside the frame.
 */
import { test } from '@playwright/test';
import { installCursor, humanClick, beat } from '../lib/cursor';
import { tutorialLogin, TUTORIAL_NEEDS_AUTH } from '../lib/auth';
import { activateAdmin } from '../lib/admin';

test('11 — mind-map: notebook toggle + features', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
  test.setTimeout(180_000);
  await installCursor(page);
  await tutorialLogin(page);
  await activateAdmin(page);

  // Open the mind-map ("מפת הלמידה שלי")
  await humanClick(page, page.getByRole('button', { name: /מפת הלמידה שלי|מפת חשיבה|מפה/ }).first());
  await beat(page, 3500); // iframe + tidy-tree render

  const mm = page.frameLocator('iframe');

  // Defensive frame click — force + short timeout + swallow. The mindmap iframe
  // can freeze on heavy re-renders (notebook switch), and a plain click() would
  // hang the whole test. force:true skips actionability waits; the timeout caps
  // any stall; .catch keeps the tour going.
  const tap = async (title: string, waitAfter = 1600) => {
    const btn = mm.locator(`button[title*="${title}"]`);
    if (await btn.count().catch(() => 0) > 0) {
      await btn.first().click({ force: true, timeout: 6000 }).catch(() => {});
      await beat(page, waitAfter);
    }
  };

  // 1) NOTEBOOK TOGGLE — switch to notebook, hold, switch back to map
  await tap('עבור בין מפת חשיבה למחברת', 3000); // → notebook
  await tap('עבור בין מפת חשיבה למחברת', 2600); // → back to map

  // 2) Walk the feature-group buttons (open each menu, pause, close with Esc)
  for (const title of [
    'הוסף אלמנטים למפה',
    'כלי תצוגה ופריסה',
    'תבניות סטטיסטיות',
    'הוסף משוואה (LaTeX)',
    'חיפוש (Ctrl+F)',
    'ייצוא, ייבוא, ניקוי',
    'סיור מודרך',
  ]) {
    await tap(title, 1500);
    await page.keyboard.press('Escape').catch(() => {});
    await beat(page, 500);
  }

  // 3) Zoom flourish
  await tap('התקרב', 700);
  await tap('התקרב', 700);
  await beat(page, 2000);
});
