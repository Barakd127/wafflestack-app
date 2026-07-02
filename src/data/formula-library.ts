// Shared formula library — single source of truth for the WaffleStack
// custom MathLive keyboard, the calculator drawer, AND the mindmap's
// ∑ formula library modal (via /formula-library.json emitted at build).
//
// Migrated 2026-05-26 from the inline FTB_DATA literal that used to live in
// public/mindmap.html around line 5171. Mindmap now fetches the JSON twin so
// it can never drift from the React app.
//
// Each formula carries:
//   - latex   : the canonical LaTeX inserted into a <math-field>
//   - slots   : numeric inputs the calculator drawer prompts the user for
//   - eval    : pure-JS numeric evaluator (or undefined for symbolic-only
//               formulas like CDFs that need a lookup table — the calculator
//               degrades gracefully and just shows the formula).
//   - topics  : lesson-topic ids that should surface this formula by default
//               on the keyboard (read from localStorage.wafflestack-current-topic).
//   - courseId: 'stat-a' (everything here today) or 'stat-b' (placeholder).

export interface Slot {
  key: string
  label: string
  placeholder?: string
  /** LaTeX substring to replace with the user's value when building the
   *  substitution display row in the calculator. e.g. for the mean formula
   *  `\bar{x}=\frac{\sum x_i}{n}` the 'sum' slot has sym '\\sum x_i' and the
   *  'n' slot has sym 'n'. When omitted, the calculator falls back to trying
   *  `label` then `key` as the literal find target. */
  sym?: string
}

export interface Formula {
  id: string
  label: string
  latex: string
  /** Optional short symbolic label shown on the keyboard chip (LHS of the
   *  equation). When omitted, defaults to the LHS auto-extracted from
   *  `latex` via shortLabelOf(). Full `latex` is still inserted on tap. */
  shortLabel?: string
  desc?: string
  slots: Slot[]
  eval?: (vals: Record<string, number>) => number
  topics: string[]
  courseId: 'stat-a' | 'stat-b'
}

export interface FormulaCategory {
  id: string
  label: string
  /** Top-level group selector on the keyboard:
   *  'descriptive' = תיאורית (center / dispersion / transform / correlation / regression / combinatorics)
   *  'inferential' = היסקית   (probability / rv / distributions)
   *  Defaults to 'descriptive' for any category that omits it. */
  group?: 'descriptive' | 'inferential'
  formulas: Formula[]
}

// ─── helpers (kept tiny — no external deps) ──────────────────────────────
const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0)
// Approximate Φ(z) using Abramowitz-Stegun 26.2.17 (max error ~7.5e-8).
function normCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989422804014337 * Math.exp(-z * z / 2)
  const p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return z >= 0 ? 1 - p : p
}
function factorial(n: number): number {
  if (n < 0 || !Number.isFinite(n)) return NaN
  let r = 1
  for (let i = 2; i <= Math.floor(n); i++) r *= i
  return r
}
function nCk(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  k = Math.min(k, n - k)
  let r = 1
  for (let i = 1; i <= k; i++) r = r * (n - k + i) / i
  return r
}

// ─── library ─────────────────────────────────────────────────────────────
export const FORMULA_LIBRARY: FormulaCategory[] = [
  {
    id: 'center',
    group: 'descriptive',
    label: 'תיאורית — מדדי מרכז',
    formulas: [
      {
        id: 'mean_raw',
        label: 'ממוצע (גולמי)',
        latex: '\\bar{x}=\\frac{\\sum x_i}{n}',
        shortLabel: '\\bar{x}',
        desc: 'ממוצע אריתמטי',
        slots: [
          { key: 'sum', label: 'Σx', placeholder: '60+70+80', sym: '\\sum x_i' },
          { key: 'n', label: 'n', placeholder: '3', sym: 'n' },
        ],
        eval: v => v.sum / v.n,
        topics: ['mean', 'weighted-combined'],
        courseId: 'stat-a',
      },
      {
        id: 'mean_freq',
        label: 'ממוצע (טבלת שכיחויות)',
        latex: '\\bar{x}=\\frac{\\sum x_i f(x_i)}{n}',
        shortLabel: '\\bar{x}_f',
        desc: 'ממוצע משוקלל',
        slots: [
          { key: 'sumxf', label: 'Σx·f(x)', sym: '\\sum x_i f(x_i)' },
          { key: 'n', label: 'n', sym: 'n' },
        ],
        eval: v => v.sumxf / v.n,
        topics: ['mean', 'weighted-combined'],
        courseId: 'stat-a',
      },
      {
        id: 'grand_mean',
        label: 'ממוצע כללי',
        latex: '\\bar{\\bar{x}}=\\frac{\\sum_j \\bar{x}_j n_j}{N}',
        shortLabel: '\\bar{\\bar{x}}',
        desc: 'ממוצע משולב בין קבוצות',
        slots: [
          { key: 'sumxn', label: 'Σ x̄ⱼ·nⱼ', sym: '\\sum_j \\bar{x}_j n_j' },
          { key: 'N', label: 'N', sym: 'N' },
        ],
        eval: v => v.sumxn / v.N,
        topics: ['weighted-combined'],
        courseId: 'stat-a',
      },
      {
        id: 'midrange',
        label: 'אמצע טווח',
        latex: 'MR=\\frac{x_{max}+x_{min}}{2}',
        shortLabel: 'MR',
        desc: 'ממוצע הקצוות',
        slots: [
          { key: 'max', label: 'xₘₐₓ', sym: 'x_{max}' },
          { key: 'min', label: 'xₘᵢₙ', sym: 'x_{min}' },
        ],
        eval: v => (v.max + v.min) / 2,
        topics: ['mean', 'std-dev'],
        courseId: 'stat-a',
      },
    ],
  },
  {
    id: 'dispersion',
    group: 'descriptive',
    label: 'תיאורית — מדדי פיזור',
    formulas: [
      {
        id: 'var_raw',
        label: 'שונות (גולמי)',
        latex: 's^2=\\frac{\\sum(x_i-\\bar{x})^2}{n}=\\frac{\\sum x_i^2}{n}-\\bar{x}^2',
        shortLabel: 's^2',
        desc: 'שונות אוכלוסיה',
        slots: [
          { key: 'sumx2', label: 'Σx²', sym: '\\sum x_i^2' },
          { key: 'n', label: 'n', sym: 'n' },
          { key: 'mean', label: 'x̄', sym: '\\bar{x}' },
        ],
        eval: v => v.sumx2 / v.n - v.mean * v.mean,
        topics: ['std-dev', 'observation-changes'],
        courseId: 'stat-a',
      },
      {
        id: 'var_freq',
        label: 'שונות (שכיחויות)',
        latex: 's^2=\\frac{\\sum x_i^2 f(x_i)}{n}-\\bar{x}^2',
        shortLabel: 's^2_f',
        desc: 'שונות מטבלת שכיחויות',
        slots: [
          { key: 'sumx2f', label: 'Σx²·f(x)', sym: '\\sum x_i^2 f(x_i)' },
          { key: 'n', label: 'n', sym: 'n' },
          { key: 'mean', label: 'x̄', sym: '\\bar{x}' },
        ],
        eval: v => v.sumx2f / v.n - v.mean * v.mean,
        topics: ['std-dev'],
        courseId: 'stat-a',
      },
      {
        id: 'std',
        label: 'סטיית תקן',
        latex: 's=\\sqrt{s^2}',
        shortLabel: 's',
        desc: 'סטיית תקן',
        slots: [{ key: 'var', label: 's²', sym: 's^2' }],
        eval: v => Math.sqrt(v.var),
        topics: ['std-dev', 'observation-changes'],
        courseId: 'stat-a',
      },
      {
        id: 'pooled_var',
        label: 'שונות משולבת',
        latex: 's_c^2=\\frac{\\sum n_j s_j^2}{N}+\\frac{\\sum n_j(\\bar{x}_j-\\bar{\\bar{x}})^2}{N}',
        shortLabel: 's_c^2',
        desc: 'שונות בתוך + בין קבוצות',
        slots: [
          { key: 'within', label: 'Σnⱼ·sⱼ²', sym: '\\sum n_j s_j^2' },
          { key: 'between', label: 'Σnⱼ(x̄ⱼ-x̄̄)²', sym: '\\sum n_j(\\bar{x}_j-\\bar{\\bar{x}})^2' },
          { key: 'N', label: 'N', sym: 'N' },
        ],
        eval: v => (v.within + v.between) / v.N,
        topics: ['weighted-combined'],
        courseId: 'stat-a',
      },
    ],
  },
  {
    id: 'transform',
    group: 'descriptive',
    label: 'טרנספורמציות לינאריות',
    formulas: [
      {
        id: 'tr_mean',
        label: 'ממוצע אחרי טרנספורמציה',
        latex: "\\bar{x}'=b\\bar{x}+a",
        shortLabel: "\\bar{x}'",
        desc: "אם x'=bx+a",
        slots: [
          { key: 'b', label: 'b', sym: 'b' },
          { key: 'mean', label: 'x̄', sym: '\\bar{x}' },
          { key: 'a', label: 'a', sym: 'a' },
        ],
        eval: v => v.b * v.mean + v.a,
        topics: ['linear-transformations'],
        courseId: 'stat-a',
      },
      {
        id: 'tr_var',
        label: 'שונות אחרי טרנספורמציה',
        latex: "s_{x'}^2=b^2 s_x^2",
        shortLabel: "s_{x'}^2",
        desc: 'שונות מוכפלת ב-b²',
        slots: [
          { key: 'b', label: 'b', sym: 'b' },
          { key: 'var', label: 's²', sym: 's_x^2' },
        ],
        eval: v => v.b * v.b * v.var,
        topics: ['linear-transformations'],
        courseId: 'stat-a',
      },
      {
        id: 'tr_sd',
        label: 'סטיית תקן אחרי טרנספורמציה',
        latex: "s_{x'}=|b|\\cdot s_x",
        shortLabel: "s_{x'}",
        desc: 'SD מוכפלת ב-|b|',
        slots: [
          { key: 'b', label: 'b', sym: 'b' },
          { key: 'sd', label: 's', sym: 's_x' },
        ],
        eval: v => Math.abs(v.b) * v.sd,
        topics: ['linear-transformations'],
        courseId: 'stat-a',
      },
      {
        id: 'zscore',
        label: 'ציון z',
        latex: 'Z=\\frac{x-\\bar{x}}{s}',
        shortLabel: 'Z',
        desc: 'ציון תקני',
        slots: [
          { key: 'x', label: 'x', sym: 'x' },
          { key: 'mean', label: 'x̄', sym: '\\bar{x}' },
          { key: 's', label: 's', sym: 's' },
        ],
        eval: v => (v.x - v.mean) / v.s,
        topics: ['std-dev', 'linear-transformations', 'percentiles'],
        courseId: 'stat-a',
      },
    ],
  },
  {
    id: 'normal',
    group: 'inferential',
    label: 'התפלגות נורמלית',
    formulas: [
      {
        id: 'norm_cdf',
        label: 'CDF — Φ(z)',
        latex: 'P(Z\\leq z)=\\Phi(z)',
        shortLabel: '\\Phi(z)',
        desc: 'פונקציית התפלגות מצטברת',
        slots: [{ key: 'z', label: 'z', sym: 'z' }],
        eval: v => normCdf(v.z),
        topics: ['percentiles'],
        courseId: 'stat-a',
      },
      {
        id: 'norm_right',
        label: 'זנב ימני',
        latex: 'P(Z>z)=1-\\Phi(z)',
        shortLabel: 'P(Z>z)',
        desc: 'הסתברות זנב ימני',
        slots: [{ key: 'z', label: 'z', sym: 'z' }],
        eval: v => 1 - normCdf(v.z),
        topics: ['percentiles'],
        courseId: 'stat-a',
      },
      {
        id: 'norm_interval',
        label: 'הסתברות בתוך תחום',
        latex: 'P(z_1<Z\\leq z_2)=\\Phi(z_2)-\\Phi(z_1)',
        shortLabel: 'P(z_1<Z\\leq z_2)',
        desc: 'בין שני ערכי z',
        slots: [
          { key: 'z1', label: 'z₁', sym: 'z_1' },
          { key: 'z2', label: 'z₂', sym: 'z_2' },
        ],
        eval: v => normCdf(v.z2) - normCdf(v.z1),
        topics: ['percentiles'],
        courseId: 'stat-a',
      },
      {
        id: 'norm_pdf',
        label: 'PDF — צפיפות',
        latex: 'f(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}',
        desc: 'פונקציית צפיפות נורמלית',
        slots: [
          { key: 'x', label: 'x', sym: 'x' },
          { key: 'mu', label: 'μ', sym: '\\mu' },
          { key: 'sigma', label: 'σ', sym: '\\sigma' },
        ],
        eval: v => Math.exp(-0.5 * Math.pow((v.x - v.mu) / v.sigma, 2)) / (v.sigma * Math.sqrt(2 * Math.PI)),
        topics: ['percentiles'],
        courseId: 'stat-a',
      },
    ],
  },
  {
    id: 'correlation',
    group: 'descriptive',
    label: 'קורלציה',
    formulas: [
      {
        id: 'pearson',
        label: 'מקדם Pearson',
        latex: 'r=\\frac{\\mathrm{cov}(x,y)}{s_x\\cdot s_y}',
        desc: 'קורלציה לינארית [-1,1]',
        slots: [
          { key: 'cov', label: 'cov(x,y)', sym: '\\mathrm{cov}(x,y)' },
          { key: 'sx', label: 'sₓ', sym: 's_x' },
          { key: 'sy', label: 's_y', sym: 's_y' },
        ],
        eval: v => v.cov / (v.sx * v.sy),
        topics: ['pearson', 'correlation'],
        courseId: 'stat-a',
      },
      {
        id: 'cov',
        label: 'שונות משותפת',
        latex: '\\mathrm{cov}(x,y)=\\frac{\\sum x_i y_i}{n}-\\bar{x}\\bar{y}',
        desc: 'שונות בין X ל-Y',
        slots: [
          { key: 'sumxy', label: 'Σxᵢyᵢ', sym: '\\sum x_i y_i' },
          { key: 'n', label: 'n', sym: 'n' },
          { key: 'xbar', label: 'x̄', sym: '\\bar{x}' },
          { key: 'ybar', label: 'ȳ', sym: '\\bar{y}' },
        ],
        eval: v => v.sumxy / v.n - v.xbar * v.ybar,
        topics: ['pearson', 'correlation'],
        courseId: 'stat-a',
      },
      {
        id: 'spearman',
        label: 'מקדם Spearman',
        latex: 'r_s=1-\\frac{6\\sum d_i^2}{n(n^2-1)}',
        desc: 'קורלציה לפי דירוג',
        slots: [
          { key: 'sumd2', label: 'Σdᵢ²', sym: '\\sum d_i^2' },
          { key: 'n', label: 'n', sym: 'n' },
        ],
        eval: v => 1 - (6 * v.sumd2) / (v.n * (v.n * v.n - 1)),
        topics: ['spearman'],
        courseId: 'stat-a',
      },
      {
        id: 'chi2',
        label: 'χ² (חי בריבוע)',
        latex: '\\chi^2=\\sum\\frac{(O_i-E_i)^2}{E_i}',
        desc: 'נצפה מול צפוי',
        slots: [{ key: 'chi2', label: 'Σ(O-E)²/E' }],
        eval: v => v.chi2,
        topics: ['cramer'],
        courseId: 'stat-a',
      },
      {
        id: 'phi',
        label: 'מקדם Phi',
        latex: '\\phi=\\sqrt{\\frac{\\chi^2}{n}}',
        desc: 'קישור בטבלה 2×2',
        slots: [
          { key: 'chi2', label: 'χ²' },
          { key: 'n', label: 'n' },
        ],
        eval: v => Math.sqrt(v.chi2 / v.n),
        topics: ['cramer'],
        courseId: 'stat-a',
      },
      {
        id: 'rc',
        label: 'מקדם תיאום rᴄ',
        latex: 'r_c=\\sqrt{\\frac{\\chi^2}{n(L-1)}}',
        desc: 'L=min(שורות, עמודות)',
        slots: [
          { key: 'chi2', label: 'χ²' },
          { key: 'n', label: 'n' },
          { key: 'L', label: 'L' },
        ],
        eval: v => Math.sqrt(v.chi2 / (v.n * (v.L - 1))),
        topics: ['cramer'],
        courseId: 'stat-a',
      },
    ],
  },
  {
    id: 'regression',
    group: 'descriptive',
    label: 'רגרסיה',
    formulas: [
      {
        id: 'reg_line',
        label: 'קו הרגרסיה',
        latex: '\\tilde{y}=bx+a',
        desc: 'חיזוי Y מתוך X',
        slots: [
          { key: 'b', label: 'b' },
          { key: 'x', label: 'x' },
          { key: 'a', label: 'a' },
        ],
        eval: v => v.b * v.x + v.a,
        topics: ['regression'],
        courseId: 'stat-a',
      },
      {
        id: 'slope',
        label: 'שיפוע b',
        latex: 'b=\\frac{r\\cdot s_y}{s_x}',
        desc: 'שיפוע רגרסיה Y על X',
        slots: [
          { key: 'r', label: 'r' },
          { key: 'sy', label: 's_y' },
          { key: 'sx', label: 'sₓ' },
        ],
        eval: v => (v.r * v.sy) / v.sx,
        topics: ['regression'],
        courseId: 'stat-a',
      },
      {
        id: 'intercept',
        label: 'חיתוך a',
        latex: 'a=\\bar{y}-b\\bar{x}',
        desc: 'חיתוך רגרסיה',
        slots: [
          { key: 'ybar', label: 'ȳ' },
          { key: 'b', label: 'b' },
          { key: 'xbar', label: 'x̄' },
        ],
        eval: v => v.ybar - v.b * v.xbar,
        topics: ['regression'],
        courseId: 'stat-a',
      },
      {
        id: 'r2',
        label: 'R² — קביעה',
        latex: 'r^2=\\frac{s_{\\tilde{y}}^2}{s_y^2}',
        desc: 'אחוז השונות המוסבר',
        slots: [
          { key: 'syhat2', label: 's²(ỹ)' },
          { key: 'sy2', label: 's²(y)' },
        ],
        eval: v => v.syhat2 / v.sy2,
        topics: ['regression'],
        courseId: 'stat-a',
      },
      {
        id: 'var_decomp',
        label: 'פירוק שונות',
        latex: 's_y^2=s_{\\tilde{y}}^2+s_{y-\\tilde{y}}^2',
        desc: 'סה"כ = מוסבר + שגיאה',
        slots: [
          { key: 'syhat2', label: 's²(ỹ)' },
          { key: 'serr2', label: 's²(y-ỹ)' },
        ],
        eval: v => v.syhat2 + v.serr2,
        topics: ['regression'],
        courseId: 'stat-a',
      },
    ],
  },
  {
    id: 'combinatorics',
    group: 'descriptive',
    label: 'קומבינטוריקה',
    formulas: [
      {
        id: 'perm',
        label: 'תמורות',
        latex: '(n)_k=\\frac{n!}{(n-k)!}',
        desc: 'מסודר, ללא חזרות',
        slots: [
          { key: 'n', label: 'n' },
          { key: 'k', label: 'k' },
        ],
        eval: v => factorial(v.n) / factorial(v.n - v.k),
        topics: ['combinatorics'],
        courseId: 'stat-a',
      },
      {
        id: 'comb',
        label: 'צירופים',
        latex: '\\binom{n}{k}=\\frac{n!}{(n-k)!\\,k!}',
        desc: 'בלי סדר, ללא חזרות',
        slots: [
          { key: 'n', label: 'n' },
          { key: 'k', label: 'k' },
        ],
        eval: v => nCk(v.n, v.k),
        topics: ['combinatorics', 'binomial'],
        courseId: 'stat-a',
      },
      {
        id: 'ordered_rep',
        label: 'מסודר עם חזרות',
        latex: 'n^k',
        desc: 'סדרות עם חזרה',
        slots: [
          { key: 'n', label: 'n' },
          { key: 'k', label: 'k' },
        ],
        eval: v => Math.pow(v.n, v.k),
        topics: ['combinatorics'],
        courseId: 'stat-a',
      },
      {
        id: 'factorial',
        label: 'עצרת',
        latex: 'n!=n\\cdot(n-1)\\cdots 1,\\;0!=1',
        desc: 'מכפלת השלמים עד n',
        slots: [{ key: 'n', label: 'n' }],
        eval: v => factorial(v.n),
        topics: ['combinatorics'],
        courseId: 'stat-a',
      },
    ],
  },
  {
    id: 'probability',
    group: 'inferential',
    label: 'כללי הסתברות',
    formulas: [
      {
        id: 'addition',
        label: 'כלל החיבור',
        latex: 'P(A\\cup B)=P(A)+P(B)-P(A\\cap B)',
        desc: 'הכלה-הוצאה',
        slots: [
          { key: 'pa', label: 'P(A)' },
          { key: 'pb', label: 'P(B)' },
          { key: 'pab', label: 'P(A∩B)' },
        ],
        eval: v => v.pa + v.pb - v.pab,
        topics: ['probability'],
        courseId: 'stat-a',
      },
      {
        id: 'complement',
        label: 'משלים',
        latex: 'P(A^c)=1-P(A)',
        desc: 'הסתברות "לא A"',
        slots: [{ key: 'pa', label: 'P(A)' }],
        eval: v => 1 - v.pa,
        topics: ['probability'],
        courseId: 'stat-a',
      },
      {
        id: 'conditional',
        label: 'הסתברות מותנית',
        latex: 'P(B|A)=\\frac{P(A\\cap B)}{P(A)}',
        desc: 'בהינתן A',
        slots: [
          { key: 'pab', label: 'P(A∩B)' },
          { key: 'pa', label: 'P(A)' },
        ],
        eval: v => v.pab / v.pa,
        topics: ['probability'],
        courseId: 'stat-a',
      },
      {
        id: 'multiplication',
        label: 'כלל הכפל',
        latex: 'P(A\\cap B)=P(A)\\cdot P(B|A)',
        desc: 'הסתברות משותפת',
        slots: [
          { key: 'pa', label: 'P(A)' },
          { key: 'pba', label: 'P(B|A)' },
        ],
        eval: v => v.pa * v.pba,
        topics: ['probability'],
        courseId: 'stat-a',
      },
      {
        id: 'independence',
        label: 'אי-תלות',
        latex: 'P(A\\cap B)=P(A)\\cdot P(B)',
        desc: 'A ו-B בלתי תלויים',
        slots: [
          { key: 'pa', label: 'P(A)' },
          { key: 'pb', label: 'P(B)' },
        ],
        eval: v => v.pa * v.pb,
        topics: ['probability'],
        courseId: 'stat-a',
      },
      {
        id: 'total_prob',
        label: 'הסתברות שלמה',
        latex: 'P(B)=\\sum_i P(B|A_i)P(A_i)',
        desc: 'חלוקה למרחב מדגם',
        slots: [{ key: 'sum', label: 'Σ P(B|Aᵢ)P(Aᵢ)' }],
        eval: v => v.sum,
        topics: ['probability'],
        courseId: 'stat-a',
      },
      {
        id: 'bayes',
        label: 'משפט בייס',
        latex: "P(A_i|B)=\\frac{P(B|A_i)P(A_i)}{\\sum_j P(B|A_j)P(A_j)}",
        desc: 'הסתברות פוסטריורית',
        slots: [
          { key: 'pbai', label: 'P(B|Aᵢ)' },
          { key: 'pai', label: 'P(Aᵢ)' },
          { key: 'denom', label: 'Σⱼ P(B|Aⱼ)P(Aⱼ)' },
        ],
        eval: v => (v.pbai * v.pai) / v.denom,
        topics: ['probability'],
        courseId: 'stat-a',
      },
    ],
  },
  {
    id: 'rv',
    group: 'inferential',
    label: 'משתנים אקראיים',
    formulas: [
      {
        id: 'ev',
        label: 'תוחלת E(X)',
        latex: 'E(X)=\\sum_i x_i P(x_i)=\\mu',
        desc: 'ממוצע משוקלל של תוצאות',
        slots: [{ key: 'sum', label: 'Σ xᵢ·P(xᵢ)' }],
        eval: v => v.sum,
        topics: ['discrete-rv'],
        courseId: 'stat-a',
      },
      {
        id: 'var_rv',
        label: 'שונות V(X)',
        latex: 'V(X)=\\sum_i x_i^2 P(x_i)-\\mu^2=\\sigma^2',
        desc: 'תוחלת ריבוע הסטייה',
        slots: [
          { key: 'sumx2p', label: 'Σ xᵢ²·P(xᵢ)' },
          { key: 'mu', label: 'μ' },
        ],
        eval: v => v.sumx2p - v.mu * v.mu,
        topics: ['discrete-rv'],
        courseId: 'stat-a',
      },
      {
        id: 'ev_linear',
        label: 'E(bX+a)',
        latex: 'E(bX+a)=bE(X)+a',
        desc: 'לינאריות התוחלת',
        slots: [
          { key: 'b', label: 'b' },
          { key: 'ex', label: 'E(X)' },
          { key: 'a', label: 'a' },
        ],
        eval: v => v.b * v.ex + v.a,
        topics: ['discrete-rv', 'linear-transformations'],
        courseId: 'stat-a',
      },
      {
        id: 'var_linear',
        label: 'V(bX+a)',
        latex: 'V(bX+a)=b^2 V(X)',
        desc: 'שונות אחרי טרנספ׳ לינארית',
        slots: [
          { key: 'b', label: 'b' },
          { key: 'vx', label: 'V(X)' },
        ],
        eval: v => v.b * v.b * v.vx,
        topics: ['discrete-rv', 'linear-transformations'],
        courseId: 'stat-a',
      },
      {
        id: 'ev_sum',
        label: 'E(X₁+…+Xₙ)',
        latex: 'E\\left(\\sum X_i\\right)=\\sum E(X_i)',
        desc: 'אדיטיביות התוחלת',
        slots: [{ key: 'sum', label: 'Σ E(Xᵢ)' }],
        eval: v => v.sum,
        topics: ['discrete-rv'],
        courseId: 'stat-a',
      },
      {
        id: 'var_sum_ind',
        label: 'V(X₁+…+Xₙ) באי-תלות',
        latex: 'V\\left(\\sum X_i\\right)=\\sum V(X_i)',
        desc: 'עבור משתנים בלתי תלויים',
        slots: [{ key: 'sum', label: 'Σ V(Xᵢ)' }],
        eval: v => v.sum,
        topics: ['discrete-rv'],
        courseId: 'stat-a',
      },
    ],
  },
  {
    id: 'binomial',
    group: 'inferential',
    label: 'התפלגות בינומית',
    formulas: [
      {
        id: 'binom_pmf',
        label: 'B(n,p) — PMF',
        latex: 'P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}',
        desc: 'k הצלחות מתוך n ניסויים',
        slots: [
          { key: 'n', label: 'n' },
          { key: 'k', label: 'k' },
          { key: 'p', label: 'p' },
        ],
        eval: v => nCk(v.n, v.k) * Math.pow(v.p, v.k) * Math.pow(1 - v.p, v.n - v.k),
        topics: ['binomial'],
        courseId: 'stat-a',
      },
      {
        id: 'binom_mean',
        label: 'תוחלת בינומית E(X)',
        latex: 'E(X)=np',
        desc: 'מספר הצלחות צפוי',
        slots: [
          { key: 'n', label: 'n' },
          { key: 'p', label: 'p' },
        ],
        eval: v => v.n * v.p,
        topics: ['binomial'],
        courseId: 'stat-a',
      },
      {
        id: 'binom_var',
        label: 'שונות בינומית V(X)',
        latex: 'V(X)=np(1-p)=npq',
        desc: 'שונות בינומית',
        slots: [
          { key: 'n', label: 'n' },
          { key: 'p', label: 'p' },
        ],
        eval: v => v.n * v.p * (1 - v.p),
        topics: ['binomial'],
        courseId: 'stat-a',
      },
    ],
  },
  // ── Statistics B — sampling & limit theorems ──────────────────────────────
  {
    id: 'b-sampling',
    group: 'inferential',
    label: 'סטטיסטיקה ב׳ — דגימה ומשפטי גבול',
    formulas: [
      {
        id: 'b_se_mean',
        label: 'שגיאת התקן של הממוצע',
        latex: '\\sigma_{\\bar{X}}=\\dfrac{\\sigma}{\\sqrt{n}}',
        shortLabel: '\\sigma_{\\bar{X}}',
        desc: 'סטיית התקן של ממוצע המדגם',
        slots: [ { key: 'sigma', label: 'σ' }, { key: 'n', label: 'n' } ],
        eval: v => v.sigma / Math.sqrt(v.n),
        topics: ['b-sampling-dist', 'b-clt'],
        courseId: 'stat-b',
      },
      {
        id: 'b_z_mean',
        label: 'תקנון ממוצע המדגם',
        latex: 'Z=\\dfrac{\\bar{X}-\\mu}{\\sigma/\\sqrt{n}}',
        shortLabel: 'Z',
        desc: 'תקנון הממוצע לפי CLT',
        slots: [ { key: 'xbar', label: 'x̄' }, { key: 'mu', label: 'μ' }, { key: 'sigma', label: 'σ' }, { key: 'n', label: 'n' } ],
        eval: v => (v.xbar - v.mu) / (v.sigma / Math.sqrt(v.n)),
        topics: ['b-clt', 'b-sampling-dist'],
        courseId: 'stat-b',
      },
      {
        id: 'b_chebyshev',
        label: 'חסם צ׳בישב',
        latex: 'P(|X-\\mu|\\ge k\\sigma)\\le \\dfrac{1}{k^2}',
        desc: 'חסם עליון לזנבות — כל התפלגות',
        slots: [ { key: 'k', label: 'k' } ],
        eval: v => 1 / (v.k * v.k),
        topics: ['b-chebyshev-lln'],
        courseId: 'stat-b',
      },
      {
        id: 'b_se_prop',
        label: 'שגיאת התקן של פרופורציה',
        latex: '\\sigma_{\\hat{p}}=\\sqrt{\\dfrac{p(1-p)}{n}}',
        shortLabel: '\\sigma_{\\hat{p}}',
        slots: [ { key: 'p', label: 'p' }, { key: 'n', label: 'n' } ],
        eval: v => Math.sqrt(v.p * (1 - v.p) / v.n),
        topics: ['b-proportion', 'b-clt'],
        courseId: 'stat-b',
      },
    ],
  },
  // ── Statistics B — estimation, CI & hypothesis tests ──────────────────────
  {
    id: 'b-inference',
    group: 'inferential',
    label: 'סטטיסטיקה ב׳ — אמידה, רווחי סמך ובדיקת השערות',
    formulas: [
      {
        id: 'b_ci_z',
        label: 'רווח סמך לתוחלת (σ ידועה)',
        latex: '\\bar{X}\\pm z_{\\alpha/2}\\dfrac{\\sigma}{\\sqrt{n}}',
        desc: 'רווח סמך כאשר סטיית התקן ידועה',
        slots: [ { key: 'xbar', label: 'x̄' }, { key: 'z', label: 'z' }, { key: 'sigma', label: 'σ' }, { key: 'n', label: 'n' } ],
        topics: ['b-confidence-intervals'],
        courseId: 'stat-b',
      },
      {
        id: 'b_ci_t',
        label: 'רווח סמך לתוחלת (σ לא ידועה)',
        latex: '\\bar{X}\\pm t_{\\alpha/2,\\,n-1}\\dfrac{S}{\\sqrt{n}}',
        desc: 'רווח סמך עם אומד סטיית התקן',
        slots: [ { key: 'xbar', label: 'x̄' }, { key: 't', label: 't' }, { key: 'S', label: 'S' }, { key: 'n', label: 'n' } ],
        topics: ['b-confidence-intervals'],
        courseId: 'stat-b',
      },
      {
        id: 'b_z_stat',
        label: 'סטטיסטי מבחן Z',
        latex: 'Z=\\dfrac{\\bar{X}-\\mu_0}{\\sigma/\\sqrt{n}}',
        shortLabel: 'Z',
        slots: [ { key: 'xbar', label: 'x̄' }, { key: 'mu0', label: 'μ₀' }, { key: 'sigma', label: 'σ' }, { key: 'n', label: 'n' } ],
        eval: v => (v.xbar - v.mu0) / (v.sigma / Math.sqrt(v.n)),
        topics: ['b-hypothesis-testing'],
        courseId: 'stat-b',
      },
      {
        id: 'b_t_stat',
        label: 'סטטיסטי מבחן t',
        latex: 't=\\dfrac{\\bar{X}-\\mu_0}{S/\\sqrt{n}}',
        shortLabel: 't',
        slots: [ { key: 'xbar', label: 'x̄' }, { key: 'mu0', label: 'μ₀' }, { key: 'S', label: 'S' }, { key: 'n', label: 'n' } ],
        eval: v => (v.xbar - v.mu0) / (v.S / Math.sqrt(v.n)),
        topics: ['b-hypothesis-testing'],
        courseId: 'stat-b',
      },
      {
        id: 'b_paired_t',
        label: 'מבחן t לדגימות מזווגות',
        latex: 't=\\dfrac{\\bar{d}}{S_d/\\sqrt{n}}',
        shortLabel: 't',
        slots: [ { key: 'dbar', label: 'd̄' }, { key: 'Sd', label: 'S_d' }, { key: 'n', label: 'n' } ],
        eval: v => v.dbar / (v.Sd / Math.sqrt(v.n)),
        topics: ['b-paired-samples'],
        courseId: 'stat-b',
      },
      {
        id: 'b_prop_z',
        label: 'מבחן Z לפרופורציה',
        latex: 'Z=\\dfrac{\\hat{p}-p_0}{\\sqrt{p_0(1-p_0)/n}}',
        shortLabel: 'Z',
        slots: [ { key: 'phat', label: 'p̂' }, { key: 'p0', label: 'p₀' }, { key: 'n', label: 'n' } ],
        eval: v => (v.phat - v.p0) / Math.sqrt(v.p0 * (1 - v.p0) / v.n),
        topics: ['b-proportion'],
        courseId: 'stat-b',
      },
      {
        id: 'b_two_means_z',
        label: 'הפרש תוחלות (σ ידועות)',
        latex: 'Z=\\dfrac{(\\bar{X}_1-\\bar{X}_2)}{\\sqrt{\\sigma_1^2/n_1+\\sigma_2^2/n_2}}',
        shortLabel: 'Z',
        desc: 'תחת H₀: μ₁ = μ₂',
        slots: [ { key: 'x1', label: 'x̄₁' }, { key: 'x2', label: 'x̄₂' }, { key: 's1', label: 'σ₁' }, { key: 's2', label: 'σ₂' }, { key: 'n1', label: 'n₁' }, { key: 'n2', label: 'n₂' } ],
        eval: v => (v.x1 - v.x2) / Math.sqrt(v.s1 * v.s1 / v.n1 + v.s2 * v.s2 / v.n2),
        topics: ['b-diff-means'],
        courseId: 'stat-b',
      },
    ],
  },
  // ── Statistics B — non-parametric tests & regression ──────────────────────
  {
    id: 'b-nonparam-reg',
    group: 'inferential',
    label: 'סטטיסטיקה ב׳ — א-פרמטריים ורגרסיה',
    formulas: [
      {
        id: 'b_chi2',
        label: 'סטטיסטי כי בריבוע',
        latex: '\\chi^2=\\sum\\dfrac{(O-E)^2}{E}',
        shortLabel: '\\chi^2',
        desc: 'נצפה מול צפוי',
        slots: [ { key: 'O', label: 'O' }, { key: 'E', label: 'E' } ],
        eval: v => Math.pow(v.O - v.E, 2) / v.E,
        topics: ['b-binomial-chisquare', 'b-independence-mcnemar', 'b-variance-test'],
        courseId: 'stat-b',
      },
      {
        id: 'b_mcnemar',
        label: 'מבחן מקנמר',
        latex: '\\chi^2=\\dfrac{(b-c)^2}{b+c}',
        shortLabel: '\\chi^2',
        desc: 'תאים בלתי-מתאימים בטבלה מזווגת',
        slots: [ { key: 'b', label: 'b' }, { key: 'c', label: 'c' } ],
        eval: v => Math.pow(v.b - v.c, 2) / (v.b + v.c),
        topics: ['b-independence-mcnemar'],
        courseId: 'stat-b',
      },
      {
        id: 'b_reg_slope',
        label: 'שיפוע הרגרסיה',
        latex: '\\hat{\\beta}_1=\\dfrac{\\sum(x_i-\\bar{x})(y_i-\\bar{y})}{\\sum(x_i-\\bar{x})^2}',
        shortLabel: '\\hat{\\beta}_1',
        desc: 'שיטת הריבועים הפחותים',
        slots: [ { key: 'Sxy', label: 'Σ(x-x̄)(y-ȳ)' }, { key: 'Sxx', label: 'Σ(x-x̄)²' } ],
        eval: v => v.Sxy / v.Sxx,
        topics: ['b-simple-regression'],
        courseId: 'stat-b',
      },
      {
        id: 'b_reg_intercept',
        label: 'חותך הרגרסיה',
        latex: '\\hat{\\beta}_0=\\bar{y}-\\hat{\\beta}_1\\bar{x}',
        shortLabel: '\\hat{\\beta}_0',
        slots: [ { key: 'ybar', label: 'ȳ' }, { key: 'b1', label: 'β̂₁' }, { key: 'xbar', label: 'x̄' } ],
        eval: v => v.ybar - v.b1 * v.xbar,
        topics: ['b-simple-regression'],
        courseId: 'stat-b',
      },
      {
        id: 'b_r_squared',
        label: 'מקדם ההסבר',
        latex: 'R^2=\\dfrac{SSR}{SST}=1-\\dfrac{SSE}{SST}',
        shortLabel: 'R^2',
        desc: 'שיעור השונות המוסברת',
        slots: [ { key: 'SSR', label: 'SSR' }, { key: 'SST', label: 'SST' } ],
        eval: v => v.SSR / v.SST,
        topics: ['b-simple-regression', 'b-multiple-regression'],
        courseId: 'stat-b',
      },
      {
        id: 'b_slope_t',
        label: 'מבחן t לשיפוע',
        latex: 't=\\dfrac{\\hat{\\beta}_1}{SE(\\hat{\\beta}_1)}',
        shortLabel: 't',
        desc: 'H₀: השיפוע באוכלוסייה הוא אפס',
        slots: [ { key: 'b1', label: 'β̂₁' }, { key: 'seb1', label: 'SE' } ],
        eval: v => v.b1 / v.seb1,
        topics: ['b-simple-regression'],
        courseId: 'stat-b',
      },
    ],
  },
]

/** Return the chip's caption — either the explicit `shortLabel` field or
 *  the LHS auto-extracted from the `latex`. Used by the keyboard's
 *  chipForFormula() so chips read like a glossary, not a textbook.
 *  Examples:
 *    \\bar{x}=\\frac{\\sum x_i}{n}  → \\bar{x}
 *    s^2=\\sum(x_i-\\bar{x})^2/n   → s^2
 *    b=\\frac{r s_y}{s_x}          → b
 *    P(A \\cup B) = ...            → P(A \\cup B)
 *  If the LaTeX has no `=`, falls back to the full LaTeX. */
export function shortLabelOf(f: Formula): string {
  if (f.shortLabel) return f.shortLabel
  const eqIdx = f.latex.indexOf('=')
  if (eqIdx === -1) return f.latex
  return f.latex.slice(0, eqIdx).trim()
}

// Flatten helper for keyboard rows / search.
export function allFormulas(): Formula[] {
  const out: Formula[] = []
  for (const cat of FORMULA_LIBRARY) for (const f of cat.formulas) out.push(f)
  return out
}

export function findFormula(id: string): Formula | undefined {
  return allFormulas().find(f => f.id === id)
}

/** Normalize a LaTeX string for tolerant equality matching: drop spacing
 *  macros (`\,` `\!` `\;` `\:` `\quad`…), `\left`/`\right` delimiters, and all
 *  whitespace. Keeps braces/operators so `\frac{a}{b}` stays distinct.
 *  Shared with public/mindmap.html — keep the two implementations in sync. */
export function normalizeLatex(latex: string): string {
  return String(latex || '')
    .replace(/\\left|\\right/g, '')
    .replace(/\\,|\\!|\\;|\\:|\\quad|\\qquad/g, '')
    .replace(/\s+/g, '')
    .trim()
}

/** Match a (possibly free-hand) LaTeX string against the library by its
 *  canonical `latex` field, using normalizeLatex() for tolerance. Returns the
 *  matching Formula or undefined when there's no library entry (free-hand
 *  equation → caller falls back to the raw LaTeX editor). */
export function findFormulaByLatex(latex: string): Formula | undefined {
  const target = normalizeLatex(latex)
  if (!target) return undefined
  return allFormulas().find(f => normalizeLatex(f.latex) === target)
}

// keep `sum` exported in case anyone imports it — not used internally now.
export { sum }
