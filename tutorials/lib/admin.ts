/**
 * Toggle the "מצב אדמין" / "אדמין פעיל" button at the bottom of the StudyHub sidebar.
 */
import type { Page } from '@playwright/test';
import { humanClick, beat } from './cursor';

export async function activateAdmin(page: Page): Promise<void> {
  const adminBtn = page.getByRole('button', { name: /מצב אדמין|אדמין/ }).first();
  if (await adminBtn.count() > 0) {
    await humanClick(page, adminBtn);
    await beat(page, 1200);
  }
}
