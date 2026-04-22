interface Props {
  xp: number
  masteredCount: number
  total: number
  onClose: () => void
}

export default function ShareCard({ xp, masteredCount, total, onClose }: Props) {
  const name = localStorage.getItem('userName') || 'סטודנט'
  const date = new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {/* The shareable card */}
        <div
          dir="rtl"
          style={{
            width: 360, padding: '36px 32px',
            background: 'linear-gradient(135deg, #0a2a28 0%, #0d1f3c 60%, #051015 100%)',
            border: '1px solid rgba(78,205,196,0.35)',
            borderRadius: 24, color: '#fff',
            boxShadow: '0 0 60px rgba(78,205,196,0.15)',
            fontFamily: "'Heebo', sans-serif",
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <span style={{ fontSize: 32 }}>🏙️</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#4ECDC4', letterSpacing: 0.5 }}>WaffleStack</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>עיר הסטטיסטיקה</div>
            </div>
          </div>

          {/* Name */}
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>הישג של</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 24, lineHeight: 1.2 }}>{name}</div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            <div style={{
              flex: 1, padding: '16px 14px', borderRadius: 14, textAlign: 'center',
              background: 'rgba(78,205,196,0.12)', border: '1px solid rgba(78,205,196,0.25)',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#4ECDC4', lineHeight: 1 }}>{xp.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>נקודות XP</div>
            </div>
            <div style={{
              flex: 1, padding: '16px 14px', borderRadius: 14, textAlign: 'center',
              background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#FFD700', lineHeight: 1 }}>{masteredCount}/{total}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>מבנים</div>
            </div>
          </div>

          {/* Date */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16,
          }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{date}</div>
            <div style={{ fontSize: 12, color: 'rgba(78,205,196,0.6)', fontWeight: 600 }}>barakd127.github.io/wafflestack-app</div>
          </div>
        </div>

        {/* Instruction */}
        <div style={{
          fontSize: 13, color: 'rgba(255,255,255,0.5)',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '8px 20px',
        }}>
          צלם מסך לשיתוף
        </div>

        <button
          onClick={onClose}
          style={{
            fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'none',
            border: 'none', cursor: 'pointer', padding: '4px 12px',
          }}
        >
          סגור
        </button>
      </div>
    </div>
  )
}
