import { useEffect, useRef } from 'react'
import { useLearningStore } from '../store/learningStore'
import { FEATURE_UNLOCKS_BY_ID, type FeatureId } from '../config/featureUnlocks'

// Map feature ids → emoji icons for the toast. Falls back to 🎉.
const FEATURE_ICONS: Partial<Record<FeatureId, string>> = {
  'arsenal': '🎯',
  'pomodoro': '🍅',
  'ai-tutor': '🤖',
  'mindmap-view': '🗺️',
  'mindmap-edit': '✏️',
  'notebook': '📓',
  'paper-styles': '📄',
  'math-widget': '🧮',
  'formula-library': '∑',
  'highlighter': '🖍️',
  'whiteboard-basic': '🎨',
  'shapes': '🔷',
  'templates': '📋',
  'whiteboard-full': '🖼️',
  'color-picker': '🎨',
  'split-screen': '⊟',
  'cross-link': '🔗',
  'global-search': '🔍',
  'drawing-board-full': '🖌️',
  'city-editor': '🏙️',
  'coins-store': '🪙',
  'city-themes': '🌇',
  'stat-b-native': '📈',
  'cross-course-quiz': '🔀',
  'methods': '🔬',
  'anova': '📐',
  'custom-topic': '✨',
  'community-curated': '👥',
}

// Hebrew labels for the toast header.
const FEATURE_LABELS_HE: Partial<Record<FeatureId, string>> = {
  'arsenal': 'הארסנל',
  'pomodoro': 'שעון פומודורו',
  'ai-tutor': 'מורה פרטי',
  'mindmap-view': 'מפת חשיבה',
  'mindmap-edit': 'עריכת מפת חשיבה',
  'notebook': 'מחברת',
  'paper-styles': 'סגנונות נייר',
  'math-widget': 'עורך משוואות',
  'formula-library': 'ספריית נוסחאות',
  'highlighter': 'מסמן',
  'whiteboard-basic': 'לוח ציור',
  'shapes': 'כלי צורות',
  'templates': 'תבניות',
  'whiteboard-full': 'לוח ציור מלא',
  'color-picker': 'בורר צבעים',
  'split-screen': 'מסך מפוצל',
  'cross-link': 'קישור בין מסמכים',
  'global-search': 'חיפוש גלובלי',
  'drawing-board-full': 'לוח ציור מלא',
  'city-editor': 'עורך עיר',
  'coins-store': 'חנות מטבעות',
  'city-themes': 'ערכות נושא',
  'stat-b-native': 'סטטיסטיקה ב׳',
  'cross-course-quiz': 'חידוני בין-קורסים',
  'methods': 'שיטות מחקר',
  'anova': 'ניתוח שונות',
  'custom-topic': 'נושא מותאם',
  'community-curated': 'ארסנל קהילתי',
}

/**
 * Drains the newlyUnlocked queue from learningStore. For each id, shows a
 * 4-second toast with gold/navy gradient + feature icon + Hebrew label +
 * unlock description. Plays /sounds/unlock.wav unless prefers-reduced-motion
 * is set. Auto-dismisses; user may also click X to clear early.
 *
 * Mount once at app root next to <TutorDrawer />.
 *
 * TODO (PR 3 follow-up): 2-second gold pulse on the unlocked surface.
 */
export default function UnlockToast() {
  const queue = useLearningStore(s => s.newlyUnlocked)
  const clear = useLearningStore(s => s.clearNewlyUnlocked)
  const playedRef = useRef<Set<string>>(new Set())

  // Play unlock sound when a new id arrives, once per id per session.
  useEffect(() => {
    const fresh = queue.find(id => !playedRef.current.has(id))
    if (!fresh) return
    playedRef.current.add(fresh)
    try {
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!reduce) {
        const a = new Audio('/sounds/unlock.wav')
        a.volume = 0.55
        // Autoplay may be blocked — swallow the promise rejection silently.
        void a.play().catch(() => {})
      }
    } catch {
      /* no-op */
    }
  }, [queue])

  // Auto-dismiss top of queue after 4 s.
  useEffect(() => {
    if (queue.length === 0) return
    const id = queue[0]
    const t = setTimeout(() => clear(id), 4000)
    return () => clearTimeout(t)
  }, [queue, clear])

  if (queue.length === 0) return null

  const id = queue[0] as FeatureId
  const rule = FEATURE_UNLOCKS_BY_ID[id]
  const icon = FEATURE_ICONS[id] ?? '🎉'
  const label = FEATURE_LABELS_HE[id] ?? id

  return (
    <div
      role="status"
      aria-live="polite"
      dir="rtl"
      style={{
        position: 'fixed',
        bottom: 24,
        // Viewport-anchored FAB — physical `right` on purpose (conventions 9/19).
        // `insetInlineEnd: 24` in dir=rtl resolves to the LEFT edge and collides
        // with TutorFAB (bottom-left, z 250). The toast (z 9000) then visually
        // blocks the Tutor button. Anchor to bottom-right always.
        right: 24,
        zIndex: 9000,
        maxWidth: 360,
        padding: '14px 18px',
        borderRadius: 18,
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA94D 60%, #1a237e 180%)',
        border: '1px solid rgba(255,215,0,0.6)',
        boxShadow: '0 12px 32px rgba(26,35,126,0.45), 0 0 0 2px rgba(255,215,0,0.35)',
        color: '#1a237e',
        fontFamily: "'Rubik', sans-serif",
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 28, lineHeight: 1, marginInlineStart: 2 }}>
        🎉
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span aria-hidden="true" style={{ fontSize: 22 }}>{icon}</span>
          <strong style={{ fontSize: 15, fontWeight: 700, color: '#0d1656' }}>
            פתחת: {label}
          </strong>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.4, color: '#1a237e' }}>
          {rule?.descriptionHe ?? 'תכונה חדשה נפתחה!'}
        </div>
      </div>
      <button
        type="button"
        onClick={() => clear(id)}
        aria-label="סגור"
        style={{
          background: 'rgba(26,35,126,0.12)',
          border: 'none',
          color: '#0d1656',
          width: 28,
          height: 28,
          borderRadius: 999,
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 14,
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  )
}
