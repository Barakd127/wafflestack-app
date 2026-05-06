import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { HeroScene } from '../three/HeroScene'

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

          {/* RIGHT: 3D scene */}
          <motion.div
            className="ls-hero-3d"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            style={{ height: 500, position: 'relative' }}
          >
            <div style={{
              position: 'absolute', width: 300, height: 300,
              top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }} />
            <Suspense fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: 13 }}>
                Loading 3D...
              </div>
            }>
              <HeroScene />
            </Suspense>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
