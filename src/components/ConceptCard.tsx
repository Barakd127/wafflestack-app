/**
 * ConceptCard — Quick-reference card for a stats concept.
 * Shows formula, plain-language explanation, real-world example.
 * Displayed in the StatChallenge sidebar.
 */

interface ConceptCardProps {
  concept: string
  conceptHe: string
  formula: string
  realWorld: string
  color: string
}

export default function ConceptCard({ concept, conceptHe, formula, realWorld, color }: ConceptCardProps) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}0d 0%, transparent 100%)`,
      border: `1px solid ${color}33`,
      borderRadius: 12, padding: '14px 16px',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{conceptHe}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{concept}</span>
      </div>
      <div style={{
        fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.7)',
        background: 'rgba(0,0,0,0.25)', padding: '6px 10px', borderRadius: 6,
        marginBottom: 8, letterSpacing: 0.3,
      }}>
        {formula}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
        💡 {realWorld}
      </div>
    </div>
  )
}
