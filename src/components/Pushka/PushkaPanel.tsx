import { AnimatePresence, motion } from 'framer-motion'
import { usePushkaStore } from '../../store/pushkaStore'
import { MIN_DRAWS_BEFORE_STOP } from '../../utils/pushkaEngine'
import TargetCard from './TargetCard'
import StatsHud from './StatsHud'
import PushkaJar from './PushkaJar'
import DensitySparkline from './DensitySparkline'
import ChipShop from './ChipShop'

interface Props {
  onBack: () => void
}

export default function PushkaPanel({ onBack }: Props) {
  const {
    phase, jar, drawn, lastDrawn, shekels, round,
    currentTarget, lastScore, stats,
    startRound, drawChip, stop, dismissBust, goToShop, reset,
    totalRoundsPlayed, totalShekelsEarned,
  } = usePushkaStore()

  const canStop = drawn.length >= MIN_DRAWS_BEFORE_STOP && phase === 'drawing'
  const jarEmpty = jar.length === 0 && phase === 'drawing'

  return (
    <div
      dir="rtl"
      className="fixed inset-0 overflow-y-auto"
      style={{ background: '#0e0f12', fontFamily: 'Assistant, sans-serif' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(14,15,18,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #2a2e36' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 transition-all"
          style={{ color: '#8a8f99', background: '#1c1f26', border: '1px solid #2a2e36', minHeight: 44 }}
        >
          ← חזרה
        </button>

        <div className="flex items-center gap-2">
          <span style={{ fontSize: 20 }}>🏺</span>
          <span className="text-base font-bold" style={{ color: '#e8eaed', fontFamily: 'Heebo, sans-serif' }}>
            קופת ההסתברות
          </span>
        </div>

        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold"
          style={{ background: 'rgba(255,215,0,0.12)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.25)' }}
        >
          💰 {shekels}
        </div>
      </div>

      <div className="px-4 pt-4 pb-32 flex flex-col gap-4 max-w-lg mx-auto">

        {/* ── INTRO ──────────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-4"
            >
              {/* Hero explainer */}
              <div
                className="rounded-2xl p-5 text-center"
                style={{ background: 'linear-gradient(135deg, #1c1f26, #16181d)', border: '1px solid #2a2e36' }}
              >
                <div style={{ fontSize: 56 }}>🏺</div>
                <h1 className="text-2xl font-bold mt-2 mb-1" style={{ color: '#e8eaed', fontFamily: 'Heebo, sans-serif' }}>
                  קופת ההסתברות
                </h1>
                <p className="text-sm" style={{ color: '#8a8f99', lineHeight: 1.6 }}>
                  בצנצנת שלך יש שבבים עם ערכים שונים.
                  שלוף שבב אחרי שבב — הממוצע מתעדכן בזמן אמת.
                  <br />
                  <strong style={{ color: '#e8eaed' }}>החלטה:</strong> מתי לעצור ולענות?
                  עצור מוקדם = יותר שקלים. תמשיך יותר מדי = פוצץ.
                </p>
              </div>

              {/* Stats summary (not first round) */}
              {totalRoundsPlayed > 0 && (
                <div
                  className="rounded-xl p-4 flex justify-around"
                  style={{ background: '#1c1f26', border: '1px solid #2a2e36' }}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: '#FFD700', fontFamily: 'Heebo, sans-serif' }}>
                      {totalRoundsPlayed}
                    </div>
                    <div className="text-xs" style={{ color: '#8a8f99' }}>סיבובים</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: '#10b981', fontFamily: 'Heebo, sans-serif' }}>
                      {totalShekelsEarned}
                    </div>
                    <div className="text-xs" style={{ color: '#8a8f99' }}>שקלים שהרווחת</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: '#3b82f6', fontFamily: 'Heebo, sans-serif' }}>
                      {jar.length}
                    </div>
                    <div className="text-xs" style={{ color: '#8a8f99' }}>שבבים בצנצנת</div>
                  </div>
                </div>
              )}

              {/* Color legend */}
              <div className="rounded-xl p-3" style={{ background: '#1c1f26', border: '1px solid #2a2e36' }}>
                <div className="text-xs font-bold mb-2" style={{ color: '#8a8f99' }}>מפתח צבעים:</div>
                <div className="flex flex-wrap gap-2">
                  {[{ color: '#ef4444', label: '1–2 קיצוני נמוך' }, { color: '#f59e0b', label: '3–4 נמוך' }, { color: '#3b82f6', label: '5–6 בינוני' }, { color: '#10b981', label: '7 גבוה' }, { color: '#FFD700', label: '8–9 קיצוני גבוה' }].map(item => (
                    <div key={item.color} className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full" style={{ background: item.color }} />
                      <span className="text-xs" style={{ color: '#8a8f99' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={startRound}
                className="w-full py-5 rounded-2xl font-bold text-xl transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #D4A017)',
                  color: '#0e0f12',
                  fontFamily: 'Heebo, sans-serif',
                  boxShadow: '0 4px 24px rgba(255,215,0,0.4)',
                  minHeight: 64,
                }}
              >
                🏺 {totalRoundsPlayed === 0 ? 'התחל לשחק' : 'סיבוב חדש'}
              </button>

              {totalRoundsPlayed > 0 && (
                <button
                  onClick={reset}
                  className="w-full py-3 rounded-xl text-sm transition-all"
                  style={{ color: '#8a8f99', background: '#1c1f26', border: '1px solid #2a2e36' }}
                >
                  אפס משחק מחדש
                </button>
              )}
            </motion.div>
          )}

          {/* ── DRAWING ─────────────────────────────────────────────────────── */}
          {phase === 'drawing' && (
            <motion.div
              key="drawing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <TargetCard target={currentTarget} round={round} />
              <StatsHud stats={stats} target={currentTarget} bust={false} />
              <PushkaJar jar={jar} drawn={drawn} lastDrawn={lastDrawn} phase={phase} />
              {drawn.length >= 2 && (
                <DensitySparkline drawn={drawn} target={currentTarget} mean={stats.mean} />
              )}
            </motion.div>
          )}

          {/* ── BUST ────────────────────────────────────────────────────────── */}
          {phase === 'bust' && (
            <motion.div
              key="bust"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <div
                className="rounded-2xl p-6 text-center"
                style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid #ef4444' }}
              >
                <div style={{ fontSize: 56 }}>💥</div>
                <h2 className="text-2xl font-bold mt-2" style={{ color: '#ef4444', fontFamily: 'Heebo, sans-serif' }}>
                  פוצץ!
                </h2>
                <p className="text-sm mt-1" style={{ color: '#8a8f99' }}>
                  רווח הסמך שלך התרחב מעל הסף — הנתונים רועשים מדי להסקה.
                </p>
                <div
                  className="mt-3 rounded-xl p-3 text-sm"
                  style={{ background: '#1c1f26', color: '#e8eaed' }}
                >
                  <strong style={{ color: '#FFD700' }}>הסבר:</strong> כשמדגם כולל ערכים קיצוניים מדי,
                  רווח הסמך מתרחב — ועוד שלוף לא יעזור.
                  זו בדיוק הסיבה שדגמאים מנוסים עוצרים בזמן.
                </div>
              </div>
              <StatsHud stats={stats} target={currentTarget} bust />
              {drawn.length >= 2 && (
                <DensitySparkline drawn={drawn} target={currentTarget} mean={stats.mean} />
              )}
              <button
                onClick={dismissBust}
                className="w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95"
                style={{
                  background: '#1c1f26',
                  border: '1px solid #2a2e36',
                  color: '#e8eaed',
                  fontFamily: 'Heebo, sans-serif',
                  minHeight: 56,
                }}
              >
                הבנתי — המשך
              </button>
            </motion.div>
          )}

          {/* ── RESULT ──────────────────────────────────────────────────────── */}
          {phase === 'result' && lastScore && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: lastScore.inRange
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))'
                    : 'rgba(245,158,11,0.08)',
                  border: `2px solid ${lastScore.inRange ? '#10b981' : '#f59e0b'}`,
                }}
              >
                <div style={{ fontSize: 56 }}>{lastScore.inRange ? '✅' : '📊'}</div>
                <h2
                  className="text-2xl font-bold mt-2"
                  style={{
                    color: lastScore.inRange ? '#10b981' : '#f59e0b',
                    fontFamily: 'Heebo, sans-serif',
                  }}
                >
                  {lastScore.inRange ? 'בטווח!' : 'מחוץ לטווח'}
                </h2>
                <p className="text-sm mt-1 mb-3" style={{ color: '#8a8f99' }}>
                  {lastScore.reason}
                </p>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xl font-bold"
                  style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', fontFamily: 'Heebo, sans-serif' }}
                >
                  +{lastScore.shekels} 💰
                </div>
                <p className="text-xs mt-2" style={{ color: '#8a8f99' }}>
                  יתרה: {shekels} ₪
                </p>
              </div>

              <StatsHud stats={stats} target={currentTarget} bust={false} />
              {drawn.length >= 2 && (
                <DensitySparkline drawn={drawn} target={currentTarget} mean={stats.mean} />
              )}

              <div
                className="rounded-xl p-4"
                style={{ background: '#1c1f26', border: '1px solid #2a2e36' }}
              >
                <div className="text-sm font-bold mb-1" style={{ color: '#FFD700', fontFamily: 'Heebo, sans-serif' }}>
                  💡 מה למדת מהסיבוב הזה?
                </div>
                <p className="text-xs" style={{ color: '#8a8f99', lineHeight: 1.6 }}>
                  שלפת <strong style={{ color: '#e8eaed' }}>{stats.n} שבבים</strong> מתוך{' '}
                  {drawn.length + jar.length} בסה"כ.
                  {stats.n >= 5
                    ? ' בהתאם ל-CLT, הממוצע שלך הולך ומתקרב לממוצע האמיתי ככל שגדל n.'
                    : ' עם מדגם קטן, הממוצע עוד לא "התייצב" — הוסף שבבים אם רוצה ודאות גדולה יותר.'}
                </p>
              </div>

              <button
                onClick={goToShop}
                className="w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: '#fff',
                  fontFamily: 'Heebo, sans-serif',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
                  minHeight: 56,
                }}
              >
                🏪 לחנות השבבים
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sticky action bar (drawing phase only) ──────────────────────────── */}
      {phase === 'drawing' && (
        <div
          className="fixed inset-x-0 bottom-0 z-20 px-4 py-4"
          style={{ background: 'rgba(14,15,18,0.97)', backdropFilter: 'blur(16px)', borderTop: '1px solid #2a2e36' }}
        >
          <div dir="rtl" className="flex gap-3 max-w-lg mx-auto">
            <button
              onClick={drawChip}
              disabled={jar.length === 0}
              className="flex-1 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95"
              style={{
                background: jar.length === 0
                  ? '#1c1f26'
                  : 'linear-gradient(135deg, #FFD700, #D4A017)',
                color: jar.length === 0 ? '#8a8f99' : '#0e0f12',
                fontFamily: 'Heebo, sans-serif',
                boxShadow: jar.length > 0 ? '0 4px 20px rgba(255,215,0,0.35)' : 'none',
                minHeight: 56,
              }}
            >
              {jarEmpty ? '🏺 ריק' : `🎲 שלוף שבב (${jar.length} נותרו)`}
            </button>

            <button
              onClick={stop}
              disabled={!canStop}
              className="px-5 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 shrink-0"
              style={{
                background: canStop ? 'rgba(16,185,129,0.15)' : '#1c1f26',
                border: `1px solid ${canStop ? '#10b981' : '#2a2e36'}`,
                color: canStop ? '#10b981' : '#8a8f99',
                fontFamily: 'Heebo, sans-serif',
                minHeight: 56,
              }}
            >
              {canStop ? '✋ עצור וענה' : `(צריך ${MIN_DRAWS_BEFORE_STOP} לפחות)`}
            </button>
          </div>

          {drawn.length >= 1 && (
            <p
              dir="rtl"
              className="text-center text-xs mt-2"
              style={{ color: '#8a8f99' }}
            >
              {canStop
                ? 'עצור עכשיו לבונוס שקלים — כל שבב שנחסך = +1 ₪'
                : `עוד ${Math.max(0, MIN_DRAWS_BEFORE_STOP - drawn.length)} שבב/ים לפני שאפשר לעצור`}
            </p>
          )}
        </div>
      )}

      {/* ── Shop overlay ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'shop' && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.7)' }}
            />
            <ChipShop />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
