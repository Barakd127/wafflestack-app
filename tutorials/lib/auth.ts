/**
 * Tutorial login helper — drives the StudyHub LoginScreen with the human cursor.
 * Reuses the QA test account (set QA_TEST_PASSWORD before recording).
 */
import type { Page } from '@playwright/test';
import { humanType, humanClick, beat } from './cursor';

const USER = {
  username: 'qa-test-user',
  password: process.env.QA_TEST_PASSWORD ?? '',
};

/** Navigate to /#study, fill the login form like a human, land in StudyHub home. */
export async function tutorialLogin(page: Page): Promise<void> {
  await page.goto('/#study');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('form').waitFor({ state: 'visible', timeout: 25_000 });
  await beat(page, 700);

  const username = page.locator('input:not([type="password"]):not([type="hidden"])').first();
  const password = page.locator('input[type="password"]').first();

  await humanType(page, username, USER.username);
  await humanType(page, password, USER.password);
  await beat(page, 400);

  // Submit button "כניסה →"
  await humanClick(page, page.locator('form button[type="submit"], form button').last());

  // Wait for the auth form to disappear = logged in
  await page.locator('form').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => {});
  await beat(page, 900);
}

export const TUTORIAL_NEEDS_AUTH = !process.env.QA_TEST_PASSWORD;
