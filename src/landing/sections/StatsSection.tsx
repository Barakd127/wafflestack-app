import { motion, useInView, useMotionValue, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'

function Counter({ from, to, suffix = '' }: { from: number; to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const val = useMotionValue(from)

  useEffect(() => {
    if (!inView) return
    const controls = animate(val, to, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: v => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString() + suffix
      },
    })
    return controls.stop
  }, [inView, val, to, suffix])

  return <span ref={ref}>{from}{suffix}</span>
}

const stats = [
  { value: 10, suffix: '', label: 'מושגים סטטיסטיים', from: 0 },
  { value: 31, suffix: '', label: 'מקורות בנוטבוקLM', from: 0 },
  { value: 100, suffix: '%', label: 'בעברית', from: 0 },
]

export function StatsSection() {
  return (
    <section className="ls-section" style={{ paddingTop: 0 }}>
      <div className="ls-container">
        <div className="ls-glass ls-glass--strong" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0,
          borderRadius: 24,
          overflow: 'hidden',
        }}>
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: '40px 32px',
                textAlign: 'center',
                borderRight: i < 2 ? '1px solid var(--ls-glass-border)' : 'none',
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--ls-gold-bright)', lineHeight: 1 }}>
                <Counter from={s.from} to={s.value} suffix={s.suffix} />
              </div>
              <div style={{ marginTop: 8, color: 'var(--ls-text-muted)', fontSize: 14 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
