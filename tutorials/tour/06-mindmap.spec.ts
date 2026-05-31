/**
 * Feature tour 06 — Mind-map canvas.
 * Opens the mind-map from the sidebar and pans/zooms the tidy-tree.
 */
import { test } from '@playwright/test';
import { installCursor, humanClick, humanMove, beat } from '../lib/cursor';
import { tutorialLogin, TUTORIAL_NEEDS_AUTH } from '../lib/auth';

test('06 — mind-map canvas', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
  await installCursor(page);
  await tutorialLogin(page);

  // Sidebar → "מפת הלמידה שלי" (learning map / mindmap)
  await humanClick(page, page.getByRole('button', { name: /מפת הלמידה שלי|מפת חשיבה|מפה/ }).first());
  await beat(page, 2500); // iframe loads

  // The mindmap renders in an iframe — pan across it with the cursor
  await humanMove(page, page.locator('body'), 600);
  for (const [x, y] of [[700, 400], [1100, 500], [900, 700], [600, 450]] as const) {
    await page.mouse.move(x, y, { steps: 30 });
    await beat(page, 900);
  }
  await beat(page, 1500);
});
