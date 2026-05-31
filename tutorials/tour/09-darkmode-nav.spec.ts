/**
 * Feature tour 09 — Dark mode + sidebar navigation overview.
 * Toggles the theme and walks the cursor through every sidebar destination.
 */
import { test } from '@playwright/test';
import { installCursor, humanClick, humanMove, beat } from '../lib/cursor';
import { tutorialLogin, TUTORIAL_NEEDS_AUTH } from '../lib/auth';

test('09 — dark mode + navigation', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
  await installCursor(page);
  await tutorialLogin(page);
  await beat(page, 1000);

  // Toggle dark mode (moon/sun button, top of the shell)
  const themeBtn = page.getByRole('button', { name: /מצב כהה|מצב בהיר|dark|light/i }).first();
  if (await themeBtn.count() > 0) {
    await humanClick(page, themeBtn);
    await beat(page, 1800);
    await humanClick(page, themeBtn); // back to light
    await beat(page, 1400);
  }

  // Walk the sidebar destinations
  const navNames = [/דף הבית/, /אזור למידה/, /הארסנל שלי/, /מפת הלמידה שלי/, /העולם שלי/];
  for (const name of navNames) {
    const item = page.getByRole('button', { name });
    if (await item.count() > 0) {
      await humanMove(page, item.first());
      await beat(page, 800);
    }
  }
  await beat(page, 1500);
});
