/**
 * bidiSegments — UBA-inspired segmentation of a mixed Hebrew/Latin line into
 * RTL and LTR-isolated runs, so the renderer can wrap each LTR run in
 * `<span dir="ltr" unicode-bidi:isolate>` without punctuation ever jumping
 * to the wrong side.
 *
 * The old rule ("neutral punctuation sticks to the CURRENT run") fixed the
 * numbered-bullet flip but broke sentence-final punctuation after a Latin
 * word: in "וזו בדיוק שאילתת SQL." the dot got glued INTO the LTR island and
 * rendered on the right of "SQL" instead of at the end of the Hebrew
 * sentence (user report 2026-07-08, live screenshots).
 *
 * The correct resolution (mirroring the Unicode Bidi Algorithm's N1/N2 rules
 * with paragraph level = RTL):
 *   - a run of neutrals (punctuation + whitespace) takes a direction only
 *     when BOTH flanking strong characters agree;
 *   - at line start/end, or between disagreeing neighbors, neutrals take the
 *     PARAGRAPH direction (Hebrew/RTL) — exactly what Word does.
 *   - exception: enumeration markers like "1)" or "3." (digits + closing
 *     paren/dot, delimited by whitespace/line edges) are atomic LTR tokens,
 *     so authored numbering renders as written instead of mirroring to "(1".
 *
 * Verified by scripts/bidi-test.mjs (wired into `npm run qa:rtl`).
 */

export interface BidiSeg { ltr: boolean; text: string }

/** A leading enumeration marker on a bullet line, e.g. "1) …" or "3. …".
 *  Parsed out so the renderer can display it as a proper Hebrew list marker:
 *  number on the RIGHT, a NON-mirrored punctuation glyph on its LEFT. Left to
 *  the plain bidi algorithm the ")" mirrors to "(" and lands on the wrong side
 *  (user report 2026-07-08). */
export interface LeadingMarker { num: string; punct: string; rest: string }
export function parseLeadingEnumMarker(line: string): LeadingMarker | null {
  const m = /^(\d{1,3})([).])\s+([\s\S]+)$/.exec(line)
  if (!m) return null
  return { num: m[1], punct: m[2], rest: m[3] }
}

const HEBREW_CHAR_RE = /[֐-׿]/
// Neutral = whitespace + bidi-neutral punctuation. ASCII '-' stays STRONG-math
// (keeps "ל-100" → LTR island "-100" working). '%' stays with digits.
const NEUTRAL_RE = /[\s:;,.()\[\]{}"'«»„“”‘’?!…—–·]/
// Enumeration marker: digits + ')' or '.', standing alone between spaces/edges.
const ENUM_RE = /^\d{1,3}[).]$/

type Cls = 'heb' | 'ltr' | 'neutral'
function classify(ch: string): Cls {
  if (NEUTRAL_RE.test(ch)) return 'neutral'
  return HEBREW_CHAR_RE.test(ch) ? 'heb' : 'ltr'
}

export function bidiSegments(line: string): BidiSeg[] {
  if (!line) return []

  // Pass 0 — split into whitespace-delimited words to find atomic enumeration
  // tokens, but classification itself is per character below.
  const enumRanges: Array<[number, number]> = []
  {
    const re = /\S+/g
    let m: RegExpExecArray | null
    while ((m = re.exec(line))) {
      if (ENUM_RE.test(m[0])) enumRanges.push([m.index, m.index + m[0].length])
    }
  }
  const inEnum = (i: number) => enumRanges.some(([s, e]) => i >= s && i < e)

  // Pass 1 — per-char classes, enumeration chars forced LTR-strong.
  const chars = [...line]
  const cls: Cls[] = []
  let pos = 0
  for (const ch of chars) {
    cls.push(inEnum(pos) ? 'ltr' : classify(ch))
    pos += ch.length
  }

  // Pass 2 — resolve neutral runs: both strong neighbors agree → that side;
  // otherwise (mixed / line edge) → paragraph direction (heb).
  const resolved: Array<'heb' | 'ltr'> = new Array(chars.length)
  let i = 0
  while (i < chars.length) {
    if (cls[i] !== 'neutral') { resolved[i] = cls[i] as 'heb' | 'ltr'; i++; continue }
    let j = i
    while (j < chars.length && cls[j] === 'neutral') j++
    const prev = i > 0 ? (resolved[i - 1] as 'heb' | 'ltr') : null
    const next = j < chars.length ? (cls[j] as 'heb' | 'ltr') : null
    const dir: 'heb' | 'ltr' = prev !== null && prev === next ? prev : 'heb'
    for (let k = i; k < j; k++) resolved[k] = dir
    i = j
  }

  // Pass 3 — merge into segments.
  const segs: BidiSeg[] = []
  for (let k = 0; k < chars.length; k++) {
    const ltr = resolved[k] === 'ltr'
    if (segs.length && segs[segs.length - 1].ltr === ltr) segs[segs.length - 1].text += chars[k]
    else segs.push({ ltr, text: chars[k] })
  }
  return segs
}
