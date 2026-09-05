// The waffle mosaic — a grid of squares that resolves into a coral mass at one
// corner of a card and cools into the container's own pale blue as it spreads
// away. It is the app's name made visible: a waffle chart is a real statistical
// figure, a grid of squares where each one is a share of the whole, and the app
// is about building a city out of blocks. Per Shirli 2026-09-05 (option ג).
//
// It belongs BEHIND the card's content and runs on under the inner board, so
// the same square is crisp on the card and only half-read through the frost.
// That reveal-and-conceal is the point — a shape drawn on top of a card is a
// sticker, and stickers were deliberately removed from this screen.
import { useMemo } from 'react'

const CORAL: [number, number, number] = [255, 133, 76]
// The palest blue the container already carries. The mass does not fade to
// nothing; it turns into the page it is sitting on.
const PALE_BLUE: [number, number, number] = [188, 207, 231]

type Cell = { x: number; y: number; a: number; c: string }

/**
 * Cells are laid out from an anchor corner, and two things ramp with distance:
 * the colour, coral → pale blue, and the alpha. Both carry a small seeded
 * jitter — without it the grid reads as a machine gradient rendered at low
 * resolution rather than as something built. Seeded rather than Math.random()
 * so the pattern is identical on every render and every machine; an unseeded
 * one would reshuffle the card on every paint.
 */
function build(cols: number, rows: number, reach: number, peak: number, seed: number): Cell[] {
  let r = seed
  const rnd = () => (r = (r * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
  const out: Cell[] = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // 0 at the anchor cell, 1 at the edge of the reach. The 1.15 stretches
      // the falloff vertically so the mass stays wider than it is tall.
      const d = Math.min(1, Math.hypot(x, y * 1.15) / reach)

      // Colour ramp. The jitter is what keeps a diagonal band of cells from
      // all landing on exactly the same tone.
      const t = Math.max(0, Math.min(1, d + (rnd() - 0.5) * 0.22))
      const c = CORAL.map((v, i) => Math.round(v + (PALE_BLUE[i] - v) * t)).join(',')

      // Alpha falloff, gentle on purpose: the far cells should still read as
      // pale squares the way they do in a real mosaic. Receding is the colour
      // ramp's job here, not disappearance.
      let a = Math.pow(1 - d, 1.2) * peak * (0.8 + 0.4 * rnd())
      a = Math.min(0.95, Math.pow(a, 0.72) * 1.06)
      if (a < 0.03) continue

      out.push({ x, y, a, c })
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
  const cells = useMemo(() => build(cols, rows, reach, peak, seed), [cols, rows, reach, peak, seed])
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
        // A hair of softening — enough to take the digital edge off each
        // corner, not enough to close the 1px gaps.
        filter: 'blur(0.8px)',
      }}
    >
      {cells.map(c => (
        <div
          key={`${c.x}-${c.y}`}
          style={{
            gridArea: `${c.y + 1} / ${c.x + 1}`,
            background: `rgba(${c.c},${c.a.toFixed(3)})`,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  )
}
