/**
 * Feature tour 07 — 3D WaffleStack city (Godot).
 * Opens "העולם שלי" and records a static reveal of the isometric city.
 *
 * IMPORTANT: the Godot WASM build intermittently freezes the renderer in
 * headless SwiftShader. Any page.mouse.* call then blocks forever (the move
 * promise never settles, so even .catch can't rescue it). So after opening the
 * city we use ONLY driver-side beat() waits — these don't touch the renderer and
 * cannot hang. The city renders fine; we just hold a still camera on it.
 */
import { test } from '@playwright/test';
import { installCursor, humanClick, beat } from '../lib/cursor';
import { tutorialLogin, TUTORIAL_NEEDS_AUTH } from '../lib/auth';

test('07 — 3D city (Godot)', async ({ page }) => {
  test.skip(TUTORIAL_NEEDS_AUTH, 'Set QA_TEST_PASSWORD');
  test.setTimeout(120_000);
  await installCursor(page);
  await tutorialLogin(page);

  // Sidebar → "העולם שלי" (my world / 3D city)
  await humanClick(page, page.getByRole('button', { name: /העולם שלי|העיר|world/i }).first());

  // Godot WASM boot + a long, still reveal. No mouse moves — they hang on freeze.
  await beat(page, 22000);
});
