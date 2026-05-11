import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Building2, BookOpen, Gamepad2 } from 'lucide-react'
import { HeroScene } from '../three/HeroScene'

export function HeroSection() {
  return (
    <section className="ls-section" style={{ paddingTop: 96, paddingBottom: 64 }}>
      <div className="ls-container">
        <div className="ls-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>

          {/* RIGHT (in RTL) / first column: copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.08 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span className="ls-eyebrow">✦ סטטיסטיקה כמשחק</span>
            </motion.div>

            <motion.h1
              className="ls-h1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              בנה את <span className="ls-gold-gradient">עיר הסטטיסטיקה</span> שלך — וואפל אחד בכל פעם.
            </motion.h1>

            <motion.p
              className="ls-body"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{ maxWidth: 480 }}
            >
              <span dir="ltr" style={{ display: 'inline-block' }}>WaffleStack</span> הופך סטטיסטיקה לבונה ערים. שלוט במושגים, צבור בניינים, וראה את קו הרקיע שלך גדל — שיטה מוכחת מחקרית שפותחה ע״י פסיכולוג ומורה פרטי.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
            >
              <a href="#study" className="ls-cta-gold" aria-label="התחל עכשיו — מעבר לדף הראשי של האפליקציה">
                <span>התחל עכשיו</span>
                <span aria-hidden="true">←</span>
              </a>
              <a href="#study" className="ls-cta-ghost" aria-label="גלה עוד על האפליקציה">
                גלה עוד
              </a>
            </motion.div>

            {/* Social proof microcopy */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ls-text-dim)', fontSize: 13, flexWrap: 'wrap' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={14} /> מושגים בסטטיסטיקה
              </span>
              <span>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={14} /> מבוסס מחקר
              </span>
              <span>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Gamepad2 size={14} /> גיימיפיקציה מוכחת
              </span>
            </motion.div>
          </motion.div>

          {/* 3D scene */}
          <motion.div
            className="ls-hero-3d"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <div style={{
              position: 'absolute', width: 280, height: 280,
              top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(51,81,202,0.18) 0%, transparent 70%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }} />
            <Suspense fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1', fontSize: 13 }}>
                טוען תלת-ממד...
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

