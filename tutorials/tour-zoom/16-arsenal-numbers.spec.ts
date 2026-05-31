/**
 * Feature tour 16 — Arsenal: add a formula with ACTUAL NUMBERS plugged in.
 * Instead of a symbolic formula, this adds a worked numeric example of the mean:
 *   x̄ = (80 + 70 + 60) / 3 = 70
 * showing how a student saves a concrete computed result to their arsenal.
 */
import { test } from '@playwright/test';
import { installCursor, humanClick, humanType, beat } from '../lib/cursor';
import { tutorialLogin, TUTORIAL_NEEDS_AUTH } from '../lib/auth';
import { activateAdmin } from '../lib/admin';

test('16 — arsenal: add a numeric mean formula', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
  await installCursor(page);
  await tutorialLogin(page);
  await activateAdmin(page);

  await humanClick(page, page.getByRole('button', { name: /הארסנל שלי|ארסנל/ }).first());
  await beat(page, 1600);

  await humanClick(page, page.getByRole('button', { name: /הוסף חדש/ }).first());
  await beat(page, 900);
  await humanClick(page, page.getByRole('button', { name: /נוסחה/ }).first());
  await beat(page, 800);

  // Label with the concrete example
  const label = page.getByPlaceholder(/שם הנוסחה|תווית|בעברית/).first();
  if (await label.count() > 0) await humanType(page, label, 'ממוצע של 80, 70, 60');
  await beat(page, 500);

  // Formula field — plug in actual numbers: x̄ = (80+70+60)/3 = 70
  const mathField = page.locator('math-field, [contenteditable]').first();
  if (await mathField.count() > 0) {
    await humanClick(page, mathField);
    await page.evaluate(() => {
      const mf: any = document.querySelector('math-field');
      const val = '\\bar{x}=\\frac{80+70+60}{3}=70';
      if (mf && typeof mf.setValue === 'function') mf.setValue(val);
      else if (mf) mf.value = val;
    });
    await beat(page, 1300);
  }

  // Explanation (optional) — type a short note
  const explain = page.getByPlaceholder(/הסבר|חופשי על הנוסחה/).first();
  if (await explain.count() > 0) await humanType(page, explain, 'סכום הערכים חלקי מספרם → 210 / 3 = 70');
  await beat(page, 600);

  // Topic = ממוצע if available
  const topic = page.locator('select').first();
  if (await topic.count() > 0) {
    await topic.selectOption({ label: /ממוצע/ as unknown as string }).catch(async () => { await topic.selectOption({ index: 1 }).catch(() => {}); });
    await beat(page, 600);
  }

  await humanClick(page, page.getByRole('button', { name: /שמור לארסנל|שמור/ }).first());
  await beat(page, 2400); // the numeric formula card appears in the arsenal
});
