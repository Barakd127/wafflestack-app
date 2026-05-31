/**
 * Feature tour 04 — Live quiz (the core loop).
 * Drives into a practice session, answers a multiple-choice question, shows
 * the correct/incorrect feedback, advances.
 */
import { test } from '@playwright/test';
import { installCursor, humanMove, humanClick, beat } from '../lib/cursor';
import { tutorialLogin, TUTORIAL_NEEDS_AUTH } from '../lib/auth';

test('04 — quiz: answer + feedback', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
  await installCursor(page);
  await tutorialLogin(page);

  // Navigate into a live quiz
  await humanClick(page, page.getByRole('button', { name: /אזור למידה/ }).first());
  await beat(page, 1200);
  await humanClick(page, page.getByText(/סטטיסטיקה א/).first());
  await beat(page, 1200);
  await humanClick(page, page.getByRole('button', { name: /תרגול/ }).first());
  await beat(page, 1200);

  // QuizIntroCard — pick a difficulty, then start
  const start = page.getByRole('button', { name: /התחל תרגול/ });
  await start.first().waitFor({ state: 'visible', timeout: 15_000 });
  await beat(page, 900);
  await humanClick(page, start.first());

  // Live question
  await page.getByText(/שאלה\s*\d+\s*\/\s*\d+/).first().waitFor({ state: 'visible', timeout: 15_000 });
  await beat(page, 1600);

  // Answer the first MC option
  const options = page.getByRole('button').filter({ hasText: /[א-ת0-9]/ });
  // The 4 answer chips contain a letter A–D; hover a couple then click one
  const answer = page.locator('button').filter({ hasText: /^\s*\d/ }).first();
  const target = (await answer.count()) > 0 ? answer : options.first();
  await humanMove(page, target);
  await beat(page, 700);
  await humanClick(page, target);
  await beat(page, 2000); // feedback / reveal shows

  // Advance to next question if a "next" control exists
  const next = page.getByRole('button', { name: /הבא|הבא ←|→ הבא/ });
  if (await next.count() > 0) { await humanClick(page, next.first()); await beat(page, 1600); }
});
