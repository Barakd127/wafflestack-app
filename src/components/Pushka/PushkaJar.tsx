import { motion, AnimatePresence } from 'framer-motion'
import type { Chip } from '../../utils/pushkaEngine'

interface Props {
  jar: Chip[]
  drawn: Chip[]
  lastDrawn: Chip | null
  phase: string
}

function chipBg(value: number): string {
  if (value <= 2) return '#ef4444'
  if (value <= 4) return '#f59e0b'
  if (value <= 6) return '#3b82f6'
  if (value <= 7) return '#10b981'
  return '#FFD700'
}

function chipShadow(value: number): string {
  if (value <= 2) return '0 0 8px rgba(239,68,68,0.5)'
  if (value <= 4) return '0 0 8px rgba(245,158,11,0.5)'
  if (value <= 6) return '0 0 8px rgba(59,130,246,0.5)'
  if (value <= 7) return '0 0 8px rgba(16,185,129,0.5)'
  return '0 0 8px rgba(255,215,0,0.5)'
}

function ChipCircle({ chip, size = 40, animate = false }: { chip: Chip; size?: number; animate?: boolean }) {
  return (
    <motion.div
      key={chip.id}
      initial={animate ? { scale: 0.5, opacity: 0 } : { scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.3, opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: chipBg(chip.value),
        boxShadow: chipShadow(chip.value),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: size * 0.42,
        color: '#fff',
        fontFamily: 'Heebo, sans-serif',
        border: chip.isOutlier ? '2px solid rgba(255,255,255,0.6)' : 'none',
        flexShrink: 0,
      }}
    >
      {chip.value}
    </motion.div>
  )
}

export default function PushkaJar({ jar, drawn, lastDrawn, phase }: Props) {
  return (
    <div dir="rtl" className="w-full flex flex-col gap-3">

      {/* Jar */}
      <div
        className="rounded-2xl p-4"
        style={{ background: '#1c1f26', border: '1px solid #2a2e36' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: 22 }}>🏺</span>
          <span className="text-sm font-bold" style={{ color: '#8a8f99', fontFamily: 'Heebo, sans-serif' }}>
            {jar.length} שבבים בצנצנת
          </span>
          {drawn.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
              שלפת {drawn.length}
            </span>
          )}
        </div>

        {jar.length === 0 ? (
          <div className="flex items-center justify-center h-16" style={{ color: '#2a2e36' }}>
            <span style={{ fontSize: 32 }}>∅</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            <AnimatePresence>
              {jar.map(chip => (
                <ChipCircle key={chip.id} chip={chip} size={42} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {jar.some(c => c.isOutlier) && (
          <div className="mt-2 text-xs text-center" style={{ color: '#8a8f99' }}>
            ⚠ שבבים גבוליים יכולים לפוצץ את רווח הסמך
          </div>
        )}
      </div>

      {/* Last drawn chip — animated entrance */}
      {lastDrawn && phase === 'drawing' && (
        <motion.div
          dir="rtl"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,215,0,0.04))',
            border: '1px solid rgba(255,215,0,0.3)',
          }}
        >
          <ChipCircle chip={lastDrawn} size={48} animate />
          <div>
            <div className="text-sm font-bold" style={{ color: '#e8eaed', fontFamily: 'Heebo, sans-serif' }}>
              שלפת: {lastDrawn.value}
            </div>
            <div className="text-xs" style={{ color: '#8a8f99' }}>
              {lastDrawn.isOutlier ? '⚠ ערך קיצוני — בדוק את ה-CI' : '✓ ערך רגיל'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Drawn pile */}
      {drawn.length > 0 && (
        <div
          className="rounded-2xl p-3"
          style={{ background: '#16181d', border: '1px solid #2a2e36' }}
        >
          <div className="text-xs mb-2" style={{ color: '#8a8f99', fontFamily: 'Assistant, sans-serif' }}>
            שלוף (מהמדגם שלך):
          </div>
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence>
              {drawn.map(chip => (
                <ChipCircle key={chip.id} chip={chip} size={32} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
