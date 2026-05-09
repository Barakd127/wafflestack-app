import { motion } from 'framer-motion'
import { Building2, Brain, LineChart, Trophy } from 'lucide-react'

const features = [
  {
    Icon: Building2,
    title: 'עיר סטטיסטיקה תלת-ממדית',
    desc: 'עיר 3D בנויה מנכסי Kenney. כל בניין מייצג מושג סטטיסטי. ככל שתשלוט יותר — העיר שלך תגדל ותאיר.',
    tag: 'עיר תלת-ממד',
    color: '#3351CA',
  },
  {
    Icon: Brain,
    title: 'מפות חשיבה אינטראקטיביות',
    desc: 'קנבס מלא לרישום, קישור מושגים, ונוסחאות. פתוח לצד החידון ומסתנכרן עם הלמידה.',
    tag: 'מפות חשיבה',
    color: '#254A9F',
  },
  {
    Icon: LineChart,
    title: 'שיעורים אדפטיביים',
    desc: 'כל נושא מגיע עם שקופיות, הסברים, ונוסחאות מסודרות. הקצב שלך, הסדר שלך.',
    tag: 'שיעורים אדפטיביים',
    color: '#3351CA',
  },
  {
    Icon: Trophy,
    title: 'XP, רמות, ושליטה',
    desc: 'מערכת ניקוד שעוקבת אחר ההתקדמות שלך. כל שאלה נכונה — XP. כל נושא שתשלוט — בניין. כל בניין — צעד קדימה.',
    tag: 'גיימיפיקציה',
    color: '#B8960C',
  },
]

export function FeaturesSection() {
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
          <span className="ls-eyebrow">מה יש פה</span>
          <h2 className="ls-h2" style={{ marginTop: 16 }}>
            כל מה שצריך <span className="ls-gold-gradient">לשלוט בסטטיסטיקה</span>
          </h2>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {features.map((f, i) => {
            const Icon = f.Icon
            return (
              <motion.div
                key={i}
                className="ls-features-row"
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6 }}
                style={{
                  display: 'flex',
                  gap: 28,
                  alignItems: 'center',
                  flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
                }}
              >
                {/* Icon panel */}
                <div className="ls-glass ls-features-icon" style={{
                  flex: '0 0 180px',
                  height: 180,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${f.color}22, ${f.color}0a)`,
                  borderColor: `${f.color}44`,
                }}>
                  <Icon size={64} color={f.color} strokeWidth={1.5} />
                </div>

                {/* Text panel */}
                <div className="ls-glass ls-glass--card" style={{ flex: 1, minWidth: 0 }}>
                  <span className="ls-eyebrow" style={{ color: f.color, borderColor: `${f.color}55`, background: `${f.color}14`, marginBottom: 14, display: 'inline-flex' }}>
                    {f.tag}
                  </span>
                  <h3 className="ls-h3" style={{ fontSize: 24, marginBottom: 12 }}>{f.title}</h3>
                  <p className="ls-body">{f.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
