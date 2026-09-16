// [ds-extract] from src/components/AITutor/TutorFAB.tsx @ c1a3ad12 (master)
/**
 * Floating action button + Cmd/Ctrl+K keyboard shortcut to open the tutor.
 * Mount once at the app root; it's safe inside any view.
 *
 * Position: bottom-left slot 'tutor-fab' from the uiStacks registry.
 * Visibility: hidden (200ms fade-out) while MathLive's virtual keyboard is
 * open so the FAB doesn't cover the keyboard's bottom-left keys.
 */
import React from 'react';

// Detect platform once at module load. navigator.platform is deprecated but
// still the most reliable Mac sniff across browsers; userAgentData is gated to
// Chromium so we keep this as the fallback. SSR-safe (window guard).
const IS_MAC = typeof navigator !== 'undefined'
  && /Mac|iPhone|iPod|iPad/i.test(navigator.platform || navigator.userAgent || '');
const SHORTCUT_LABEL = IS_MAC ? 'Cmd+K' : 'Ctrl+K';

// [ds-extract] replaced useTutorStore((s) => s.openDrawer) with onClick prop — visual output unchanged
// [ds-extract] replaced useTutorStore((s) => s.open) early-return + toggleDrawer Cmd+K window keydown listener (drawer never open in the DS bundle) — visual output unchanged
// [ds-extract] replaced useKeyboardOpen() (MathLive virtual-keyboard global signal) with kbOpen prop, default false = FAB visible at rest — visual output unchanged
// [ds-extract] replaced getStackOffset('bl', 'tutor-fab') with its computed value { bottom: 20, left: 20 } as props — visual output unchanged
export function TutorFAB({
  onClick = () => {},
  kbOpen = false,
  bottom = 20,
  left = 20,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`שאל/י את וופל (${SHORTCUT_LABEL})`}
      title={`שאל/י את וופל · ${SHORTCUT_LABEL}`}
      style={{
        position: 'fixed',
        bottom: bottom,
        left: left,
        // z-index 230: FAB band (tutor-fab slot, per uiStacks z-index discipline).
        zIndex: 230,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #FBBF24, #F97316)',
        color: '#fff',
        border: '2px solid rgba(255,255,255,0.3)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        minWidth: 44,
        minHeight: 44,
        // 200ms fade-out when keyboard opens; restore on close.
        opacity: kbOpen ? 0 : 1,
        pointerEvents: kbOpen ? 'none' : 'auto',
        transition: 'opacity 200ms ease, transform 150ms ease',
        transform: 'scale(1)',
      }}
    >
      {/* [ds-extract] replaced lucide-react <MessageCircle size={26} /> with the exact inline svg (lucide-react v0.323.0 message-circle node + defaultAttributes) — visual output unchanged */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={26}
        height={26}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -4,
          right: -4,
          fontSize: 10,
          background: '#fff',
          color: '#EA580C',
          borderRadius: 999,
          padding: '2px 6px',
          fontWeight: 700,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }}
      >
        🧇
      </span>
    </button>
  );
}
