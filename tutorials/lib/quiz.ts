/**
 * Drive from the post-login home into a LIVE quiz question (human cursor).
 *   home → אזור למידה → course (סטטיסטיקה א') → topic תרגול → התחל תרגול → live quiz
 */
import type { Page } from '@playwright/test';
import { humanClick, beat } from './cursor';

export async function startLiveQuiz(page: Page): Promise<void> {
  await humanClick(page, page.getByRole('button', { name: /אזור למידה/ }).first());
  await beat(page, 1300);
  await humanClick(page, page.getByText(/סטטיסטיקה א/).first());
  await beat(page, 1300);
  await humanClick(page, page.getByRole('button', { name: /תרגול/ }).first());
  await beat(page, 1300);

  const start = page.getByRole('button', { name: /התחל תרגול/ });
  await start.first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
  await beat(page, 800);
  await humanClick(page, start.first());

  await page.getByText(/שאלה\s*\d+\s*\/\s*\d+/).first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
  await beat(page, 1500);
}
