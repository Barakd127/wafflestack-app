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
}

export interface Formula {
  id: string
  label: string
  latex: string
  desc?: string
  slots: Slot[]
  eval?: (vals: Record<string, number>) => number
  topics: string[]
  courseId: 'stat-a' | 'stat-b'
}

export interface FormulaCategory {
  id: string
  label: string
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
    label: 'תיאורית — מדדי מרכז',
    formulas: [
      {
        id: 'mean_raw',
        label: 'ממוצע (גולמי)',
        latex: '\\bar{x}=\\frac{\\sum x_i}{n}',
        desc: 'ממוצע אריתמטי',
        slots: [
          { key: 'sum', label: 'Σx', placeholder: '60+70+80' },
          { key: 'n', label: 'n', placeholder: '3' },
        ],
        eval: v => v.sum / v.n,
        topics: ['mean', 'weighted-combined'],
        courseId: 'stat-a',
      },
      {
        id: 'mean_freq',
        label: 'ממוצע (טבלת שכיחויות)',
        latex: '\\bar{x}=\\frac{\\sum x_i f(x_i)}{n}',
        desc: 'ממוצע משוקלל',
        slots: [
          { key: 'sumxf', label: 'Σx·f(x)' },
          { key: 'n', label: 'n' },
        ],
        eval: v => v.sumxf / v.n,
        topics: ['mean', 'weighted-combined'],
        courseId: 'stat-a',
      },
      {
        id: 'grand_mean',
        label: 'ממוצע כללי',
        latex: '\\bar{\\bar{x}}=\\frac{\\sum_j \\bar{x}_j n_j}{N}',
        desc: 'ממוצע משולב בין קבוצות',
        slots: [
          { key: 'sumxn', label: 'Σ x̄ⱼ·nⱼ' },
          { key: 'N', label: 'N' },
        ],
        eval: v => v.sumxn / v.N,
        topics: ['weighted-combined'],
        courseId: 'stat-a',
      },
      {
        id: 'midrange',
        label: 'אמצע טווח',
        latex: 'MR=\\frac{x_{max}+x_{min}}{2}',
        desc: 'ממוצע הקצוות',
        slots: [
          { key: 'max', label: 'xₘₐₓ' },
          { key: 'min', label: 'xₘᵢₙ' },
        ],
        eval: v => (v.max + v.min) / 2,
        topics: ['mean', 'std-dev'],
        courseId: 'stat-a',
      },
    ],
  },
  {
    id: 'dispersion',
    label: 'תיאורית — מדדי פיזור',
    formulas: [
      {
        id: 'var_raw',
        label: 'שונות (גולמי)',
        latex: 's^2=\\frac{\\sum(x_i-\\bar{x})^2}{n}=\\frac{\\sum x_i^2}{n}-\\bar{x}^2',
        desc: 'שונות אוכלוסיה',
        slots: [
          { key: 'sumx2', label: 'Σx²' },
          { key: 'n', label: 'n' },
          { key: 'mean', label: 'x̄' },
        ],
        eval: v => v.sumx2 / v.n - v.mean * v.mean,
        topics: ['std-dev', 'observation-changes'],
        courseId: 'stat-a',
      },
      {
        id: 'var_freq',
        label: 'שונות (שכיחויות)',
        latex: 's^2=\\frac{\\sum x_i^2 f(x_i)}{n}-\\bar{x}^2',
        desc: 'שונות מטבלת שכיחויות',
        slots: [
          { key: 'sumx2f', label: 'Σx²·f(x)' },
          { key: 'n', label: 'n' },
          { key: 'mean', label: 'x̄' },
        ],
        eval: v => v.sumx2f / v.n - v.mean * v.mean,
        topics: ['std-dev'],
        courseId: 'stat-a',
      },
      {
        id: 'std',
        label: 'סטיית תקן',
        latex: 's=\\sqrt{s^2}',
        desc: 'סטיית תקן',
        slots: [{ key: 'var', label: 's²' }],
        eval: v => Math.sqrt(v.var),
        topics: ['std-dev', 'observation-changes'],
        courseId: 'stat-a',
      },
      {
        id: 'pooled_var',
        label: 'שונות משולבת',
        latex: 's_c^2=\\frac{\\sum n_j s_j^2}{N}+\\frac{\\sum n_j(\\bar{x}_j-\\bar{\\bar{x}})^2}{N}',
        desc: 'שונות בתוך + בין קבוצות',
        slots: [
          { key: 'within', label: 'Σnⱼ·sⱼ²' },
          { key: 'between', label: 'Σnⱼ(x̄ⱼ-x̄̄)²' },
          { key: 'N', label: 'N' },
        ],
        eval: v => (v.within + v.between) / v.N,
        topics: ['weighted-combined'],
        courseId: 'stat-a',
      },
    ],
  },
  {
    id: 'transform',
    label: 'טרנספורמציות לינאריות',
    formulas: [
      {
        id: 'tr_mean',
        label: 'ממוצע אחרי טרנספורמציה',
        latex: "\\bar{x}'=b\\bar{x}+a",
        desc: "אם x'=bx+a",
        slots: [
          { key: 'b', label: 'b' },
          { key: 'mean', label: 'x̄' },
          { key: 'a', label: 'a' },
        ],
        eval: v => v.b * v.mean + v.a,
        topics: ['linear-transformations'],
        courseId: 'stat-a',
      },
      {
        id: 'tr_var',
        label: 'שונות אחרי טרנספורמציה',
        latex: "s_{x'}^2=b^2 s_x^2",
        desc: 'שונות מוכפלת ב-b²',
        slots: [
          { key: 'b', label: 'b' },
          { key: 'var', label: 's²' },
        ],
        eval: v => v.b * v.b * v.var,
        topics: ['linear-transformations'],
        courseId: 'stat-a',
      },
      {
        id: 'tr_sd',
        label: 'סטיית תקן אחרי טרנספורמציה',
        latex: "s_{x'}=|b|\\cdot s_x",
        desc: 'SD מוכפלת ב-|b|',
        slots: [
          { key: 'b', label: 'b' },
          { key: 'sd', label: 's' },
        ],
        eval: v => Math.abs(v.b) * v.sd,
        topics: ['linear-transformations'],
        courseId: 'stat-a',
      },
      {
        id: 'zscore',
        label: 'ציון z',
        latex: 'Z=\\frac{x-\\bar{x}}{s}',
        desc: 'ציון תקני',
        slots: [
          { key: 'x', label: 'x' },
          { key: 'mean', label: 'x̄' },
          { key: 's', label: 's' },
        ],
        eval: v => (v.x - v.mean) / v.s,
        topics: ['std-dev', 'linear-transformations', 'percentiles'],
        courseId: 'stat-a',
      },
    ],
  },
  {
    id: 'normal',
    label: 'התפלגות נורמלית',
    formulas: [
      {
        id: 'norm_cdf',
        label: 'CDF — Φ(z)',
        latex: 'P(Z\\leq z)=\\Phi(z)',
        desc: 'פונקציית התפלגות מצטברת',
        slots: [{ key: 'z', label: 'z' }],
        eval: v => normCdf(v.z),
        topics: ['percentiles'],
        courseId: 'stat-a',
      },
      {
        id: 'norm_right',
        label: 'זנב ימני',
        latex: 'P(Z>z)=1-\\Phi(z)',
        desc: 'הסתברות זנב ימני',
        slots: [{ key: 'z', label: 'z' }],
        eval: v => 1 - normCdf(v.z),
        topics: ['percentiles'],
        courseId: 'stat-a',
      },
      {
        id: 'norm_interval',
        label: 'הסתברות בתוך תחום',
        latex: 'P(z_1<Z\\leq z_2)=\\Phi(z_2)-\\Phi(z_1)',
        desc: 'בין שני ערכי z',
        slots: [
          { key: 'z1', label: 'z₁' },
          { key: 'z2', label: 'z₂' },
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
          { key: 'x', label: 'x' },
          { key: 'mu', label: 'μ' },
          { key: 'sigma', label: 'σ' },
        ],
        eval: v => Math.exp(-0.5 * Math.pow((v.x - v.mu) / v.sigma, 2)) / (v.sigma * Math.sqrt(2 * Math.PI)),
        topics: ['percentiles'],
        courseId: 'stat-a',
      },
    ],
  },
  {
    id: 'correlation',
    label: 'קורלציה',
    formulas: [
      {
        id: 'pearson',
        label: 'מקדם Pearson',
        latex: 'r=\\frac{\\mathrm{cov}(x,y)}{s_x\\cdot s_y}',
        desc: 'קורלציה לינארית [-1,1]',
        slots: [
          { key: 'cov', label: 'cov(x,y)' },
          { key: 'sx', label: 'sₓ' },
          { key: 'sy', label: 's_y' },
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
          { key: 'sumxy', label: 'Σxᵢyᵢ' },
          { key: 'n', label: 'n' },
          { key: 'xbar', label: 'x̄' },
          { key: 'ybar', label: 'ȳ' },
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
          { key: 'sumd2', label: 'Σdᵢ²' },
          { key: 'n', label: 'n' },
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
]

// Flatten helper for keyboard rows / search.
export function allFormulas(): Formula[] {
  const out: Formula[] = []
  for (const cat of FORMULA_LIBRARY) for (const f of cat.formulas) out.push(f)
  return out
}

export function findFormula(id: string): Formula | undefined {
  return allFormulas().find(f => f.id === id)
}

// keep `sum` exported in case anyone imports it — not used internally now.
export { sum }
