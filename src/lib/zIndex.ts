/**
 * Z-index ladder — single source of truth.
 *
 * Documents the layering convention used across the app so new fixed/absolute
 * elements pick the right slot instead of inventing arbitrary numbers (which
 * is how round-1 audit found a 30 → 49 → 50 → 60 → 200 → 250 → 300 → 301
 * mess with no rationale).
 *
 * USAGE
 *   import { Z } from '@/lib/zIndex'
 *   <div style={{ zIndex: Z.tutorFab }} />
 *
 * For Tailwind classes prefer `z-[NNN]` referencing the same numeric values
 * (Tailwind JIT can't read TS constants — keep the numbers consistent by
 * eye and code-review).
 *
 * RULES
 *   - Pick the lowest slot that puts you above what you must cover.
 *   - Never add a new value without bumping a comment here.
 *   - Modals at the same tier sit on top of each other by mount order —
 *     that's intentional, the stack is LIFO.
 */
export const Z = {
  // Layout chrome (sits inside its own stacking context, but kept here so
  // sticky headers can be reasoned about uniformly).
  stickyHeader: 30,

  // Banners / pills shown above content but below floating tools.
  streakBanner: 49,

  // Bottom-corner FABs and persistent floating tools.
  // Pomodoro + drawing back button share this slot (different stacking
  // contexts in practice, but the *intent* is identical).
  bottomFab: 50,

  // Floating quiz / picker cards.
  floatingCard: 60,

  // Slide-out / overlay base layer (mobile sidebar backdrop).
  overlayBackdrop: 100,

  // Course-gate launcher (semi-modal).
  launcherSemi: 150,

  // Theme toggle + course-gate "coming soon" splash.
  themeToggle: 200,
  splashModal: 200,

  // Arsenal full-screen viewer / Pomodoro lightbox.
  fullscreenViewer: 220,
  pomodoroLightbox: 260,

  // Persistent assistant FAB / mobile bottom-sheet (must clear floating cards
  // AND lightboxes that block the page).
  tutorFab: 250,
  mobileBottomSheet: 250,

  // Drawer panel + close buttons that belong to it.
  drawer: 300,
  drawerInner: 301,

  // Modals that must trap focus over everything (leaderboard, streak cal,
  // local-storage import dialogs).
  modal: 300,

  // Exam mode shell — covers chrome to remove distractions.
  examShell: 500,

  // Picker popovers that may render over a modal (model picker, theme).
  picker: 600,

  // Share card export overlay — needs to be above every persistent thing
  // while html-to-image takes its snapshot.
  shareExport: 9999,

  // Coachmark / onboarding tour — must always win.
  coachmark: 10_000,
  coachmarkInteractive: 10_001,
} as const

export type ZSlot = keyof typeof Z
