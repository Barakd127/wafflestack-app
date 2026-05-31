/**
 * Feature tour 03 — Course + topic selection.
 * home → learning area → course gate → topic selector.
 */
import { test } from '@playwright/test';
import { installCursor, humanMove, humanClick, beat } from '../lib/cursor';
import { tutorialLogin, TUTORIAL_NEEDS_AUTH } from '../lib/auth';

test('03 — course and topic selection', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
  await installCursor(page);
  await tutorialLogin(page);

  // Enter learning area
  await humanClick(page, page.getByRole('button', { name: /אזור למידה/ }).first());
  await beat(page, 1500);

  // Hover the course cards, then pick "סטטיסטיקה א'"
  const courseA = page.getByText(/סטטיסטיקה א/).first();
  await humanMove(page, courseA);
  await beat(page, 900);
  await humanClick(page, courseA);
  await beat(page, 1600);

  // Topic selector — pan across a few topics
  const topics = page.getByText(/הסתברות|ממוצע|חציון|התפלגות/);
  const n = Math.min(await topics.count(), 3);
  for (let i = 0; i < n; i++) {
    await humanMove(page, topics.nth(i));
    await beat(page, 700);
  }
  await beat(page, 1200);
});
