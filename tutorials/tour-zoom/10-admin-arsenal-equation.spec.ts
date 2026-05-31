/**
 * Feature tour 10 — Admin mode + Arsenal: add the "mean" equation.
 * Activates admin, opens the Arsenal, adds a נוסחה (formula) labeled "ממוצע",
 * fills the MathLive field, picks a topic, saves to the arsenal.
 */
import { test } from '@playwright/test';
import { installCursor, humanClick, humanType, humanMove, beat } from '../lib/cursor';
import { tutorialLogin, TUTORIAL_NEEDS_AUTH } from '../lib/auth';
import { activateAdmin } from '../lib/admin';

test('10 — admin + arsenal: add mean equation', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
  await installCursor(page);
  await tutorialLogin(page);

  // Activate admin mode (bottom of sidebar)
  await activateAdmin(page);

  // Open "הארסנל שלי" (My Arsenal)
  await humanClick(page, page.getByRole('button', { name: /הארסנל שלי|ארסנל/ }).first());
  await beat(page, 1600);

  // Tour the category filter chips
  for (const cat of [/נוסחאות/, /טבלאות/, /הכל/]) {
    const chip = page.getByRole('button', { name: cat }).or(page.getByText(cat));
    if (await chip.count() > 0) { await humanMove(page, chip.first()); await beat(page, 600); }
  }

  // "+ הוסף חדש" → add-item dialog
  await humanClick(page, page.getByRole('button', { name: /הוסף חדש/ }).first());
  await beat(page, 1000);

  // Choose the נוסחה (formula) type
  await humanClick(page, page.getByRole('button', { name: /נוסחה/ }).first());
  await beat(page, 900);

  // Label it "ממוצע פשוט"
  const label = page.getByPlaceholder(/שם הנוסחה|תווית|בעברית/).first();
  if (await label.count() > 0) await humanType(page, label, 'ממוצע פשוט');
  await beat(page, 500);

  // Fill the MathLive formula field. Click it for the human beat, then set a
  // clean LaTeX value directly (typing LaTeX into MathLive is unreliable).
  const mathField = page.locator('math-field, [class*="ML__"], .mathlive, [contenteditable]').first();
  if (await mathField.count() > 0) {
    await humanClick(page, mathField);
    await page.evaluate(() => {
      const mf: any = document.querySelector('math-field');
      if (mf && typeof mf.setValue === 'function') mf.setValue('\\bar{x}=\\frac{1}{n}\\sum_{i=1}^{n} x_i');
      else if (mf) mf.value = '\\bar{x}=\\frac{1}{n}\\sum x_i';
    });
    await beat(page, 1200);
  }

  // Pick a topic if the dropdown is present
  const topic = page.locator('select').first();
  if (await topic.count() > 0) {
    await humanMove(page, topic);
    await topic.selectOption({ label: /ממוצע/ as unknown as string }).catch(async () => {
      await topic.selectOption({ index: 1 }).catch(() => {});
    });
    await beat(page, 700);
  }

  // Save to arsenal
  await humanClick(page, page.getByRole('button', { name: /שמור לארסנל|שמור/ }).first());
  await beat(page, 2200); // the new formula card appears in the arsenal
});
