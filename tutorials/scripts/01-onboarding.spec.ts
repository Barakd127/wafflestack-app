/**
 * Playwright capture script for Video 01 — "התחלה ראשונה" (60s).
 *
 * Walks through the onboarding flow at the same pace as the matching
 * voiceover (tutorials/voiceovers/script-01.txt). Each `step()` block is
 * paced via `pause()` so the cursor lingers where the narration is.
 *
 * Recording:
 *   1. Start dev server in another terminal: `npm run dev`
 *   2. Run: `npx playwright test tutorials/scripts/01-onboarding.spec.ts --headed`
 *   3. ffmpeg captures the headed Chromium window (see Makefile).
 *
 * Headed required because we screen-record the visible window via ffmpeg
 * gdigrab/x11grab/avfoundation depending on platform. For headless,
 * Playwright's built-in video recorder works but produces low FPS.
 */
import { test, type Page, expect } from '@playwright/test'

// Use a stable test account so the demo always shows the same state.
const TEST_USER = 'demo_he'
const TEST_PASS = 'demo123456'

// Cursor smoothing: instead of jumping, drift over `ms` to feel natural.
async function smoothMove(page: Page, selector: string, ms = 600) {
  const box = await page.locator(selector).first().boundingBox()
  if (!box) return
  const target = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  const steps = Math.max(8, Math.round(ms / 40))
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    await page.mouse.move(target.x * t + 100 * (1 - t), target.y * t + 100 * (1 - t))
    await page.waitForTimeout(ms / steps)
  }
}

async function step(page: Page, label: string, fn: () => Promise<void>, pauseMs: number) {
  console.log(`[tutorial-01] ${label}`)
  await fn()
  await page.waitForTimeout(pauseMs)
}

test('tutorial-01-onboarding', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 1280, height: 720 })

  // === SCENE 1 — Landing (0:00-0:08) ===
  await step(page, 'open landing', async () => {
    await page.goto('http://localhost:3000/#landing')
  }, 3500)

  // === SCENE 2 — Hit signup (0:08-0:20) ===
  await step(page, 'click signup CTA', async () => {
    await smoothMove(page, '[href*="study"], button:has-text("התחל")')
    await page.goto('http://localhost:3000/#study')
  }, 2500)

  // === SCENE 3 — Fill signup form (0:20-0:30) ===
  await step(page, 'switch to register tab', async () => {
    const tab = page.getByRole('button', { name: /הרשמה/ })
    if (await tab.isVisible()) await tab.click()
  }, 1200)
  await step(page, 'fill form', async () => {
    const inputs = page.locator('input')
    if (await inputs.count() >= 3) {
      await inputs.nth(0).fill('Demo User')
      await inputs.nth(1).fill(TEST_USER)
      await inputs.nth(2).fill(TEST_PASS)
    }
  }, 2000)
  await step(page, 'submit', async () => {
    const submit = page.getByRole('button', { name: /צור חשבון|כניסה/ }).first()
    await submit.click()
  }, 3500)

  // === SCENE 4 — Home overview (0:30-0:42) ===
  await step(page, 'home tour', async () => {
    await smoothMove(page, 'text=דף הבית')
  }, 2500)
  await step(page, 'point at XP', async () => {
    await smoothMove(page, 'text=XP')
  }, 2000)

  // === SCENE 5 — Open courses (0:42-0:55) ===
  await step(page, 'click study area', async () => {
    await page.getByRole('button', { name: /אזור למידה/ }).click()
  }, 2500)
  await step(page, 'pick stat-A', async () => {
    await page.getByText(/סטטיסטיקה א/).click()
  }, 2500)

  // === SCENE 6 — Topic grid (0:55-1:00) ===
  await step(page, 'topic grid visible', async () => {
    await expect(page.getByText(/ממוצע/)).toBeVisible()
  }, 3000)
})
