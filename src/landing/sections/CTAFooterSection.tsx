import { motion } from 'framer-motion'

export function CTAFooterSection() {
  return (
    <section className="ls-section" style={{ paddingBottom: 120 }}>
      <div className="ls-container" style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="ls-glass ls-glass--card ls-glass--gold"
          style={{ maxWidth: 680, margin: '0 auto', padding: '64px 48px' }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏙️</div>
          <h2 className="ls-h2" style={{ marginBottom: 16 }}>
            מוכן לבנות את הסקיילין שלך?
          </h2>
          <p className="ls-body" style={{ marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
            הצטרף ל-WaffleStack ותתחיל לשלוט בסטטיסטיקה תוך כדי בניית עיר.
          </p>
          <a href="#study" className="ls-cta-gold" style={{ fontSize: 17, padding: '16px 36px' }}>
            התחל בחינם →
          </a>
        </motion.div>

        {/* Footer links */}
        <div style={{ marginTop: 48, color: 'var(--ls-text-dim)', fontSize: 13, display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span>WaffleStack © 2025</span>
          <a href="#study" style={{ color: 'inherit', textDecoration: 'none' }}>כניסה לאפליקציה</a>
          <span>Built with 🧇 + ☕</span>
        </div>
      </div>
    </section>
  )
}
