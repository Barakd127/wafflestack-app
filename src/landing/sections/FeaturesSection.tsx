import { motion } from 'framer-motion'

const features = [
  {
    emoji: '🏙️',
    title: 'עיר סטטיסטיקה תלת-ממדית',
    desc: 'עיר 3D בנויה מנכסי Kenney. כל בניין מייצג מושג סטטיסטי. ככל שתשלוט יותר — העיר שלך תגדל ותאיר.',
    tag: '3D City',
    color: '#1a56db',
  },
  {
    emoji: '🧠',
    title: 'מפות חשיבה אינטראקטיביות',
    desc: 'כנבס מלא לרישום, קישור מושגים, ונוסחאות. פתוח לצד החידון ומסתנכרן עם הלמידה.',
    tag: 'Mind Maps',
    color: '#8b5cf6',
  },
  {
    emoji: '📈',
    title: 'שיעורים אדפטיביים',
    desc: 'כל נושא מגיע עם שקופיות, הסברים, ונוסחאות מסודרות. הקצב שלך, הסדר שלך.',
    tag: 'Adaptive Lessons',
    color: '#10b981',
  },
  {
    emoji: '🏆',
    title: 'XP, רמות, ושליטה',
    desc: 'מערכת ניקוד שעוקבת אחר ההתקדמות שלך. כל שאלה נכונה — XP. כל נושא שתשלוט — בניין. כל בניין — צעד קדימה.',
    tag: 'Gamification',
    color: '#f59e0b',
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
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <span className="ls-eyebrow">מה יש פה</span>
          <h2 className="ls-h2" style={{ marginTop: 16 }}>
            הכל שתצטרך <span className="ls-gold-gradient">לשלוט בסטטיסטיקה</span>
          </h2>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="ls-features-row"
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              style={{
                display: 'flex',
                gap: 32,
                alignItems: 'center',
                flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
              }}
            >
              {/* Icon panel */}
              <div className="ls-glass" style={{
                flex: '0 0 180px',
                height: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 72,
                background: `linear-gradient(135deg, ${f.color}18, ${f.color}08)`,
                borderColor: `${f.color}33`,
              }}>
                {f.emoji}
              </div>

              {/* Text panel */}
              <div className="ls-glass ls-glass--card" style={{ flex: 1 }}>
                <span className="ls-eyebrow" style={{ color: f.color, borderColor: `${f.color}44`, background: `${f.color}11`, marginBottom: 14, display: 'inline-flex' }}>
                  {f.tag}
                </span>
                <h3 className="ls-h3" style={{ fontSize: 26, marginBottom: 12 }}>{f.title}</h3>
                <p className="ls-body">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
