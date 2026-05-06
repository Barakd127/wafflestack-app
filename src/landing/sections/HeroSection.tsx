import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="ls-section" style={{ paddingTop: 120, paddingBottom: 80 }}>
      <div className="ls-container">
        <div className="ls-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>

          {/* LEFT: copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.08 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span className="ls-eyebrow">✦ Statistics, gamified</span>
            </motion.div>

            <motion.h1
              className="ls-h1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Build your{' '}
              <span className="ls-gold-gradient">statistics city.</span>
              <br />One waffle at a time.
            </motion.h1>

            <motion.p
              className="ls-body"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{ maxWidth: 480 }}
            >
              WaffleStack turns statistics into a city builder. Master concepts,
              earn buildings, watch your skyline grow — in Hebrew.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
            >
              <a href="#study" className="ls-cta-gold">
                <span>התחל עכשיו</span>
                <span>→</span>
              </a>
              <a href="#study" className="ls-cta-ghost">
                גלה עוד
              </a>
            </motion.div>

            {/* Social proof microcopy */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ls-text-dim)', fontSize: 13 }}
            >
              <span>🏙️ 10 מושגים סטטיסטיים</span>
              <span>·</span>
              <span>📚 שיעורים בעברית</span>
              <span>·</span>
              <span>🎮 גיימיפיקציה</span>
            </motion.div>
          </motion.div>

          {/* RIGHT: 3D placeholder (replaced in Step 4) */}
          <motion.div
            className="ls-hero-3d"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            style={{
              height: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Gold glow halo */}
            <div style={{
              position: 'absolute',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }} />
            <div className="ls-glass" style={{ padding: 32, textAlign: 'center', width: 200 }}>
              <div style={{ fontSize: 64 }}>🏙️</div>
              <div style={{ marginTop: 12, color: 'var(--ls-text-muted)', fontSize: 13 }}>3D city loading...</div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
