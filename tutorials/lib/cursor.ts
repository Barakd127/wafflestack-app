/**
 * Synthetic human cursor for tutorial recordings.
 *
 * WHY: Playwright's video recorder captures the page content only — it does NOT
 * render the OS mouse pointer. So a tutorial recorded normally shows clicks
 * "happening" with no visible cursor. This module injects a DOM cursor that
 * follows the mouse, plus easing helpers that glide it like a human hand and
 * play a ripple on click.
 *
 * Usage:
 *   await installCursor(page)        // once, before navigation
 *   await humanMove(page, locator)   // glide to an element
 *   await humanClick(page, locator)  // glide + ripple + click
 *   await humanType(page, locator, 'text')
 *   await beat(page, 800)            // a readable pause
 */

import type { Page, Locator } from '@playwright/test';

/**
 * Inject the cursor element + a mousemove listener, re-applied on every
 * navigation via addInitScript so it survives page loads.
 */
export async function installCursor(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const ID = '__tutor_cursor__';
    function ensureCursor() {
      if (document.getElementById(ID)) return;
      const c = document.createElement('div');
      c.id = ID;
      c.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4 L6 22 L11 17 L14 24 L17.5 22.5 L14.5 15.5 L21 15.5 Z"
                fill="#1F3E6C" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>`;
      Object.assign(c.style, {
        position: 'fixed', top: '0px', left: '0px', zIndex: '2147483647',
        pointerEvents: 'none', transform: 'translate(-3px,-2px)',
        transition: 'transform 0.05s linear', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))',
        willChange: 'top,left',
      } as CSSStyleDeclaration);
      document.documentElement.appendChild(c);

      // Ripple element reused for clicks
      const r = document.createElement('div');
      r.id = ID + '_ripple';
      Object.assign(r.style, {
        position: 'fixed', zIndex: '2147483646', pointerEvents: 'none',
        width: '0px', height: '0px', borderRadius: '50%',
        border: '2px solid rgba(31,62,108,0.55)', opacity: '0',
        transform: 'translate(-50%,-50%)',
      } as CSSStyleDeclaration);
      document.documentElement.appendChild(r);

      window.addEventListener('mousemove', (e) => {
        const el = document.getElementById(ID);
        if (el) { el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px'; }
      }, { passive: true });

      // Exposed for the test to trigger a click ripple at a point
      (window as any).__tutorRipple = (x: number, y: number) => {
        const rp = document.getElementById(ID + '_ripple');
        const cur = document.getElementById(ID);
        if (cur) { cur.style.transform = 'translate(-3px,-2px) scale(0.8)'; setTimeout(() => { cur.style.transform = 'translate(-3px,-2px) scale(1)'; }, 120); }
        if (!rp) return;
        rp.style.left = x + 'px'; rp.style.top = y + 'px';
        rp.style.transition = 'none'; rp.style.width = '8px'; rp.style.height = '8px'; rp.style.opacity = '0.9';
        // next frame → expand + fade
        requestAnimationFrame(() => {
          rp.style.transition = 'width 0.4s ease-out, height 0.4s ease-out, opacity 0.4s ease-out';
          rp.style.width = '46px'; rp.style.height = '46px'; rp.style.opacity = '0';
        });
      };
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ensureCursor);
    } else {
      ensureCursor();
    }
    // Re-ensure shortly after load in case the app wipes the DOM on mount
    setTimeout(ensureCursor, 300);
    setTimeout(ensureCursor, 1200);
  });
}

let lastX = 640;
let lastY = 360;

/** Ease-in-out cubic for natural acceleration/deceleration. */
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Glide the mouse from its last position to (x,y) along an eased path. */
async function glideTo(page: Page, x: number, y: number, durationMs = 700): Promise<void> {
  const steps = Math.max(20, Math.round(durationMs / 16));
  const sx = lastX, sy = lastY;
  // Slight arc so the path isn't a dead-straight line
  const midX = (sx + x) / 2 + (Math.abs(y - sy) > 40 ? 30 : 0);
  const midY = (sy + y) / 2 - (Math.abs(x - sx) > 40 ? 24 : 0);
  for (let i = 1; i <= steps; i++) {
    const t = easeInOut(i / steps);
    // Quadratic bezier through the mid control point
    const u = 1 - t;
    const px = u * u * sx + 2 * u * t * midX + t * t * x;
    const py = u * u * sy + 2 * u * t * midY + t * t * y;
    await page.mouse.move(px, py);
    await page.waitForTimeout(durationMs / steps);
  }
  await page.mouse.move(x, y);
  lastX = x; lastY = y;
}

async function centerOf(locator: Locator): Promise<{ x: number; y: number }> {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  const box = await locator.boundingBox();
  if (!box) throw new Error('humanMove: target has no bounding box (not visible?)');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Glide the cursor to an element and settle. */
export async function humanMove(page: Page, locator: Locator, durationMs = 700): Promise<void> {
  const { x, y } = await centerOf(locator.first());
  await glideTo(page, x, y, durationMs);
  await page.waitForTimeout(120);
}

/** Glide to an element, play a click ripple, then actually click it. */
export async function humanClick(page: Page, locator: Locator, durationMs = 700): Promise<void> {
  const target = locator.first();
  const { x, y } = await centerOf(target);
  await glideTo(page, x, y, durationMs);
  await page.evaluate(([px, py]) => (window as any).__tutorRipple?.(px, py), [x, y]);
  await page.waitForTimeout(180);
  await target.click({ timeout: 10_000 }).catch(async () => {
    // Fallback to coordinate click if the element moved
    await page.mouse.click(x, y);
  });
  await page.waitForTimeout(250);
}

/** Glide to a field, click it, then type with human-ish per-key delay. */
export async function humanType(page: Page, locator: Locator, text: string, durationMs = 600): Promise<void> {
  await humanClick(page, locator, durationMs);
  await locator.first().pressSequentially(text, { delay: 90 });
  await page.waitForTimeout(200);
}

/** A readable pause so viewers can absorb the screen (for voiceover timing later). */
export async function beat(page: Page, ms = 900): Promise<void> {
  await page.waitForTimeout(ms);
}

/** Reset the virtual cursor origin (call after a viewport change). */
export function resetCursorOrigin(x = 640, y = 360): void {
  lastX = x; lastY = y;
}
