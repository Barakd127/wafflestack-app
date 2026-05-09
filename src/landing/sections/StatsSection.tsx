import { motion } from 'framer-motion'
import { FlaskConical, GraduationCap, Layers } from 'lucide-react'

const trustSignals = [
  {
    Icon: FlaskConical,
    color: '#E8C84A',
    label: 'גיימיפיקציה מוכחת מחקרית',
    sub: 'שיטות משחוק מבוססות פסיכולוגיה חינוכית — משפרות מוטיבציה ושימור ידע.',
  },
  {
    Icon: GraduationCap,
    color: '#E8C84A',
    label: 'פותח ע״י פסיכולוג מחקרי ומורה פרטי',
    sub: 'שילוב של ידע אקדמי ומיומנות הוראה אמיתית — שמה שנלמד כאן עובד.',
  },
  {
    Icon: Layers,
    color: '#E8C84A',
    label: 'תוכן שגדל כל הזמן',
    sub: 'עשרות מושגים בסטטיסטיקה ועוד בדרך — מהבסיס ועד לרמה המתקדמת.',
  },
]

export function StatsSection() {
  return (
    <section className="ls-section" style={{ paddingTop: 0 }}>
      <div className="ls-container">
        <div className="ls-glass ls-glass--strong ls-stats-grid">
          {trustSignals.map((s, i) => {
            const Icon = s.Icon
            return (
              <motion.div
                key={i}
                className="ls-stats-cell"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon size={32} color={s.color} strokeWidth={1.5} />
                </div>
                <div style={{
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontWeight: 700,
                  color: 'var(--ls-gold-bright)',
                  lineHeight: 1.35,
                  marginBottom: 8,
                  textWrap: 'balance',
                }}>
                  {s.label}
                </div>
                <div style={{ color: 'var(--ls-text-muted)', fontSize: 13, lineHeight: 1.6, textWrap: 'pretty' }}>
                  {s.sub}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
