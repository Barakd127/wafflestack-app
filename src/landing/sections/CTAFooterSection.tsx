import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'

export function CTAFooterSection() {
  return (
    <section className="ls-section" style={{ paddingBottom: 96 }}>
      <div className="ls-container" style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="ls-glass ls-glass--card ls-glass--gold"
          style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(32px, 6vw, 64px) clamp(20px, 5vw, 48px)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Building2 size={48} color="var(--ls-gold-bright)" strokeWidth={1.5} />
          </div>
          <h2 className="ls-h2" style={{ marginBottom: 16 }}>
            מוכן לבנות את קו הרקיע שלך?
          </h2>
          <p className="ls-body" style={{ marginBottom: 32, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
            הצטרף ל־<span dir="ltr" style={{ display: 'inline-block' }}>WaffleStack</span> ושלוט בסטטיסטיקה תוך כדי בניית עיר.
          </p>
          <a href="#study" className="ls-cta-gold" style={{ fontSize: 17, padding: '16px 36px' }}>
            התחל בחינם ←
          </a>
        </motion.div>

        {/* Footer links */}
        <div style={{ marginTop: 48, color: 'var(--ls-text-dim)', fontSize: 13, display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span><span dir="ltr" style={{ display: 'inline-block' }}>WaffleStack</span> © 2025</span>
          <a href="#study" style={{ color: 'inherit', textDecoration: 'none' }}>כניסה לאפליקציה</a>
          <span>נבנה בעברית</span>
        </div>
      </div>
    </section>
  )
}
