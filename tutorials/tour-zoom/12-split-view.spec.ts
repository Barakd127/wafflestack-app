/**
 * Feature tour 12 — Split view.
 * From the mind-map toolbar, open "פצל מסך — בחר פאנל" and dock the study area
 * beside the map, showing the dual-pane workspace.
 */
import { test } from '@playwright/test';
import { installCursor, beat } from '../lib/cursor';
import { tutorialLogin, TUTORIAL_NEEDS_AUTH } from '../lib/auth';
import { activateAdmin } from '../lib/admin';

test('12 — split view', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
  test.setTimeout(150_000);
  await installCursor(page);
  await tutorialLogin(page);
  await activateAdmin(page);

  await page.getByRole('button', { name: /מפת הלמידה שלי|מפת חשיבה|מפה/ }).first().click();
  await beat(page, 3500);

  const mm = page.frameLocator('iframe');

  // Open the split menu (iframe toolbar button — click the frame element directly)
  const splitBtn = mm.locator('button[title*="פצל מסך"]');
  if (await splitBtn.count() > 0) {
    await splitBtn.first().click();
    await beat(page, 1400);
  }

  // Choose "הוסף את אזור הלימוד לצד המפה" (study area beside the map)
  const studyBeside = mm.locator('button[title*="אזור הלימוד לצד המפה"], [title*="אזור הלימוד"]')
    .or(mm.getByText(/אזור הלימוד לצד המפה|אזור לימוד/));
  if (await studyBeside.count() > 0) {
    await studyBeside.first().click().catch(() => {});
    await beat(page, 4000); // split layout mounts (map | study)
  }

  // Let the dual-pane workspace sit on screen
  await beat(page, 4000);
});
