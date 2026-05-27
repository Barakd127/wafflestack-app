import type { Chip, PushkaTarget } from '../../utils/pushkaEngine'

interface Props {
  drawn: Chip[]
  target: PushkaTarget
  mean: number
}

const BIN_COUNT = 9
const BAR_W = 28
const HEIGHT = 80

function chipColor(value: number): string {
  if (value <= 2) return '#ef4444'
  if (value <= 4) return '#f59e0b'
  if (value <= 6) return '#3b82f6'
  if (value <= 7) return '#10b981'
  return '#FFD700'
}

export default function DensitySparkline({ drawn, target, mean }: Props) {
  // Bin counts for values 1–9
  const bins = Array.from({ length: BIN_COUNT }, (_, i) => ({
    value: i + 1,
    count: drawn.filter(c => c.value === i + 1).length,
  }))

  const maxCount = Math.max(...bins.map(b => b.count), 1)
  const totalW = BIN_COUNT * (BAR_W + 4) - 4

  const inTargetBins = bins.filter(b => b.value >= target.lowBound && b.value <= target.highBound)
  const targetLeft = (target.lowBound - 1) * (BAR_W + 4)
  const targetRight = (target.highBound) * (BAR_W + 4) - 4
  const targetWidth = targetRight - targetLeft

  return (
    <div
      dir="rtl"
      className="rounded-2xl p-3"
      style={{ background: '#1c1f26', border: '1px solid #2a2e36' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold" style={{ color: '#8a8f99', fontFamily: 'Heebo, sans-serif' }}>
          פיזור השבבים שנשלפו
        </span>
        {drawn.length === 0 && (
          <span className="text-xs" style={{ color: '#2a2e36' }}>עדיין לא שלפת</span>
        )}
      </div>

      <svg
        width={totalW}
        height={HEIGHT + 20}
        viewBox={`0 0 ${totalW} ${HEIGHT + 20}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {/* Target range highlight */}
        {targetWidth > 0 && (
          <rect
            x={targetLeft}
            y={0}
            width={targetWidth}
            height={HEIGHT}
            fill="rgba(16,185,129,0.08)"
            rx={4}
          />
        )}

        {/* Bars */}
        {bins.map((bin, i) => {
          const barH = bin.count > 0 ? (bin.count / maxCount) * (HEIGHT - 8) : 2
          const x = i * (BAR_W + 4)
          const isInTarget = inTargetBins.includes(bin)
          return (
            <g key={bin.value}>
              <rect
                x={x}
                y={HEIGHT - barH - 4}
                width={BAR_W}
                height={barH}
                fill={bin.count > 0 ? chipColor(bin.value) : '#2a2e36'}
                rx={4}
                opacity={bin.count > 0 ? 1 : 0.4}
              />
              {bin.count > 0 && (
                <text
                  x={x + BAR_W / 2}
                  y={HEIGHT - barH - 7}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#e8eaed"
                >
                  {bin.count}
                </text>
              )}
              <text
                x={x + BAR_W / 2}
                y={HEIGHT + 14}
                textAnchor="middle"
                fontSize={10}
                fill={isInTarget ? '#10b981' : '#8a8f99'}
                fontWeight={isInTarget ? 'bold' : 'normal'}
              >
                {bin.value}
              </text>
            </g>
          )
        })}

        {/* Mean line */}
        {drawn.length >= 2 && (
          <>
            <line
              x1={(mean - 1) * (BAR_W + 4) + BAR_W / 2}
              y1={0}
              x2={(mean - 1) * (BAR_W + 4) + BAR_W / 2}
              y2={HEIGHT}
              stroke="#FFD700"
              strokeWidth={2}
              strokeDasharray="4,3"
            />
            <text
              x={(mean - 1) * (BAR_W + 4) + BAR_W / 2}
              y={HEIGHT - 2}
              textAnchor="middle"
              fontSize={9}
              fill="#FFD700"
            >
              x̄
            </text>
          </>
        )}
      </svg>

      <div className="flex items-center gap-3 mt-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded" style={{ background: 'rgba(16,185,129,0.25)', border: '1px solid #10b981' }} />
          <span className="text-xs" style={{ color: '#8a8f99' }}>טווח יעד</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 border-t-2 border-dashed" style={{ borderColor: '#FFD700' }} />
          <span className="text-xs" style={{ color: '#8a8f99' }}>ממוצע</span>
        </div>
      </div>
    </div>
  )
}
