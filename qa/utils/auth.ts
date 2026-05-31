/**
 * QA Auth helpers
 * Wire up when specs need authenticated state (e.g. learningStore sync, canvas persistence).
 *
 * Usage:
 *   import { loginAsTestUser } from '../utils/auth';
 *   test.beforeEach(async ({ page }) => { await loginAsTestUser(page); });
 */

import type { Page } from '@playwright/test';

// Test account — created in Supabase auth.
// Password comes from QA_TEST_PASSWORD env var (set when running tests).
const TEST_USER = {
  username: 'qa-test-user',
  password: process.env.QA_TEST_PASSWORD ?? '',
};

/**
 * Fills and submits the WaffleStack login form.
 * Waits for the study/home view to confirm successful login.
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  // /#study shows StudyHub auth gate directly — no 3D hero, no WebGL dependency
  await page.goto('/#study');
  await page.waitForLoadState('domcontentloaded');

  // Wait for auth form
  await page.locator('form').waitFor({ state: 'visible', timeout: 20_000 });

  // Fill username (type="text" or no type) and password
  const usernameInput = page.locator('input:not([type="password"]):not([type="hidden"])').first();
  const passwordInput = page.locator('input[type="password"]').first();

  await usernameInput.fill(TEST_USER.username);
  await passwordInput.fill(TEST_USER.password);

  // Submit via Enter — avoids button selector ambiguity with login/register toggles
  await passwordInput.press('Enter');

  // Wait up to 5s for either: form hidden (success) OR error message (failure)
  await page.waitForTimeout(5_000);

  // Check for error message — "שם משתמש או סיסמה שגויים" = wrong credentials
  const errorEl = page.locator('text=שגויים, text=שגוי, text=error, [style*="red"], [style*="#e"]');
  if (await errorEl.count() > 0) {
    const errorText = await errorEl.first().innerText().catch(() => 'unknown error');
    throw new Error(`Login failed — app shows error: "${errorText}". Check QA_TEST_PASSWORD env var and Supabase user.`);
  }

  // Check if form still visible (login pending or failed silently)
  const formVisible = await page.locator('form').isVisible();
  if (formVisible) {
    // Grab any visible text in the form area for diagnosis
    const formText = await page.locator('form').innerText().catch(() => '');
    throw new Error(`Login failed — form still visible after 5s. Form text: "${formText.substring(0, 200)}"`);
  }
  // Brief settle for quiz content to load
  await page.waitForTimeout(2_000);
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
