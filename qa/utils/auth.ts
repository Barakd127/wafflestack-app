/**
 * QA Auth helpers
 * Wire up when specs need authenticated state (e.g. learningStore sync, canvas persistence).
 *
 * Usage:
 *   import { loginAsTestUser } from '../utils/auth';
 *   test.beforeEach(async ({ page }) => { await loginAsTestUser(page); });
 */

import type { Page } from '@playwright/test';

// Test account — create this user in Supabase auth with a stable password
// Uses synthetic email format per wafflestack convention (username@wafflestack.app)
const TEST_USER = {
  username: 'qa-test-user',
  password: 'QA_TEST_PASSWORD_REPLACE_ME', // Replace with actual test account password
};

/**
 * Fills and submits the WaffleStack login form.
 * Waits for the study/home view to confirm successful login.
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForSelector('#root', { timeout: 15_000 });

  // Look for sign-in form
  const usernameInput = page
    .getByLabel(/שם משתמש|username/i)
    .or(page.getByPlaceholder(/שם משתמש|username/i))
    .first();

  const passwordInput = page
    .getByLabel(/סיסמה|password/i)
    .or(page.getByPlaceholder(/סיסמה|password/i))
    .first();

  await usernameInput.fill(TEST_USER.username);
  await passwordInput.fill(TEST_USER.password);

  // Submit
  await page.getByRole('button', { name: /התחבר|sign in|login/i }).click();

  // Wait for auth to resolve — study view should appear
  await page.waitForSelector('[data-testid="study-view"], [class*="StudyHub"]', {
    timeout: 10_000,
  });
}

/**
 * Logs out the current user.
 */
export async function logout(page: Page): Promise<void> {
  const logoutBtn = page.getByRole('button', { name: /התנתק|sign out|logout/i });
  if (await logoutBtn.count() > 0) {
    await logoutBtn.click();
  }
}
