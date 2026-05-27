import type { PushkaTarget } from '../../utils/pushkaEngine'

interface Props {
  target: PushkaTarget
  round: number
}

export default function TargetCard({ target, round }: Props) {
  return (
    <div
      dir="rtl"
      className="w-full rounded-2xl p-4 border"
      style={{
        background: 'linear-gradient(135deg, #1c1f26 0%, #16181d 100%)',
        borderColor: '#FFD700',
        borderWidth: 1,
        boxShadow: '0 0 24px rgba(255,215,0,0.12)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', fontFamily: 'Heebo, sans-serif' }}
        >
          סיבוב {round + 1}
        </span>
        <span style={{ fontSize: 20 }}>🎯</span>
      </div>

      <p
        className="text-lg font-bold mb-1"
        style={{ color: '#e8eaed', fontFamily: 'Heebo, sans-serif', lineHeight: 1.4 }}
      >
        {target.prompt}
      </p>

      <p
        className="text-sm"
        style={{ color: '#8a8f99', fontFamily: 'Assistant, sans-serif' }}
      >
        {target.subPrompt}
      </p>

      <div
        className="mt-3 rounded-lg px-3 py-2 text-xs"
        style={{
          background: 'rgba(59,130,246,0.1)',
          borderLeft: '3px solid #3b82f6',
          color: '#8a8f99',
          fontFamily: 'Assistant, sans-serif',
        }}
      >
        💡 {target.explanation}
      </div>
    </div>
  )
}
