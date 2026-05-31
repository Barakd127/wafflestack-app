/**
 * Feature tour 13 — Home screen: personalize-plan + scroll through all features.
 * Clicks the top "התחל" (personalize plan) banner button, then scrolls the home
 * screen top-to-bottom so the voiceover can walk through every card/section.
 */
import { test } from '@playwright/test';
import { installCursor, humanClick, humanMove, beat } from '../lib/cursor';
import { tutorialLogin, TUTORIAL_NEEDS_AUTH } from '../lib/auth';

async function smoothScroll(page: import('@playwright/test').Page, totalPx: number, durationMs = 2000) {
  const steps = Math.round(durationMs / 32);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, totalPx / steps);
    await page.waitForTimeout(durationMs / steps);
  }
}

test('13 — home: personalize plan + feature scroll', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
  await installCursor(page);
  await tutorialLogin(page);
  await beat(page, 1200);

  // Top banner "התאם תכנית אישית" → its "התחל ←" button (top-left of the content).
  const startBtn = page.getByRole('button', { name: /^\s*התחל/ }).first();
  if (await startBtn.count() > 0) {
    await humanMove(page, startBtn);
    await beat(page, 600);
    await humanClick(page, startBtn);
    await beat(page, 2200); // personalize-plan questionnaire opens

    // If a short questionnaire / modal opened, let it show, then close it to
    // return to the home screen (Escape or a close/back control).
    await page.keyboard.press('Escape').catch(() => {});
    await beat(page, 1200);
  }

  // Scroll the home screen top → bottom to reveal every feature card:
  // לימוד חומר, תרגול, progress track, לוח סיכונים (risk board), etc.
  for (let i = 0; i < 4; i++) {
    await smoothScroll(page, 600);
    await beat(page, 1500);
  }

  // Hover a couple of feature cards on the way back up
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await beat(page, 1800);
  for (const name of [/לימוד חומר|פתח מפת מושגים/, /המשך|תרגול/]) {
    const card = page.getByText(name).first();
    if (await card.count() > 0) { await humanMove(page, card); await beat(page, 800); }
  }
  await beat(page, 1500);
});
