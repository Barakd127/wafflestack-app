// The waffle mosaic — a grid of coral squares that resolves into a mass at one
// corner of a card and dissolves before it reaches the copy. It is the app's
// name made visible: a waffle chart is a real statistical figure, and the app
// builds a city out of blocks. Per Shirli 2026-09-05 (option ג of four).
//
// It belongs BEHIND the card's content and runs on under the inner board, so
// the same square is crisp on the card and only half-read through the frost.
// That reveal-and-conceal is the point — a shape drawn on top of a card is a
// sticker, and stickers were removed from this screen deliberately.
import { useMemo } from 'react'

const CORAL = '255,133,76'

/**
 * Deterministic per-cell jitter. Without it the grid reads as a machine
 * gradient rendered at low resolution; with it, as something built. Seeded so
 * the pattern is identical on every render and every machine — a Math.random()
 * here would reshuffle the card on each paint.
 */
function alphas(cols: number, rows: number, reach: number, peak: number, seed: number) {
  let r = seed
  const rnd = () => (r = (r * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
  const out: { x: number; y: number; a: number }[] = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Distance from the top-left cell. The 1.15 stretches the falloff
      // vertically so the mass stays wider than it is tall, matching the card.
      const d = Math.hypot(x, y * 1.15) / reach
      let a = Math.pow(Math.max(0, 1 - d), 1.7) * peak * (0.78 + 0.44 * rnd())
      // Firm the mid and outer cells: a shallower curve keeps each square at a
      // definite value instead of melting into the one beside it.
      a = Math.min(0.98, Math.pow(a, 0.72) * 1.06)
      if (a < 0.02) continue
      out.push({ x, y, a })
    }
  }
  return out
}

export default function WaffleMosaic({
  cols = 19,
  rows = 13,
  reach = 11.5,
  peak = 0.66,
  seed = 91,
}: { cols?: number; rows?: number; reach?: number; peak?: number; seed?: number }) {
  const cells = useMemo(() => alphas(cols, rows, reach, peak, seed), [cols, rows, reach, peak, seed])
  return (
    <div
      className="ws-waffle-mosaic"
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        // The grid is geometry, not text: inside an RTL card, column 1 would
        // otherwise land on the right and mirror the whole composition.
        direction: 'ltr',
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: 1,
        pointerEvents: 'none',
        filter: 'blur(0.8px)',
      }}
    >
      {cells.map(c => (
        <div
          key={`${c.x}-${c.y}`}
          style={{
            gridArea: `${c.y + 1} / ${c.x + 1}`,
            background: `rgba(${CORAL},${c.a.toFixed(3)})`,
            borderRadius: 6,
          }}
        />
      ))}
    </div>
  )
}
