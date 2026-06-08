// Home-screen onboarding tutorial video. Shows a dismissible modal once for a
// new user (first visit), and a persistent "▶ סרטון הדרכה" card to replay it.
// Video lives at public/videos/intro-tutorial.mp4 (720p, ~3MB, faststart).
// Per user 2026-06-01.
import { useState } from 'react'

const SRC = `${import.meta.env.BASE_URL}videos/intro-tutorial.mp4`

export default function IntroTutorialVideo() {
  // The video is OPTIONAL — it never auto-opens. The first-run funnel uses the
  // guided tour; this card just lets users watch the explainer if they want to.
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      {/* Replay card on the home page */}
      <button
        onClick={() => setOpen(true)}
        dir="rtl"
        style={{
          display: 'flex', alignItems: 'center', gap: 14, width: '100%',
          background: 'linear-gradient(135deg, rgba(245,200,66,0.16), rgba(212,175,55,0.08))',
          border: '1.5px solid rgba(212,175,55,0.5)', borderRadius: 18,
          padding: '16px 22px', cursor: 'pointer', textAlign: 'right',
          fontFamily: "'Rubik', sans-serif",
        }}
      >
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg,#F5C842,#D4AF37)', color: '#1F3E6C',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>▶</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1F3E6C' }}>סרטון הדרכה — איך מתחילים</div>
          <div style={{ fontSize: 13, color: '#5b6f93', marginTop: 2 }}>סיור קצר בפלטפורמה · פחות מ-3 דקות</div>
        </div>
      </button>

      {/* Modal player */}
      {open && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 240,
            background: 'rgba(11,27,62,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            dir="rtl"
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 20, padding: 16,
              width: '100%', maxWidth: 880, boxShadow: '0 24px 70px rgba(0,0,0,0.4)',
              fontFamily: "'Rubik', sans-serif",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1F3E6C' }}>🎬 ברוכים הבאים ל‑WaffleStack</div>
              <button
                onClick={close}
                aria-label="סגור"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: 22, color: '#5b6f93', lineHeight: 1, padding: 4,
                }}
              >×</button>
            </div>
            <video
              src={SRC}
              controls
              autoPlay
              playsInline
              style={{ width: '100%', borderRadius: 12, background: '#000', display: 'block' }}
            />
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                onClick={close}
                style={{
                  background: 'linear-gradient(135deg,#1F3E6C,#254A9F)', color: '#fff',
                  border: 0, borderRadius: 12, padding: '10px 28px', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
                }}
              >קדימה ללמוד ←</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
