import { motion } from 'framer-motion'
import { BookOpen, Target, Building2 } from 'lucide-react'

const steps = [
  {
    icon: BookOpen,
    color: '#1a56db',
    title: 'למד',
    subtitle: 'Learn',
    desc: 'שיעורים קצרים ובהירים בעברית. כל נושא מסוים עם הסבר ויזואלי, נוסחאות, ודוגמאות.',
  },
  {
    icon: Target,
    color: '#f59e0b',
    title: 'תתרגל',
    subtitle: 'Practice',
    desc: 'חידונים אדפטיביים שמתאימים את רמת הקושי לך. שאלות אמיתיות עם הסברים מפורטים.',
  },
  {
    icon: Building2,
    color: '#10b981',
    title: 'בנה',
    subtitle: 'Build',
    desc: 'כל נושא שתשלוט בו יפתח בניין חדש בעיר שלך. צפה בסקיילין שלך גדל.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="ls-section">
      <div className="ls-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <span className="ls-eyebrow">איך זה עובד</span>
          <h2 className="ls-h2" style={{ marginTop: 16 }}>
            שלושה שלבים <span className="ls-gold-gradient">לשלוט בסטטיסטיקה</span>
          </h2>
        </motion.div>

        <div className="ls-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                className="ls-glass ls-glass--card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                style={{ cursor: 'default' }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${step.color}22`,
                  border: `1px solid ${step.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <Icon size={24} color={step.color} />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                  <h3 className="ls-h3">{step.title}</h3>
                  <span style={{ color: 'var(--ls-text-dim)', fontSize: 13, fontWeight: 500 }}>{step.subtitle}</span>
                </div>
                <p className="ls-body" style={{ fontSize: 15 }}>{step.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
