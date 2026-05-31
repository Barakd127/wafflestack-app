/**
 * Feature tour 08 — Arsenal (saved formulas / notes).
 * Opens "הארסנל שלי" from the sidebar and pans the collection.
 */
import { test } from '@playwright/test';
import { installCursor, humanClick, beat } from '../lib/cursor';
import { tutorialLogin, TUTORIAL_NEEDS_AUTH } from '../lib/auth';

test('08 — arsenal', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
  await installCursor(page);
  await tutorialLogin(page);

  await humanClick(page, page.getByRole('button', { name: /הארסנל שלי|ארסנל/ }).first());
  await beat(page, 2000);

  for (let i = 0; i < 2; i++) {
    await page.mouse.wheel(0, 450);
    await beat(page, 1300);
  }
  await beat(page, 1500);
});
