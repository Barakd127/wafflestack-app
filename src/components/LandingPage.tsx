import { useState } from 'react'

interface Props {
  onEnterCity: () => void
}

export default function LandingPage({ onEnterCity }: Props) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleWaitlist = () => {
    if (!email.trim() || !email.includes('@')) return
    const existing = JSON.parse(localStorage.getItem('wafflestack-waitlist') || '[]')
    localStorage.setItem('wafflestack-waitlist', JSON.stringify([...existing, email.trim()]))
    setSubmitted(true)
  }

  return (
    <div style={{
      width: '100%', height: '100%', overflow: 'auto',
      background: 'linear-gradient(160deg, #050510 0%, #0a0a20 40%, #0d1525 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      {/* Nav */}
      <nav style={{
        width: '100%', maxWidth: 1100, padding: '20px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🏙️</span>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.5, color: '#4ECDC4' }}>WaffleStack</span>
        </div>
        <button
          onClick={onEnterCity}
          style={{
            background: 'rgba(78,205,196,0.12)', border: '1px solid rgba(78,205,196,0.35)',
            borderRadius: 10, padding: '8px 18px', color: '#4ECDC4',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          Open City →
        </button>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
        padding: '40px 32px 60px', maxWidth: 760,
      }}>
        {/* Badge */}
        <div style={{
          background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.3)',
          borderRadius: 20, padding: '5px 16px', fontSize: 12, color: '#4ECDC4',
          fontWeight: 600, letterSpacing: 1, marginBottom: 32,
        }}>
          🎓 FOR ISRAELI B.A SOCIAL SCIENCES STUDENTS
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.1,
          margin: '0 0 20px', letterSpacing: -1,
        }}>
          Learn Statistics<br />
          <span style={{
            background: 'linear-gradient(90deg, #4ECDC4, #FFD700)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            by Building a City
          </span>
        </h1>

        {/* Subline */}
        <p style={{
          fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
          margin: '0 0 40px', maxWidth: 540,
        }}>
          WaffleStack is a 3D city where every building is a statistics concept.
          Click a building, master the concept, watch your city grow.
        </p>

        {/* CTA */}
        <button
          onClick={onEnterCity}
          style={{
            background: 'linear-gradient(90deg, #4ECDC4, #44b8b0)',
            border: 'none', borderRadius: 14, padding: '16px 40px',
            color: '#000', fontWeight: 800, fontSize: 18, cursor: 'pointer',
            marginBottom: 48,
            boxShadow: '0 4px 30px rgba(78,205,196,0.35)',
            letterSpacing: 0.3,
          }}
        >
          🏙️ Open the City →
        </button>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 60 }}>
          {[
            '📊 10 Statistics Concepts',
            '🎯 Interactive Quizzes',
            '📈 Live Distribution Charts',
            '⭐ XP & Progress Tracking',
            '🏙️ 3D City That Grows',
            '🔊 Ambient City Sound',
            '🏆 Milestone Celebrations',
          ].map(f => (
            <span key={f} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, padding: '6px 14px', fontSize: 13, color: 'rgba(255,255,255,0.65)',
            }}>{f}</span>
          ))}
        </div>

        {/* How It Works */}
        <div style={{ width: '100%', marginBottom: 60 }}>
          <div style={{
            fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.4)',
            marginBottom: 32, fontWeight: 600, textAlign: 'center',
          }}>
            HOW IT WORKS
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { step: '01', icon: '🏙️', title: 'Enter the City', desc: 'Navigate a 3D city where each building represents a statistics concept.' },
              { step: '02', icon: '📖', title: 'Learn the Concept', desc: 'Read the explanation, tweak interactive sliders, and see live distribution charts.' },
              { step: '03', icon: '🎯', title: 'Answer Questions', desc: 'Test your understanding with 4 quiz questions per concept.' },
              { step: '04', icon: '⭐', title: 'Earn XP & Grow', desc: 'Each mastered concept adds 50 XP and lights up your building in the city.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '24px 20px', width: 200,
                textAlign: 'center', flexShrink: 0,
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 2,
                  color: '#4ECDC4', marginBottom: 12,
                }}>{step}</div>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 48 }} />

        {/* Waitlist */}
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontWeight: 600 }}>
            GET NOTIFIED WHEN WE LAUNCH
          </div>
          {submitted ? (
            <div style={{
              background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.3)',
              borderRadius: 12, padding: '16px 20px', color: '#4ECDC4', fontSize: 15, fontWeight: 600,
            }}>
              ✓ You're on the waitlist! We'll be in touch.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleWaitlist()}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                  padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none',
                }}
              />
              <button
                onClick={handleWaitlist}
                style={{
                  background: '#4ECDC4', border: 'none', borderRadius: 10,
                  padding: '12px 20px', color: '#000', fontWeight: 700,
                  fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Join →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
