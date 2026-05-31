/**
 * Feature tour 02 — Login / sign-in.
 * Shows the WaffleStack auth screen + a human-paced login.
 */
import { test } from '@playwright/test';
import { installCursor, humanMove, humanType, humanClick, beat } from '../lib/cursor';
import { TUTORIAL_NEEDS_AUTH } from '../lib/auth';

test('02 — login flow', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD to record the login tour');
  await installCursor(page);
  await page.goto('/#study');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('form').waitFor({ state: 'visible', timeout: 25_000 });
  await beat(page, 1400);

  // Show the login / register toggle
  const registerTab = page.getByRole('button', { name: /הרשמה/ });
  if (await registerTab.count() > 0) { await humanMove(page, registerTab.first()); await beat(page, 700); }
  const loginTab = page.getByRole('button', { name: /כניסה/ }).first();
  if (await loginTab.count() > 0) { await humanClick(page, loginTab); await beat(page, 500); }

  // Fill + submit
  await humanType(page, page.locator('input:not([type="password"]):not([type="hidden"])').first(), 'qa-test-user');
  await humanType(page, page.locator('input[type="password"]').first(), process.env.QA_TEST_PASSWORD || '');
  await beat(page, 500);
  await humanClick(page, page.locator('form button[type="submit"], form button').last());

  await page.locator('form').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => {});
  await beat(page, 2000);
});
