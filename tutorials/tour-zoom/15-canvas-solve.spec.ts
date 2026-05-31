/**
 * Feature tour 15 — Solve an exercise on the split-view canvas using a formula.
 *
 * Flow:
 *   start a live quiz → open the "קנבס" companion canvas beside the question →
 *   on the whiteboard, open the Formula Library and drop the mean formula, then
 *   type the worked numeric solution. Demonstrates working a problem out on the
 *   canvas with a real formula, side-by-side with the question.
 */
import { test } from '@playwright/test';
import { installCursor, humanClick, beat } from '../lib/cursor';
import { tutorialLogin, TUTORIAL_NEEDS_AUTH } from '../lib/auth';
import { startLiveQuiz } from '../lib/quiz';

test('15 — solve on split-view canvas with a formula', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
  test.setTimeout(180_000);
  await installCursor(page);
  await tutorialLogin(page);
  await startLiveQuiz(page);

  // Read the question for a beat
  await beat(page, 1800);

  // Open the "קנבס" companion panel (split: question | canvas)
  const canvasBtn = page.getByRole('button', { name: /קנבס/ });
  if (await canvasBtn.count() > 0) {
    await humanClick(page, canvasBtn.first());
    await beat(page, 3500); // whiteboard (mode=wb) iframe mounts
  }

  // The canvas is a whiteboard iframe (Excalidraw, mindmap.html?mode=wb).
  // Reliable way to write on Excalidraw: double-click the canvas to drop a text
  // element, then type. We write the worked solution to the mean question.
  const wb = page.frameLocator('iframe[src*="mode=wb"], iframe[src*="wb"]').first();
  const canvas = wb.locator('canvas').first();

  if (await canvas.count().catch(() => 0) > 0) {
    // Line 1: the formula
    await canvas.dblclick({ position: { x: 340, y: 90 }, timeout: 8000 }).catch(() => {});
    await beat(page, 500);
    await page.keyboard.type('x̄ = (60 + 70 + 80) / 3', { delay: 70 }).catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});
    await beat(page, 1200);

    // Line 2: the result
    await canvas.dblclick({ position: { x: 340, y: 160 }, timeout: 8000 }).catch(() => {});
    await beat(page, 500);
    await page.keyboard.type('= 210 / 3 = 70', { delay: 70 }).catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});
    await beat(page, 1500);

    // Line 3: pick the matching answer note
    await canvas.dblclick({ position: { x: 340, y: 230 }, timeout: 8000 }).catch(() => {});
    await beat(page, 400);
    await page.keyboard.type('→ תשובה: 70 (D)', { delay: 70 }).catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});
    await beat(page, 2000);
  }

  // Let the worked solution sit beside the question
  await beat(page, 3000);
});
