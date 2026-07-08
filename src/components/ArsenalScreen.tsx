/**
 * ArsenalScreen — full-page view of the user's collected gotchas / tricks / tips.
 *
 * Layout: header (title + count + add) → filter pills (kind + topic) → card grid.
 * All client-side; reads from arsenalStore. Animations use scoped CSS classes
 * defined in index.css (`arsenal-card-in`, `arsenal-pin-pulse`, `arsenal-card-out`).
 */
import { createElement, useState, useMemo, useRef, useEffect } from 'react'
import {
  useArsenalStore, KIND_META,
  serializeEquation, deserializeEquation, looksLikeMath,
  deserializeTable,
  type ArsenalEntry, type ArsenalKind, type EquationData, type TableData,
} from '../store/arsenalStore'
import { useTutorialStep } from '../hooks/useTutorialStep'
import CommunityArsenalTab from './CommunityArsenalTab'
import { publishEntry, SUPABASE_CONFIGURED } from '../lib/communityArsenal'
import { MathLineBlock, KatexInline, buildNumberedLatex, mergeAdjacentGathered } from '../lib/mathRender'

// MathLive ships ~400 KB; load it on first equation edit and cache the promise.
let mathliveLoader: Promise<unknown> | null = null
function loadMathLive(): Promise<unknown> {
  if (mathliveLoader) return mathliveLoader
  mathliveLoader = import(/* @vite-ignore */ 'mathlive').catch((err: unknown) => {
    mathliveLoader = null
    console.warn('[ArsenalScreen] MathLive failed to load:', err)
    return null
  })
  return mathliveLoader
}

// Convert Unicode math glyphs to LaTeX so KaTeX renders them properly.
//   f₆ → f_{6}, ¹⁰ → ^{10}, · → \cdot, etc.
const UNICODE_SUBSCRIPTS: Record<string, string> = {
  '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9',
  '₊':'+','₋':'-','₌':'=','₍':'(','₎':')','ₐ':'a','ₑ':'e','ᵢ':'i','ⱼ':'j','ₖ':'k','ₗ':'l','ₘ':'m','ₙ':'n','ₒ':'o','ₚ':'p','ₛ':'s','ₜ':'t','ᵤ':'u','ᵥ':'v','ₓ':'x',
}
const UNICODE_SUPERSCRIPTS: Record<string, string> = {
  '⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9',
  '⁺':'+','⁻':'-','⁼':'=','⁽':'(','⁾':')','ⁿ':'n','ⁱ':'i',
}
export function normalizeMathGlyphs(s: string): string {
  // f₆₇ → f_{67}, x² → x^{2}, etc. Run on contiguous sub/super sequences.
  let out = s
  out = out.replace(/([₀-₉₊₋₌₍₎ₐₑᵢⱼₖₗₘₙₒₚₛₜᵤᵥₓ]+)/g,
    m => '_{' + m.split('').map(c => UNICODE_SUBSCRIPTS[c] ?? c).join('') + '}')
  out = out.replace(/([⁰-⁹⁺⁻⁼⁽⁾ⁿⁱ]+)/g,
    m => '^{' + m.split('').map(c => UNICODE_SUPERSCRIPTS[c] ?? c).join('') + '}')
  out = out.replace(/·/g, ' \\cdot ')
  out = out.replace(/×/g, ' \\times ')
  out = out.replace(/÷/g, ' \\div ')
  out = out.replace(/≤/g, ' \\le ').replace(/≥/g, ' \\ge ').replace(/≠/g, ' \\ne ')
  out = out.replace(/±/g, ' \\pm ').replace(/∞/g, ' \\infty ')
  out = out.replace(/Σ/g, '\\Sigma ').replace(/Π/g, '\\Pi ')
  out = out.replace(/μ/g, '\\mu ').replace(/σ/g, '\\sigma ')
  out = out.replace(/π/g, '\\pi ').replace(/α/g, '\\alpha ').replace(/β/g, '\\beta ').replace(/θ/g, '\\theta ')
  out = out.replace(/√/g, '\\sqrt')
  out = out.replace(/→/g, ' \\to ').replace(/⇒/g, ' \\Rightarrow ')
  return out
}

// Auto-detect math-like substrings in mixed Hebrew/math prose and wrap them
// in $...$ delimiters before tokenizing. A "math run" is a maximal contiguous
// sequence of non-Hebrew characters that contains at least one math operator
// (=, +, -, *, /, ^, _, \, parens) and at least one digit or backslash, and
// is at least 3 chars long. This catches `(90+82)/2 = 86`, `Σxf=7.533·150`,
// `\bar{x}`, `f_6+f_9=60`, etc. without false-positive wrapping plain words.
const HEBREW_RE = /[֐-׿]/
const MATHRUN_RE = /[^\s֐-׿][^֐-׿]*?(?=$|[\s֐-׿])/g

// Whole-line equation pre-processor (NEW, per user 2026-05-24).
// A LINE like "ממוצע = Σx ÷ n = (60+70+80) ÷ 3 = 210 ÷ 3 = 70" should render
// as ONE styled equation, not split into 5 mini fragments. We wrap the
// entire line in $...$ and convert Hebrew runs to LaTeX \text{...} so the
// label and the math sit inside a single KaTeX block.
function wholeLineEquation(text: string): string {
  return text.split(/\n/).map(line => {
    if (line.includes('$')) return line               // user already wrapped → trust them
    if (!line.includes('=')) return line              // need an = to qualify as equation
    if (!/[=+\-*/÷×·\d]/.test(line) && !line.includes('\\')) return line  // no math → plain text

    // Pure-LaTeX line (no Hebrew, contains backslash like \frac, \sum, \bar).
    // Per-run wrap splits by space which breaks `\frac{\sum x_i}{n}` apart.
    // Solution: wrap whole line as one $...$ if it contains backslash commands.
    // Per user 2026-05-25 — '\\frac{\\sum x_i}{n}' was rendering as raw text.
    if (!HEBREW_RE.test(line) && line.includes('\\')) {
      return '$' + line + '$'
    }
    if (!HEBREW_RE.test(line)) return line            // no Hebrew → existing autoWrapMath handles

    let out = ''
    let buf = ''
    let mode: 'heb' | 'math' = 'math'
    const flush = () => {
      if (!buf) return
      const piece = mode === 'heb' ? `\\text{${buf.replace(/[{}\\]/g, '')}}` : buf
      out += piece
      buf = ''
    }
    for (const ch of line) {
      const isHeb = /[֐-׿]/.test(ch)
      const isSpace = /\s/.test(ch)
      // Spaces don't trigger mode flip — they stick to whichever mode is active.
      let newMode: 'heb' | 'math' = mode
      if (!isSpace) newMode = isHeb ? 'heb' : 'math'
      if (newMode !== mode) { flush(); mode = newMode }
      buf += ch
    }
    flush()
    // Convert Unicode math glyphs to LaTeX commands so KaTeX renders them
    // with proper spacing (÷ alone reads as binary op but \div is tighter).
    out = out
      .replace(/÷/g, ' \\div ')
      .replace(/×/g, ' \\times ')
      .replace(/·/g, ' \\cdot ')
      .replace(/Σ/g, '\\Sigma ')
      .replace(/π/g, '\\pi ')
      .replace(/μ/g, '\\mu ')
      .replace(/σ/g, '\\sigma ')
      .replace(/√/g, '\\sqrt ')
      .replace(/∞/g, '\\infty ')
      .replace(/≤/g, ' \\le ')
      .replace(/≥/g, ' \\ge ')
      .replace(/≠/g, ' \\ne ')
    return '$' + out + '$'
  }).join('\n')
}

function autoWrapMath(text: string): string {
  if (text.includes('$')) return text // user already wrapped — trust them
  // First: try whole-line equation wrapping (catches Hebrew-labelled equations).
  const lineWrapped = wholeLineEquation(text)
  if (lineWrapped !== text) return lineWrapped
  // Otherwise: fall back to per-run wrapping (catches bare math chunks).
  return text.replace(MATHRUN_RE, (run) => {
    if (HEBREW_RE.test(run)) return run
    // Must have a math operator AND a digit-or-backslash to count as math.
    const hasOp = /[=+\-*/^_(){}\\]/.test(run)
    const hasNumOrCmd = /[0-9\\]/.test(run) || /[₀-₉⁰-⁹Σμσπ√∞±·×÷≤≥≠]/.test(run)
    if (!hasOp || !hasNumOrCmd) return run
    if (run.replace(/\s+/g, '').length < 3) return run
    return '$' + normalizeMathGlyphs(run) + '$'
  })
}

// Shared $...$ tokenizer used by both render (ArsenalEntryBody) and the
// in-place equation editor — keeping a single source of truth means a segment
// index is stable between the two so we can replace exactly one occurrence.
type ArsenalSegment = { type: 'text' | 'math'; value: string }

// Auto-detect math runs in plain text. A math run is a sequence containing
// digits/operators/Greek-math letters but NO Hebrew or English alphabet
// letters. Per user 2026-05-24: only the explicit $...$ wrapped chunks were
// rendering as KaTeX; the surrounding `Σx ÷ n = ... = 70` was plain text.
// Now any LTR math-like run is captured automatically.
const AUTODETECT_MATH_RE = /[Σπμσ²³√∞≤≥≠÷×·\d][Σπμσ²³√∞≤≥≠÷×·\d\s()+\-=*/.,]*[Σπμσ²³√∞≤≥≠÷×·\d)]/g

function autoDetectMathInText(text: string): ArsenalSegment[] {
  const out: ArsenalSegment[] = []
  let last = 0
  let m: RegExpExecArray | null
  AUTODETECT_MATH_RE.lastIndex = 0
  while ((m = AUTODETECT_MATH_RE.exec(text)) !== null) {
    const start = m.index
    const end = start + m[0].length
    // Reject runs that are just digits — those read fine as text (no LaTeX gain)
    if (!/[ΣπμσΕ÷×·+\-=()²³√]/.test(m[0])) continue
    // Reject runs shorter than 3 chars — not worth a math box
    if (m[0].trim().length < 3) continue
    if (last < start) out.push({ type: 'text', value: text.slice(last, start) })
    out.push({ type: 'math', value: m[0].trim() })
    last = end
  }
  if (last < text.length) out.push({ type: 'text', value: text.slice(last) })
  return out
}

function tokenizeEntry(text: string): ArsenalSegment[] {
  // Pass 1: extract explicit $...$ math.
  const explicit: ArsenalSegment[] = []
  let i = 0
  let buf = ''
  while (i < text.length) {
    const ch = text[i]
    if (ch === '\\' && text[i + 1] === '$') { buf += '$'; i += 2; continue }
    if (ch === '$') {
      const end = text.indexOf('$', i + 1)
      if (end === -1) { buf += text.slice(i); break }
      if (buf) { explicit.push({ type: 'text', value: buf }); buf = '' }
      explicit.push({ type: 'math', value: text.slice(i + 1, end) })
      i = end + 1
      continue
    }
    buf += ch
    i++
  }
  if (buf) explicit.push({ type: 'text', value: buf })

  // Pass 2: auto-detect math runs inside each TEXT segment. Math segments
  // (from $...$) pass through unchanged so the explicit user wrapping wins.
  const out: ArsenalSegment[] = []
  for (const seg of explicit) {
    if (seg.type === 'math') { out.push(seg); continue }
    out.push(...autoDetectMathInText(seg.value))
  }
  return out
}

/** Recompose tokens back to source. Plain text dollar signs are escaped so a
 *  later tokenize round-trips cleanly. */
function detokenize(segments: ArsenalSegment[]): string {
  return segments
    .map(s => (s.type === 'math' ? `$${s.value}$` : s.value.replace(/\$/g, '\\$')))
    .join('')
}

/** Replace the math segment at `segmentIndex` with new LaTeX, then return the
 *  recomposed entry text. No-op when the index doesn't point at a math seg. */
function replaceMathSegment(text: string, segmentIndex: number, newLatex: string): string {
  const segs = tokenizeEntry(text)
  const target = segs[segmentIndex]
  if (!target || target.type !== 'math') return text
  segs[segmentIndex] = { type: 'math', value: newLatex }
  return detokenize(segs)
}

// Keep in sync with HEBREW_LABELS in StudyHub.tsx
const TOPIC_LABELS: Record<string, string> = {
  'mean':                 'ממוצע',
  'median':               'חציון',
  'std-dev':              'סטיית תקן',
  'probability':          'הסתברות',
  'regression':           'רגרסיה',
  'correlation':          'קורלציה',
  'binomial':             'בינום',
  'hypothesis-testing':   'מבחן השערות',
  'sampling':             'מדגם',
  'confidence-intervals': 'רווח סמך',
}

const TEXT_DARK  = 'var(--sh-text-dark)'
const TEXT_MED   = 'var(--sh-text-med)'
const TEXT_LIGHT = 'var(--sh-text-light)'

type FilterKind = 'all' | ArsenalKind | 'pinned'
type FilterTopic = 'all' | string

export default function ArsenalScreen() {
  const entries = useArsenalStore(s => s.entries)
  const removeEntry = useArsenalStore(s => s.removeEntry)
  const togglePin = useArsenalStore(s => s.togglePin)
  const editEntry = useArsenalStore(s => s.editEntry)
  const changeKind = useArsenalStore(s => s.changeKind)
  const addEntry = useArsenalStore(s => s.addEntry)
  const markPublished = useArsenalStore(s => s.markPublished)

  const [view, setView] = useState<'mine' | 'community'>('mine')
  const [kindFilter, setKindFilter] = useState<FilterKind>('all')
  const [topicFilter, setTopicFilter] = useState<FilterTopic>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
  const [confirmShareId, setConfirmShareId] = useState<string | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)
  const [sharingId, setSharingId] = useState<string | null>(null)
  // Toggle for the explanatory hover tooltips on filter pills.
  // Persisted in localStorage so the user's choice survives reloads.
  const [showHints, setShowHints] = useState<boolean>(() => {
    try { return localStorage.getItem('wafflestack-arsenal-hints') !== 'off' } catch { return true }
  })
  const toggleHints = () => {
    setShowHints(v => {
      try { localStorage.setItem('wafflestack-arsenal-hints', v ? 'off' : 'on') } catch { /* ignore */ }
      return !v
    })
  }

  // One-time corruption sweep — equation entries whose `text` isn't valid
  // {label,latex} JSON get demoted to `gotcha` kind silently. Auto-migrate
  // per plan curried-waddling-pelican Part C decision.
  const sweptRef = useRef(false)
  useEffect(() => {
    if (sweptRef.current) return
    sweptRef.current = true
    for (const e of entries) {
      if (e.kind === 'equation' && deserializeEquation(e.text) === null) {
        // eslint-disable-next-line no-console
        console.warn('[Arsenal] auto-migrating corrupt equation entry → gotcha:', e.id)
        changeKind(e.id, 'gotcha')
      }
    }
    // intentionally exclude `entries` from deps — sweep runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Counts per kind (includes pinned across all kinds)
  const counts = useMemo(() => ({
    all:      entries.length,
    gotcha:   entries.filter(e => e.kind === 'gotcha').length,
    trick:    entries.filter(e => e.kind === 'trick').length,
    tip:      entries.filter(e => e.kind === 'tip').length,
    equation: entries.filter(e => e.kind === 'equation').length,
    table:    entries.filter(e => e.kind === 'table').length,
    pinned:   entries.filter(e => e.pinned).length,
  }), [entries])

  // Filtered + sorted (pinned first, then newest)
  const visible = useMemo(() => {
    let list = entries
    if (kindFilter === 'pinned') list = list.filter(e => e.pinned)
    else if (kindFilter !== 'all') list = list.filter(e => e.kind === kindFilter)
    if (topicFilter !== 'all') list = list.filter(e => e.topicId === topicFilter)
    return [...list].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.createdAt - a.createdAt
    })
  }, [entries, kindFilter, topicFilter])

  // Topics actually present in the current set (so we don't show empty filter options)
  const presentTopics = useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => { if (e.topicId) set.add(e.topicId) })
    return Array.from(set)
  }, [entries])

  const handleDelete = (id: string) => {
    setRemovingIds(prev => new Set(prev).add(id))
    setTimeout(() => {
      removeEntry(id)
      setRemovingIds(prev => { const next = new Set(prev); next.delete(id); return next })
    }, 220)
  }

  const startEdit = (entry: ArsenalEntry) => {
    // Equation kind has its OWN editor (EquationCardEditor via setEditingEq)
    // — never populate the textarea with the raw JSON `{"label":"…","latex":"…"}`,
    // which is what caused the wipe-to-empty regression in PR #60. Per plan
    // curried-waddling-pelican Part C.
    if (entry.kind === 'equation' || entry.kind === 'table') return
    setEditingId(entry.id)
    setEditingText(entry.text)
  }
  const commitEdit = () => {
    if (editingId && editingText.trim()) editEntry(editingId, editingText.trim())
    setEditingId(null)
    setEditingText('')
  }
  const cancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  const handleShareConfirmed = async (id: string) => {
    const entry = entries.find(e => e.id === id)
    if (!entry) { setConfirmShareId(null); return }
    setSharingId(id)
    setShareError(null)
    const res = await publishEntry({ kind: entry.kind, text: entry.text, topicId: entry.topicId })
    setSharingId(null)
    setConfirmShareId(null)
    if (!res.ok) {
      setShareError(res.error ?? 'שיתוף נכשל')
      return
    }
    markPublished(id, Date.now())
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const arsenalIntroRef = useRef<HTMLHeadingElement>(null)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useTutorialStep('arsenal-intro', arsenalIntroRef, {
    title: 'הארסנל שלך',
    body: 'כל קאצ\', טריק או טיפ שתופסים בלימוד נכנס לכאן. כל 3 פריטים מאותו סוג מזכים אותך במנת קסם — תראה אותן בסרגל העליון.',
    placement: 'bottom',
  })

  return (
    <div data-tour="arsenal-screen" dir="rtl" style={{
      flex: 1, overflow: 'auto', padding: '32px 40px',
      fontFamily: "'Rubik', 'Assistant', sans-serif",
      background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(99,102,241,0.04) 50%, rgba(168,85,247,0.05) 100%)',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <h1 ref={arsenalIntroRef} style={{ fontSize: 30, fontWeight: 800, color: TEXT_DARK, margin: 0, letterSpacing: 0.3 }}>
            🎯 הארסנל שלי
          </h1>
          <div style={{ fontSize: 14, color: TEXT_LIGHT, marginTop: 4 }}>
            {entries.length === 0
              ? 'אוסף אישי של קאצ\'ים, טריקים וטיפים שתפסת בדרך'
              : `${entries.length} פריטים שתפסת עד עכשיו · המשך לתפוס!`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Tab toggle: my arsenal vs community */}
          <div style={{
            display: 'inline-flex', background: 'rgba(255,255,255,0.55)',
            border: '1px solid rgba(127,155,217,0.4)', borderRadius: 22, padding: 3,
          }}>
            <button
              onClick={() => setView('mine')}
              style={{
                background: view === 'mine' ? '#6366f1' : 'transparent',
                color: view === 'mine' ? '#fff' : TEXT_MED,
                border: 'none', borderRadius: 18, padding: '6px 14px',
                cursor: 'pointer', fontFamily: "'Rubik', sans-serif",
                fontSize: 13, fontWeight: 700,
              }}
            >האוסף שלי</button>
            <button
              onClick={() => setView('community')}
              style={{
                background: view === 'community' ? '#6366f1' : 'transparent',
                color: view === 'community' ? '#fff' : TEXT_MED,
                border: 'none', borderRadius: 18, padding: '6px 14px',
                cursor: 'pointer', fontFamily: "'Rubik', sans-serif",
                fontSize: 13, fontWeight: 700,
              }}
            >הקהילה</button>
          </div>
          {/* Toggle: show explanatory hover tooltips on the filter pills */}
          <button
            onClick={toggleHints}
            title={showHints ? 'כיבוי הסברים' : 'הצגת הסברים'}
            aria-label={showHints ? 'כיבוי הסברים' : 'הצגת הסברים'}
            style={{
              background: showHints ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${showHints ? 'rgba(99,102,241,0.45)' : 'rgba(127,155,217,0.35)'}`,
              borderRadius: 18, padding: '7px 13px', cursor: 'pointer',
              fontFamily: "'Rubik', sans-serif", fontSize: 12, fontWeight: 600,
              color: showHints ? '#4338ca' : TEXT_LIGHT,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {showHints ? '💬 הסברים פעילים' : '🔇 הסברים כבויים'}
          </button>
          <button onClick={() => setShowAddModal(true)} style={primaryBtn}>+ הוסף חדש</button>
        </div>
      </div>

      {shareError && (
        <div style={{
          background: 'rgba(239,68,68,0.12)', color: '#b91c1c',
          border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: 12, padding: '10px 14px',
          marginBottom: 12, fontSize: 13,
          fontFamily: "'Rubik', sans-serif",
        }}>⚠️ {shareError}</div>
      )}

      {view === 'community' ? (
        <CommunityArsenalTab />
      ) : (<>
      {/* Kind filter pills — labels + icons sourced from KIND_META so renames
          stay consistent across capture / list / cards. */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <FilterPill label="הכל" icon="🎯" count={counts.all}
          selected={kindFilter === 'all'} onClick={() => setKindFilter('all')}
          color="#6366f1" bg="rgba(99,102,241,0.12)"
          tip={showHints ? 'כל הפריטים בארסנל שלך' : undefined} />
        <FilterPill label={KIND_META.gotcha.labelPlural} icon={KIND_META.gotcha.icon} count={counts.gotcha}
          selected={kindFilter === 'gotcha'} onClick={() => setKindFilter('gotcha')}
          color={KIND_META.gotcha.color} bg={KIND_META.gotcha.bg}
          tip={showHints ? KIND_META.gotcha.description : undefined} />
        <FilterPill label={KIND_META.trick.labelPlural} icon={KIND_META.trick.icon} count={counts.trick}
          selected={kindFilter === 'trick'} onClick={() => setKindFilter('trick')}
          color={KIND_META.trick.color} bg={KIND_META.trick.bg}
          tip={showHints ? KIND_META.trick.description : undefined} />
        <FilterPill label={KIND_META.tip.labelPlural} icon={KIND_META.tip.icon} count={counts.tip}
          selected={kindFilter === 'tip'} onClick={() => setKindFilter('tip')}
          color={KIND_META.tip.color} bg={KIND_META.tip.bg}
          tip={showHints ? KIND_META.tip.description : undefined} />
        <FilterPill label="נוסחאות" icon={KIND_META.equation.icon} count={counts.equation}
          selected={kindFilter === 'equation'} onClick={() => setKindFilter('equation')}
          color={KIND_META.equation.color} bg={KIND_META.equation.bg}
          tip={showHints ? KIND_META.equation.description : undefined} />
        <FilterPill label="טבלאות" icon={KIND_META.table.icon} count={counts.table}
          selected={kindFilter === 'table'} onClick={() => setKindFilter('table')}
          color={KIND_META.table.color} bg={KIND_META.table.bg}
          tip={showHints ? KIND_META.table.description : undefined} />
        <FilterPill label="מוצמדים" icon="📍" count={counts.pinned}
          selected={kindFilter === 'pinned'} onClick={() => setKindFilter('pinned')}
          color="#92400e" bg="rgba(251,191,36,0.18)"
          tip={showHints ? 'הפריטים שהצמדת — תמיד למעלה ברשימה' : undefined} />

        {/* Topic dropdown — pushed to the start (RTL: visually left) */}
        {presentTopics.length > 0 && (
          <select
            dir="rtl"
            value={topicFilter}
            onChange={e => setTopicFilter(e.target.value as FilterTopic)}
            aria-label="סינון לפי נושא"
            style={{
              marginInlineStart: 'auto',
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(127,155,217,0.4)',
              borderRadius: 18, padding: '8px 14px',
              fontFamily: "'Rubik', sans-serif", fontSize: 13, color: TEXT_DARK,
              cursor: 'pointer',
              textAlign: 'right',
              minHeight: 44,
            }}
          >
            <option value="all" dir="rtl">כל הנושאים</option>
            {presentTopics.map(t => (
              <option key={t} value={t} dir="rtl">{TOPIC_LABELS[t] || t}</option>
            ))}
          </select>
        )}
      </div>

      {/* Card grid OR empty state */}
      {visible.length === 0 ? (
        <EmptyState hasEntries={entries.length > 0} />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
          marginTop: 6,
        }}>
          {visible.map((entry, idx) => (
            <ArsenalCard
              key={entry.id}
              entry={entry}
              indexInList={idx}
              isEditing={editingId === entry.id}
              editingText={editingText}
              onEditingTextChange={setEditingText}
              onStartEdit={() => startEdit(entry)}
              onCommitEdit={commitEdit}
              onCancelEdit={cancelEdit}
              onTogglePin={() => togglePin(entry.id)}
              onDelete={() => handleDelete(entry.id)}
              removing={removingIds.has(entry.id)}
              onShare={() => setConfirmShareId(entry.id)}
              canShare={SUPABASE_CONFIGURED && !entry.publishedAt}
              isPublished={!!entry.publishedAt}
              sharing={sharingId === entry.id}
              onEditEquation={(segIdx, newLatex) => {
                editEntry(entry.id, replaceMathSegment(entry.text, segIdx, newLatex))
              }}
              onChangeKind={(kind) => changeKind(entry.id, kind)}
              onSaveEquation={(serialized) => editEntry(entry.id, serialized)}
            />
          ))}
        </div>
      )}
      </>)}

      {confirmShareId && (
        <ConfirmShareDialog
          onCancel={() => setConfirmShareId(null)}
          onConfirm={() => handleShareConfirmed(confirmShareId)}
          loading={sharingId === confirmShareId}
        />
      )}

      {showAddModal && (
        <AddEntryModal
          onClose={() => setShowAddModal(false)}
          onSave={(kind, text, topicId) => {
            addEntry({ kind, text, topicId, source: 'manual' })
            setShowAddModal(false)
          }}
          presentTopics={Object.keys(TOPIC_LABELS)}
        />
      )}
    </div>
  )
}

// ── Filter pill ──────────────────────────────────────────────────────────────
function FilterPill({ label, icon, count, selected, onClick, color, bg, tip }: {
  label: string; icon: string; count: number; selected: boolean; onClick: () => void; color: string; bg: string;
  /** If provided, shown as a hover tooltip explaining what this filter category means. */
  tip?: string
}) {
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}
          onMouseLeave={e => {
            const tip = (e.currentTarget.querySelector('[data-fp-tooltip]') as HTMLElement | null)
            if (tip) tip.style.opacity = '0'
          }}
          onMouseEnter={e => {
            const t = (e.currentTarget.querySelector('[data-fp-tooltip]') as HTMLElement | null)
            if (t) t.style.opacity = '1'
          }}
    >
      <button
        onClick={onClick}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: selected ? color : bg,
          border: `1.5px solid ${selected ? color : color + '50'}`,
          color: selected ? '#fff' : color,
          borderRadius: 18, padding: '7px 14px',
          cursor: 'pointer', fontWeight: 600, fontSize: 13,
          fontFamily: "'Rubik', sans-serif",
          transition: 'all 0.18s ease',
          boxShadow: selected ? `0 4px 14px ${color}55` : 'none',
          transform: selected ? 'translateY(-1px)' : 'translateY(0)',
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
        <span style={{ opacity: selected ? 0.95 : 0.7, fontSize: 11, fontWeight: 700 }}>({count})</span>
      </button>
      {tip && (
        <span
          data-fp-tooltip
          dir="rtl"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', insetInlineStart: 0,
            background: 'rgba(15,15,35,0.96)', color: '#fff',
            padding: '8px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.5,
            boxShadow: '0 8px 24px rgba(0,0,0,0.30)',
            border: '1px solid rgba(99,102,241,0.4)',
            opacity: 0, transition: 'opacity 0.18s ease',
            pointerEvents: 'none', zIndex: 50,
            width: 250, fontWeight: 500, fontFamily: "'Rubik', sans-serif",
          }}
        >
          {tip}
        </span>
      )}
    </span>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
function ArsenalCard({
  entry, indexInList, isEditing, editingText, onEditingTextChange,
  onStartEdit, onCommitEdit, onCancelEdit, onTogglePin, onDelete, removing,
  onShare, canShare, isPublished, sharing, onEditEquation, onChangeKind,
  onSaveEquation,
}: {
  entry: ArsenalEntry
  indexInList: number
  isEditing: boolean
  editingText: string
  onEditingTextChange: (s: string) => void
  onStartEdit: () => void
  onCommitEdit: () => void
  onCancelEdit: () => void
  onTogglePin: () => void
  onDelete: () => void
  removing: boolean
  onShare: () => void
  canShare: boolean
  isPublished: boolean
  sharing: boolean
  /** Edits the math segment at `segmentIndex` of entry.text via MathLive. */
  onEditEquation: (segmentIndex: number, newLatex: string) => void
  /** Reclassifies the entry to a different kind (e.g. gotcha → equation). */
  onChangeKind: (kind: ArsenalKind) => void
  /** Saves a full equation edit (label + latex) back to the store. */
  onSaveEquation: (serialized: string) => void
}) {
  const meta = KIND_META[entry.kind]
  const topicLabel = entry.topicId ? TOPIC_LABELS[entry.topicId] || entry.topicId : null

  // Local state for inline equation editing (equation kind only)
  const [editingEq, setEditingEq] = useState(false)
  const isEquation = entry.kind === 'equation'
  const isTable = entry.kind === 'table'

  // Parse equation payload once (memoized on entry.text)
  const eqData = useMemo(
    () => isEquation ? deserializeEquation(entry.text) : null,
    [isEquation, entry.text],
  )
  // Parse table payload once (table kind only).
  const tableData = useMemo(
    () => isTable ? deserializeTable(entry.text) : null,
    [isTable, entry.text],
  )

  const handleStartEdit = () => {
    if (isEquation) {
      setEditingEq(true)
    } else {
      onStartEdit()
    }
  }

  const handleCancelEq = () => setEditingEq(false)
  const handleSaveEq = (label: string, latex: string, explanation: string) => {
    // Preserve the existing `numbered` flag across a label/latex edit — the
    // editor doesn't touch it, so re-serialize with the current value.
    onSaveEquation(serializeEquation(label, latex, explanation, eqData?.numbered ?? false))
    setEditingEq(false)
  }
  // Flip the line-numbering flag and persist (re-serialize keeping everything else).
  const handleToggleNumbered = () => {
    if (!eqData) return
    onSaveEquation(serializeEquation(eqData.label, eqData.latex, eqData.explanation, !eqData.numbered))
  }

  return (
    <div
      className={`arsenal-card ${removing ? 'arsenal-card-out' : 'arsenal-card-in'}`}
      style={{
        background: 'var(--sh-glass-card, rgba(255,255,255,0.85))',
        borderRadius: 18,
        // Pinned border: 2px gold ring with shadow so it stays visible in both
        // light and dark mode (was a translucent #f59e0b80 invisible in dark).
        border: entry.pinned ? '2px solid #D4AF37' : '1px solid rgba(255,255,255,0.5)',
        boxShadow: entry.pinned
          ? '0 6px 22px rgba(31,62,108,0.15), 0 0 0 3px rgba(212,175,55,0.18)'
          : 'var(--sh-card-shadow, 0 6px 22px rgba(31,62,108,0.15))',
        padding: 16,
        position: 'relative',
        animationDelay: `${Math.min(indexInList * 50, 600)}ms`,
        display: 'flex', flexDirection: 'column', gap: 10, minHeight: 140,
      }}
    >
      {/* Top row: kind badge, topic chip, pinned star */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          background: meta.bg, color: meta.color,
          border: `1px solid ${meta.border}`,
          padding: '3px 10px', borderRadius: 10,
          fontSize: 11, fontWeight: 700,
        }}>
          {meta.icon} {meta.label}
        </span>
        {topicLabel && (
          <span style={{
            background: 'rgba(99,102,241,0.08)', color: '#4338ca',
            padding: '3px 10px', borderRadius: 10,
            fontSize: 11, fontWeight: 600,
          }}>
            {topicLabel}
          </span>
        )}
        {entry.pinned && (
          <span style={{ marginInlineStart: 'auto', fontSize: 14 }}>📌</span>
        )}
      </div>

      {/* Body — equation kind gets its own renderer; others use ArsenalEntryBody */}
      {isEquation ? (
        editingEq ? (
          <EquationCardEditor
            initialLabel={eqData?.label ?? ''}
            initialLatex={eqData?.latex ?? ''}
            initialExplanation={eqData?.explanation ?? ''}
            onSave={handleSaveEq}
            onCancel={handleCancelEq}
          />
        ) : (
          <EquationCardBody eqData={eqData} rawText={entry.text} onToggleNumbered={handleToggleNumbered} />
        )
      ) : isTable ? (
        <TableCardBody data={tableData} />
      ) : isEditing ? (
        <textarea
          autoFocus
          value={editingText}
          onChange={e => onEditingTextChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onCommitEdit()
            else if (e.key === 'Escape') onCancelEdit()
          }}
          style={{
            flex: 1, resize: 'vertical', minHeight: 70,
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: 10, padding: '8px 10px',
            fontFamily: "'Assistant', sans-serif", fontSize: 14,
            lineHeight: 1.6, color: TEXT_DARK,
            background: 'rgba(255,255,255,0.7)',
          }}
        />
      ) : (
        <div
          // Force RTL on the catch text so Hebrew lays out correctly even when
          // mixed with Latin/numeric tokens (e.g. equations or formula names).
          // unicode-bidi:plaintext lets each line resolve its own direction.
          dir="rtl"
          style={{
            flex: 1, fontFamily: "'Assistant', sans-serif", fontSize: 14,
            color: TEXT_MED, lineHeight: 1.6, whiteSpace: 'pre-wrap',
            direction: 'rtl', textAlign: 'right',
            unicodeBidi: 'plaintext' as React.CSSProperties['unicodeBidi'],
            // Long auto-extracted equations (gotcha-kind with math content)
            // render as one wide inline-block KaTeX node and overflow the
            // card edge. Allow horizontal scroll. Per user 2026-05-26.
            overflowX: 'auto',
            overflowY: 'hidden',
            maxWidth: '100%',
          }}
        >
          <ArsenalEntryBody text={entry.text} onEditEquation={onEditEquation} />
        </div>
      )}

      {/* Footer: timestamp + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: TEXT_LIGHT }}>
          {relativeTime(entry.createdAt)}
        </span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {/* Equation edit flow: show save/cancel when editing equation inline */}
          {isEquation && editingEq ? null /* buttons rendered inside EquationCardEditor */ : (
            (isEditing && !isEquation) ? (
              <>
                <button onClick={onCommitEdit} style={iconBtn('rgba(16,185,129,0.18)', '#065f46')} title="שמור">✓</button>
                <button onClick={onCancelEdit} style={iconBtn('rgba(127,155,217,0.18)', TEXT_DARK)} title="בטל">✕</button>
              </>
            ) : (
              <>
                <button
                  onClick={onTogglePin}
                  style={iconBtn(entry.pinned ? 'rgba(245,158,11,0.22)' : 'rgba(127,155,217,0.12)', entry.pinned ? '#92400e' : TEXT_LIGHT)}
                  title={entry.pinned ? 'בטל הצמדה' : 'הצמד'}
                >
                  📌
                </button>
                {!isTable && (
                  <button onClick={handleStartEdit} style={iconBtn('rgba(127,155,217,0.12)', TEXT_LIGHT)} title="ערוך">✏️</button>
                )}
                {/* "המר לנוסחה" reclassify — shown only when text passes math
                    heuristic AND the entry is not already equation kind.
                    Lets users fix broken auto-extracted gotcha entries in one tap. */}
                {!isEquation && looksLikeMath(entry.text) && (
                  <button
                    onClick={() => onChangeKind('equation')}
                    style={iconBtn(KIND_META.equation.bg, KIND_META.equation.color)}
                    title="המר לנוסחה"
                  >
                    Σ המר
                  </button>
                )}
                {canShare && !isTable && (
                  <button
                    onClick={onShare}
                    disabled={sharing}
                    style={iconBtn('rgba(99,102,241,0.14)', '#4338ca')}
                    title="🌐 שתף בקהילה"
                  >
                    {sharing ? '…' : '🌐 שתף בקהילה'}
                  </button>
                )}
                {isPublished && (
                  <span
                    style={{
                      background: 'rgba(16,185,129,0.18)',
                      border: '1px solid rgba(16,185,129,0.35)',
                      color: '#065f46', borderRadius: 8, padding: '4px 8px',
                      fontSize: 11, fontWeight: 700, fontFamily: "'Rubik', sans-serif",
                    }}
                    title="כבר משותף לקהילה"
                  >
                    🌐 משותף
                  </span>
                )}
                <button onClick={onDelete} style={iconBtn('rgba(239,68,68,0.12)', '#b91c1c')} title="מחק">🗑</button>
              </>
            )
          )}
        </div>
      </div>
    </div>
  )
}

// ── Table card body ───────────────────────────────────────────────────────────
/** Read-only preview of a table-kind card. Mirrors the canvas table look from
 *  public/mindmap.html: app-blue gradient header, alternating data rows, and a
 *  tinted+bold right-most "parameter" column when paramCol is set. */
function TableCardBody({ data }: { data: TableData | null }) {
  if (!data || data.cols.length === 0) {
    return <div style={{ flex: 1, fontSize: 12, color: TEXT_LIGHT }}>טבלה לא תקינה</div>
  }
  const { cols, rows, paramCol } = data
  const paramIdx = paramCol ? cols.length - 1 : -1
  return (
    <div dir="ltr" style={{
      flex: 1, overflow: 'auto', maxHeight: 220,
      borderRadius: 10, border: '1px solid rgba(31,62,108,0.15)',
    }}>
      {/* dir=ltr so columns keep canvas order (cols[0] left → param column on
          the right), matching the whiteboard. Cell text uses dir=auto so Hebrew
          still resolves right-to-left within each cell. */}
      <table style={{
        borderCollapse: 'collapse', width: '100%',
        fontFamily: "'Assistant', sans-serif", fontSize: 12,
      }}>
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={i} dir="auto" style={{
                background: 'linear-gradient(90deg,#1F3E6C,#3351CA)',
                color: '#fff', fontWeight: 700, padding: '5px 8px',
                textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)',
                whiteSpace: 'nowrap',
              }}>{c.name || ' '}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {cols.map((_, ci) => {
                const isParam = ci === paramIdx
                const even = ri % 2 === 0
                const bg = isParam
                  ? (even ? '#eef2fb' : '#e4eaf7')
                  : (even ? '#ffffff' : '#f8f8ff')
                return (
                  <td key={ci} dir="auto" style={{
                    background: bg,
                    color: isParam ? '#1F3E6C' : '#1a1a1a',
                    fontWeight: isParam ? 700 : 400,
                    textAlign: isParam ? 'right' : 'center',
                    padding: '4px 8px', border: '1px solid #d1d5db',
                    whiteSpace: 'nowrap',
                  }}>{row[ci] ?? ''}</td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Equation card body ────────────────────────────────────────────────────────
/** Renders the body of an equation-kind card: optional Hebrew label above a
 *  KaTeX block. Falls back to raw text if the stored format is not valid JSON.
 *  Uses MathLineBlock (already imported) so rendering is consistent with
 *  LessonScreen equation blocks. */
function EquationCardBody({
  eqData,
  rawText,
  onToggleNumbered,
}: {
  eqData: EquationData | null
  rawText: string
  /** Flips the line-numbering flag for this entry (equation cards only). */
  onToggleNumbered?: () => void
}) {
  if (!eqData) {
    // Stored text is not the JSON equation format — render as plain text
    // (backwards compat for any manually-entered gotchas reclassified to equation).
    return (
      <div dir="rtl" style={{ flex: 1, fontFamily: "'Assistant', sans-serif", fontSize: 14, color: TEXT_MED, lineHeight: 1.6 }}>
        <ArsenalEntryBody text={rawText} />
      </div>
    )
  }

  // Normalize legacy adjacent gathered blocks always; apply line numbers when on.
  const renderLatex = eqData.numbered
    ? buildNumberedLatex(eqData.latex)
    : mergeAdjacentGathered(eqData.latex)
  // The toggle only makes sense when there are 2+ rows to number. Detect a row
  // break in the merged latex (a single formula has none).
  const multiRow = /\\\\/.test(mergeAdjacentGathered(eqData.latex))

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {eqData.label ? (
        <div dir="rtl" style={{
          fontSize: 12, fontWeight: 600, color: KIND_META.equation.color,
          fontFamily: "'Rubik', sans-serif", opacity: 0.85,
        }}>
          {eqData.label}
        </div>
      ) : null}
      {/* Horizontal scroll container — KaTeX can render equations wider than the
       *  card body. Forcing LTR direction lets the math read naturally inside
       *  an RTL card. Use KatexInline (not MathLineBlock) because raw LaTeX
       *  has no Hebrew runs — MathLineBlock would bail out and render plain
       *  text. Per user 2026-05-26 screenshot. */}
      <div
        dir="ltr"
        style={{
          maxWidth: '100%',
          // No horizontal scrollbar — the user disliked the RTL-origin scroll.
          // Multi-line solutions wrap vertically via \begin{gathered}; a rare
          // over-wide single formula is scaled to fit instead of scrolled.
          // Per user 2026-05-28.
          overflow: 'hidden',
          padding: '6px 4px',
          direction: 'ltr',
          textAlign: 'center',
          fontSize: 17,
        }}
      >
        {/* Multi-line equations (\begin{gathered}…) only stack as separate
         *  lines under KaTeX displayMode. Detect a multi-line env / row break
         *  and switch on display mode so the worked solution shows line-by-line.
         *  Per user 2026-05-28.
         *
         *  `renderLatex` always merges legacy adjacent gathered blocks (old
         *  side-by-side bug → vertical stack). When `numbered` is on, rows get
         *  right-side (1),(2),(3)… numbers; otherwise it renders exactly as
         *  before. Per user 2026-05-29. */}
        <KatexInline
          latex={renderLatex}
          displayMode={/\\begin\{(gathered|aligned|array|cases)\}|\\\\/.test(renderLatex)}
        />
      </div>
      {/* Line-numbering toggle — only meaningful for multi-row formulas. */}
      {multiRow && onToggleNumbered ? (
        <button
          type="button"
          onClick={onToggleNumbered}
          dir="rtl"
          aria-pressed={!!eqData.numbered}
          title={eqData.numbered ? 'הסתר מספור שורות' : 'הצג מספור שורות'}
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            border: `1px solid ${eqData.numbered ? '#D4AF37' : KIND_META.equation.border}`,
            background: eqData.numbered ? 'rgba(212,175,55,0.16)' : 'rgba(255,255,255,0.6)',
            color: eqData.numbered ? '#92400e' : '#1F3E6C',
            borderRadius: 8, padding: '3px 9px',
            fontSize: 11, fontWeight: 700,
            fontFamily: "'Rubik', sans-serif", cursor: 'pointer',
          }}
        >
          🔢 מספור שורות
        </button>
      ) : null}
      {/* Explanation preview — first ~2 lines, plain Hebrew prose. Per user
       *  2026-05-28. Full text shows on edit. */}
      {eqData.explanation ? (
        <div dir="rtl" style={{
          fontSize: 13, lineHeight: 1.5, color: TEXT_MED,
          fontFamily: "'Assistant', sans-serif",
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', marginTop: 4,
        }}>
          {eqData.explanation}
        </div>
      ) : null}
    </div>
  )
}

// ── Equation card editor ──────────────────────────────────────────────────────
/** Inline editor for equation-kind cards. Pre-fills label + latex, uses a
 *  math-field (MathLive) for the formula input, and calls onSave / onCancel.
 *  Mirrors the pattern from EquationEditor and the AddEntryModal equation path. */
function EquationCardEditor({
  initialLabel,
  initialLatex,
  initialExplanation,
  onSave,
  onCancel,
}: {
  initialLabel: string
  initialLatex: string
  initialExplanation: string
  onSave: (label: string, latex: string, explanation: string) => void
  onCancel: () => void
}) {
  const [label, setLabel] = useState(initialLabel)
  const [latex, setLatex] = useState(initialLatex)
  const [explanation, setExplanation] = useState(initialExplanation)
  const [mathReady, setMathReady] = useState(false)
  const fieldRef = useRef<HTMLElement | null>(null)
  const eqMeta = KIND_META.equation

  useEffect(() => {
    let active = true
    loadMathLive().then(() => { if (active) setMathReady(true) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!mathReady) return
    const el = fieldRef.current
    if (!el) return
    const onInput = () => {
      setLatex((el as unknown as { value: string }).value)
    }
    const onFocus = () => {
      ;(window as unknown as { wsActiveMathField?: HTMLElement }).wsActiveMathField = el
    }
    el.addEventListener('input', onInput)
    el.addEventListener('focus', onFocus)
    ;(el as unknown as { focus: () => void }).focus()
    onFocus()
    return () => {
      el.removeEventListener('input', onInput)
      el.removeEventListener('focus', onFocus)
    }
  }, [mathReady])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        type="text"
        dir="rtl"
        value={label}
        onChange={e => setLabel(e.target.value)}
        placeholder="תווית (אופציונלי)…"
        style={{
          padding: '6px 8px', border: `1px solid ${eqMeta.border}`,
          borderRadius: 8, fontFamily: "'Assistant', sans-serif",
          fontSize: 13, color: TEXT_DARK,
          background: 'rgba(255,255,255,0.7)',
          boxSizing: 'border-box', width: '100%',
        }}
      />
      <div style={{
        border: `1.5px solid ${eqMeta.border}`, borderRadius: 10,
        padding: '8px 10px', background: eqMeta.bg, minHeight: 48,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {mathReady
            ? createElement(
                'math-field' as unknown as 'div',
                {
                  ref: (el: HTMLElement | null): void => { fieldRef.current = el },
                  'math-virtual-keyboard-policy': 'manual',
                  'virtual-keyboard-mode': 'onfocus',
                  'smart-mode': 'true',
                  'default-mode': 'math',
                  style: {
                    width: '100%', fontSize: 18,
                    border: 0, outline: 'none',
                    background: 'transparent',
                    '--keystroke-caret-color': eqMeta.color,
                    '--latex-color': 'transparent',
                  } as React.CSSProperties,
                },
                initialLatex,
              )
            : <span style={{ fontSize: 12, color: TEXT_LIGHT }}>טוען…</span>
          }
        </div>
        <button
          onClick={() => onSave(label, latex, explanation)}
          style={iconBtn('rgba(16,185,129,0.18)', '#065f46')}
          title="שמור"
          aria-label="שמור נוסחה"
        >✓</button>
        <button
          onClick={onCancel}
          style={iconBtn('rgba(127,155,217,0.18)', TEXT_DARK)}
          title="בטל"
          aria-label="בטל"
        >✕</button>
      </div>
      {/* Explanation editor — plain prose, separate from the math-field. */}
      <textarea
        dir="rtl"
        value={explanation}
        onChange={e => setExplanation(e.target.value)}
        placeholder="הסבר (אופציונלי)…"
        style={{
          width: '100%', minHeight: 60, resize: 'vertical',
          border: `1px solid ${eqMeta.border}`, borderRadius: 8,
          padding: '8px 10px', fontFamily: "'Assistant', sans-serif",
          fontSize: 13, lineHeight: 1.6, color: TEXT_DARK,
          background: 'rgba(255,255,255,0.85)', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

// ── Entry body with inline math rendering ────────────────────────────────────
// Renders entry text with KaTeX-rendered $..$ segments inline. Falls back to
// plain text if window.katex isn't loaded yet. Splits on dollar pairs so prose
// like "הנוסחה היא $\bar{x} = \frac{\sum x}{n}$ בקיצור" reads naturally.
//
// Each math segment is a BLOCK equation card (displayMode) AND independently
// editable via a hover pencil — the user edits the rendered formula through
// MathLive (`<math-field>`), never the LaTeX source.
function ArsenalEntryBody({
  text,
  onEditEquation,
}: {
  text: string
  /** Called with the segment index and the new LaTeX after the user commits a
   *  per-equation edit. Optional: when omitted, equations stay read-only. */
  onEditEquation?: (segmentIndex: number, newLatex: string) => void
}) {
  // Pre-process: auto-detect math-like substrings and wrap them in $...$
  // before tokenizing. Users who entered math without $ delimiters (the vast
  // majority of existing arsenal entries) still get rendered KaTeX cards.
  const segments = useMemo(() => tokenizeEntry(autoWrapMath(text)), [text])

  return (
    <>
      {segments.map((seg, idx) =>
        seg.type === 'text'
          ? <span key={idx}>{seg.value}</span>
          : (
            <EquationCard
              key={idx}
              latex={seg.value}
              onCommit={onEditEquation ? (newLatex) => onEditEquation(idx, newLatex) : undefined}
            />
          ),
      )}
    </>
  )
}

function EquationCard({ latex, onCommit }: { latex: string; onCommit?: (newLatex: string) => void }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [failed, setFailed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [hovering, setHovering] = useState(false)
  const canEdit = !!onCommit

  useEffect(() => {
    if (editing) return // skip preview render while the math-field owns the cell
    if (!ref.current) return
    const w = window as unknown as { katex?: { render: (s: string, el: HTMLElement, opts: object) => void } }
    if (!w.katex) { setFailed(true); return }
    try {
      w.katex.render(latex, ref.current, { throwOnError: false, displayMode: false, output: 'html' })
      setFailed(false)
    } catch {
      setFailed(true)
    }
  }, [latex, editing])

  return (
    <span
      dir="ltr"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        position: 'relative',
        display: 'inline-block',
        margin: '2px 3px',
        padding: '2px 6px',
        // transparent so equation inherits surrounding navy/gold theme (Issue 2)
        background: 'transparent',
        borderInlineStart: editing ? '2px solid #6366f1' : '2px solid #D4AF37',
        border: editing ? '1px solid rgba(99,102,241,0.45)' : '1px solid rgba(212,175,55,0.25)',
        borderRadius: 5,
        boxShadow: 'none',
        unicodeBidi: 'isolate' as React.CSSProperties['unicodeBidi'],
        verticalAlign: 'middle',
      }}
    >
      {editing && canEdit ? (
        <EquationEditor
          initial={latex}
          onCancel={() => setEditing(false)}
          onSave={(next) => {
            onCommit!(next)
            setEditing(false)
          }}
        />
      ) : failed ? (
        <span style={{ color: 'var(--sh-text-light)', fontSize: 12, fontStyle: 'italic' }}>
          לא ניתן להציג את המשוואה
        </span>
      ) : (
        <span ref={ref} style={{ display: 'inline-block', overflow: 'visible' }} />
      )}

      {/* Hover-pencil overlay: lets the user edit just THIS equation via
          MathLive, not the LaTeX source. Hidden while editing or when the
          parent didn't pass an onCommit (read-only contexts). */}
      {canEdit && !editing && hovering && (
        <button
          aria-label="ערוך משוואה"
          title="ערוך משוואה"
          onClick={(e) => { e.stopPropagation(); setEditing(true) }}
          style={{
            position: 'absolute',
            top: 4,
            insetInlineEnd: 4,
            background: 'rgba(99,102,241,0.16)',
            border: '1px solid rgba(99,102,241,0.4)',
            color: '#4338ca',
            borderRadius: 6,
            padding: '2px 6px',
            cursor: 'pointer',
            fontSize: 12,
            lineHeight: 1,
            fontFamily: "'Rubik', sans-serif",
          }}
        >
          ✏️
        </button>
      )}
    </span>
  )
}

/** In-place MathLive editor used inside EquationCard. Renders a `<math-field>`
 *  custom element with the LaTeX preloaded; commit / cancel buttons return the
 *  edited LaTeX (or discard the change). The virtual-keyboard popover stays
 *  hidden so the user only sees rendered math — never the source code. */
function EquationEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: string
  onSave: (latex: string) => void
  onCancel: () => void
}) {
  const fieldRef = useRef<HTMLElement | null>(null)
  const [ready, setReady] = useState(false)
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    let active = true
    loadMathLive().then(() => { if (active) setReady(true) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!ready) return
    const el = fieldRef.current
    if (!el) return
    const handler = () => {
      const value = (el as unknown as { value: string }).value
      setDraft(value)
    }
    el.addEventListener('input', handler)
    // Track the most-recently-focused math-field so the global
    // CalculatorDrawer can insert results into the right one regardless of
    // which surface (Arsenal / Notebook / Mindmap) hosts it.
    const onFocus = () => { (window as unknown as { wsActiveMathField?: HTMLElement }).wsActiveMathField = el }
    el.addEventListener('focus', onFocus)
    ;(el as unknown as { focus: () => void }).focus()
    onFocus()
    return () => {
      el.removeEventListener('input', handler)
      el.removeEventListener('focus', onFocus)
    }
  }, [ready])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {ready
          ? createElement(
              'math-field' as unknown as 'div',
              {
                ref: (el: HTMLElement | null): void => { fieldRef.current = el },
                'math-virtual-keyboard-policy': 'manual',
                'virtual-keyboard-mode': 'onfocus',
                'smart-mode': 'true',
                'default-mode': 'math',
                style: {
                  width: '100%',
                  fontSize: 18,
                  border: 0,
                  outline: 'none',
                  background: 'transparent',
                  // Hide MathLive's default LaTeX-source caret + popover so the
                  // user only sees the rendered math.
                  '--keystroke-caret-color': 'transparent',
                  '--latex-color': 'transparent',
                } as React.CSSProperties,
              },
              initial,
            )
          : <span style={{ fontSize: 12, color: '#666' }}>טוען עורך נוסחאות…</span>
        }
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onSave(draft) }}
        style={iconBtn('rgba(16,185,129,0.18)', '#065f46')}
        title="שמור"
        aria-label="שמור משוואה"
      >✓</button>
      <button
        onClick={(e) => { e.stopPropagation(); onCancel() }}
        style={iconBtn('rgba(127,155,217,0.18)', TEXT_DARK)}
        title="בטל"
        aria-label="בטל"
      >✕</button>
    </div>
  )
}

// ── Confirm share dialog ─────────────────────────────────────────────────────
function ConfirmShareDialog({ onCancel, onConfirm, loading }: {
  onCancel: () => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <div
      dir="rtl"
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 220,
        background: 'rgba(15,15,35,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'wsFadeIn 0.18s ease',
        fontFamily: "'Rubik', sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(420px, calc(100% - 32px))',
          background: 'var(--sh-glass-card, #fff)',
          borderRadius: 20,
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.5)',
          padding: 26,
        }}
      >
        <h3 style={{ margin: '0 0 10px', color: TEXT_DARK, fontSize: 18, fontWeight: 700 }}>
          🌐 שיתוף בקהילה
        </h3>
        <div style={{ color: TEXT_MED, fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>
          לפרסם את הקאצ' לכל המשתמשים?
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} disabled={loading} style={secondaryBtn}>ביטול</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ ...primaryBtn, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? '…מפרסם' : 'פרסם'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Add modal ────────────────────────────────────────────────────────────────
// serializeEquation / deserializeEquation / looksLikeMath live in arsenalStore.ts
// and are imported above — single source of truth for the equation JSON format.

function AddEntryModal({ onClose, onSave, presentTopics }: {
  onClose: () => void
  onSave: (kind: ArsenalKind, text: string, topicId?: string) => void
  presentTopics: string[]
}) {
  const [kind, setKind] = useState<ArsenalKind>('tip')
  const [text, setText] = useState('')
  const [eqLabel, setEqLabel] = useState('')
  const [eqLatex, setEqLatex] = useState('')
  const [eqExplanation, setEqExplanation] = useState('')
  const [topicId, setTopicId] = useState<string>('')
  const [mathReady, setMathReady] = useState(false)
  const mathFieldRef = useRef<HTMLElement | null>(null)

  // Load MathLive when the user switches to the equation tab
  useEffect(() => {
    if (kind !== 'equation') return
    let active = true
    loadMathLive().then(() => { if (active) setMathReady(true) })
    return () => { active = false }
  }, [kind])

  // Wire up the math-field once it renders
  useEffect(() => {
    if (!mathReady || kind !== 'equation') return
    const el = mathFieldRef.current
    if (!el) return

    // Update draft latex on every keystroke
    const onInput = () => {
      const value = (el as unknown as { value: string }).value
      setEqLatex(value)
    }
    // Expose field globally so the CalculatorDrawer / MathLive keyboard hooks
    // into the correct surface — same pattern as EquationEditor (line ~921).
    const onFocus = () => {
      ;(window as unknown as { wsActiveMathField?: HTMLElement }).wsActiveMathField = el
    }
    el.addEventListener('input', onInput)
    el.addEventListener('focus', onFocus)
    // Auto-focus so the MathLive virtual keyboard opens immediately
    ;(el as unknown as { focus: () => void }).focus()
    onFocus()
    return () => {
      el.removeEventListener('input', onInput)
      el.removeEventListener('focus', onFocus)
    }
  }, [mathReady, kind])

  const isEquation = kind === 'equation'
  const canSave = isEquation
    ? eqLatex.trim().length > 0
    : text.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    if (isEquation) {
      onSave(kind, serializeEquation(eqLabel, eqLatex, eqExplanation), topicId || undefined)
    } else {
      onSave(kind, text.trim(), topicId || undefined)
    }
  }

  const eqMeta = KIND_META.equation

  return (
    <div
      dir="rtl"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,15,35,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'wsFadeIn 0.18s ease',
        fontFamily: "'Rubik', sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(520px, calc(100% - 32px))',
          maxHeight: 'calc(100vh - 48px)', overflowY: 'auto',
          // Opaque (was translucent var(--sh-glass-card) → unreadable over the
          // dark sidebar). Solid white page bg. Per user 2026-05-28.
          background: '#FFFFFF',
          borderRadius: 20,
          boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
          border: '1px solid rgba(127,155,217,0.45)',
          padding: 26,
          animation: 'arsenalCardIn 0.25s cubic-bezier(.22,1.36,.36,1)',
        }}
      >
        <h3 style={{ margin: '0 0 16px', color: TEXT_DARK, fontSize: 20, fontWeight: 700 }}>
          + הוסף פריט חדש לארסנל
        </h3>

        {/* Kind selector — 4 buttons: gotcha / trick / tip / equation */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {(['gotcha', 'trick', 'tip', 'equation'] as ArsenalKind[]).map(k => {
            const m = KIND_META[k]
            const active = kind === k
            return (
              <button
                key={k}
                onClick={() => setKind(k)}
                style={{
                  flex: 1, minWidth: 72,
                  background: active ? m.color : m.bg,
                  border: `1.5px solid ${active ? m.color : m.border}`,
                  color: active ? '#fff' : m.color,
                  borderRadius: 14, padding: '10px 6px',
                  cursor: 'pointer', fontFamily: "'Rubik', sans-serif",
                  fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 18 }}>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>

        {/* Equation mode: label input + math-field */}
        {isEquation ? (
          <div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: TEXT_LIGHT, display: 'block', marginBottom: 4 }}>
                תווית (אופציונלי) — למשל: "ממוצע פשוט"
              </label>
              <input
                type="text"
                dir="rtl"
                value={eqLabel}
                onChange={e => setEqLabel(e.target.value)}
                placeholder="שם הנוסחה בעברית…"
                style={{
                  width: '100%', padding: '8px 10px',
                  border: '1px solid rgba(127,155,217,0.4)',
                  borderRadius: 10, fontFamily: "'Assistant', sans-serif",
                  background: 'rgba(255,255,255,0.6)', fontSize: 14, color: TEXT_DARK,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 12, color: TEXT_LIGHT, display: 'block', marginBottom: 4 }}>
                נוסחה — הקלד באמצעות מקלדת הנוסחאות
              </label>
              <div style={{
                border: `1.5px solid ${eqMeta.border}`,
                borderRadius: 12, padding: '14px 14px',
                background: eqMeta.bg, minHeight: 90,
                display: 'flex', alignItems: 'center',
              }}>
                {mathReady
                  ? createElement(
                      'math-field' as unknown as 'div',
                      {
                        ref: (el: HTMLElement | null): void => { mathFieldRef.current = el },
                        'math-virtual-keyboard-policy': 'manual',
                        'virtual-keyboard-mode': 'onfocus',
                        'smart-mode': 'true',
                        'default-mode': 'math',
                        style: {
                          width: '100%',
                          fontSize: 20,
                          border: 0, outline: 'none',
                          background: 'transparent',
                          '--keystroke-caret-color': eqMeta.color,
                          '--latex-color': 'transparent',
                        } as React.CSSProperties,
                      },
                    )
                  : <span style={{ fontSize: 13, color: TEXT_LIGHT }}>טוען מקלדת נוסחאות…</span>
                }
              </div>
            </div>
            {/* Explanation — plain Hebrew prose goes HERE, not in the math-field
             *  (typing prose into the math-field rendered some words as huge
             *  italic math). Per user 2026-05-28. */}
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 12, color: TEXT_LIGHT, display: 'block', marginBottom: 4 }}>
                הסבר (אופציונלי)
              </label>
              <textarea
                dir="rtl"
                value={eqExplanation}
                onChange={e => setEqExplanation(e.target.value)}
                placeholder="כתוב/י כאן הסבר חופשי על הנוסחה…"
                style={{
                  width: '100%', minHeight: 80, resize: 'vertical',
                  border: '1px solid rgba(127,155,217,0.4)', borderRadius: 10,
                  padding: '8px 10px', fontFamily: "'Assistant', sans-serif",
                  fontSize: 14, lineHeight: 1.6, color: TEXT_DARK,
                  background: 'rgba(255,255,255,0.85)', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        ) : (
          /* Regular text area for gotcha / trick / tip */
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="כתוב/י את הקאצ' שלך כאן…"
            style={{
              width: '100%', minHeight: 110, resize: 'vertical',
              border: '1px solid rgba(127,155,217,0.4)', borderRadius: 12,
              padding: '10px 12px', fontFamily: "'Assistant', sans-serif",
              fontSize: 15, lineHeight: 1.6, color: TEXT_DARK,
              background: 'rgba(255,255,255,0.6)',
              boxSizing: 'border-box',
            }}
          />
        )}

        {/* Optional topic */}
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, color: TEXT_LIGHT, display: 'block', marginBottom: 4 }}>
            נושא (אופציונלי)
          </label>
          <select
            value={topicId}
            onChange={e => setTopicId(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px',
              border: '1px solid rgba(127,155,217,0.4)',
              borderRadius: 10, fontFamily: "'Rubik', sans-serif",
              background: 'rgba(255,255,255,0.6)', fontSize: 13, color: TEXT_DARK,
              boxSizing: 'border-box',
            }}
          >
            <option value="">— ללא נושא —</option>
            {presentTopics.map(t => (
              <option key={t} value={t}>{TOPIC_LABELS[t] || t}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={secondaryBtn}>ביטול</button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{ ...primaryBtn, opacity: canSave ? 1 : 0.4, cursor: canSave ? 'pointer' : 'not-allowed' }}
          >
            שמור לארסנל
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ hasEntries }: { hasEntries: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 20px', textAlign: 'center',
      color: TEXT_LIGHT, fontFamily: "'Rubik', sans-serif",
    }}>
      <div style={{ fontSize: 64, marginBottom: 18, opacity: 0.85 }}>🎯</div>
      <div style={{ fontSize: 18, color: TEXT_DARK, fontWeight: 600, marginBottom: 8 }}>
        {hasEntries ? 'אין פריטים שתואמים את הסינון' : 'הארסנל שלך עדיין ריק'}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 'clamp(280px, 80vw, 460px)', textWrap: 'balance', textAlign: 'center' } as React.CSSProperties}>
        {hasEntries
          ? 'נסה לשנות את סוג הפריט או את הנושא, או הוסף פריט חדש.'
          : 'תפוס קאצ\'ים, טריקים וטיפים בזמן הלימוד —\nסמן טקסט בשיעור וייפתח כפתור "שמור לארסנל", או לחץ על "🎯 שמור כקאצ׳" אחרי שאלה שטעית בה.'}
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'לפני רגע'
  if (mins < 60) return `לפני ${mins} דק'`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `לפני ${hours} שעות`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'אתמול'
  if (days < 7) return `לפני ${days} ימים`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `לפני ${weeks} שבועות`
  return new Date(ts).toLocaleDateString('he-IL')
}

const primaryBtn: React.CSSProperties = {
  background: 'var(--sh-btn-color, #6366f1)', color: '#fff', border: 'none',
  borderRadius: 22, padding: '10px 22px', cursor: 'pointer',
  fontFamily: "'Rubik', sans-serif", fontSize: 14, fontWeight: 700,
  boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
  minHeight: 44,
  transition: 'filter 0.15s, transform 0.15s',
}

const secondaryBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.6)', color: TEXT_DARK,
  border: '1px solid rgba(127,155,217,0.4)',
  borderRadius: 22, padding: '10px 18px', cursor: 'pointer',
  fontFamily: "'Rubik', sans-serif", fontSize: 14, fontWeight: 600,
  minHeight: 44,
}

function iconBtn(bg: string, color: string): React.CSSProperties {
  return {
    background: bg, border: `1px solid ${color}30`, color,
    borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
    fontSize: 13, fontFamily: "'Rubik', sans-serif",
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    transition: 'all 0.12s',
    // 44×44 touch target floor (skill ux Touch & Interaction CRITICAL).
    // Visual icon stays small; we just ensure the click box meets minimum.
    minWidth: 44, minHeight: 44,
  }
}
