/**
 * Feature tour 05 — Lesson / theory screen.
 * Opens a topic's theory (תיאוריה) and scrolls through the lesson content.
 */
import { test } from '@playwright/test';
import { installCursor, humanClick, beat } from '../lib/cursor';
import { tutorialLogin, TUTORIAL_NEEDS_AUTH } from '../lib/auth';

test('05 — lesson / theory', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
  await installCursor(page);
  await tutorialLogin(page);

  await humanClick(page, page.getByRole('button', { name: /אזור למידה/ }).first());
  await beat(page, 1200);
  await humanClick(page, page.getByText(/סטטיסטיקה א/).first());
  await beat(page, 1200);

  // Click "תיאוריה" (theory) on the first topic
  await humanClick(page, page.getByRole('button', { name: /תיאוריה/ }).first());
  await beat(page, 1800);

  // Scroll through the lesson
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 500);
    await beat(page, 1400);
  }
  await beat(page, 1200);
});
