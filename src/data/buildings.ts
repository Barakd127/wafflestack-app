/**
 * src/data/buildings.ts — central registry for the 10 educational buildings.
 *
 * This is the single source of truth for building positions, colors, statistics
 * concept names, model paths, and Hebrew labels.
 *
 * Tripo-generated models live in `public/models/tripo/{id}.glb`. If a building
 * has no Tripo model yet, `tripoModel` will be undefined and the existing
 * Kenney/custom GLB fallback is used (see WaffleStackCity → BuildingDef).
 *
 * To swap in Tripo assets:
 *   1. Run `npm run tripo:generate` (requires TRIPO_API_KEY)
 *   2. Move/rename the generated GLB into `public/models/tripo/{id}.glb`
 *   3. Set `tripoModel: 'models/tripo/{id}.glb'` below
 */

export type BuildingId =
  | 'power' | 'housing' | 'traffic' | 'hospital' | 'school'
  | 'bank'  | 'market'  | 'city-hall' | 'research' | 'news'

export interface BuildingMeta {
  id:           BuildingId
  hebrewName:   string                 // e.g. "תחנת כוח"
  emoji:        string                 // e.g. "⚡"
  conceptHe:    string                 // e.g. "ממוצע"
  conceptEn:    string                 // e.g. "Mean"
  formula:      string                 // LaTeX-ish display
  position:     [number, number, number]
  color:        string                 // hero accent
  /** Path relative to public/, used by Tripo workflow. Optional — falls back to existing model in WaffleStackCity */
  tripoModel?:  string
}

export const BUILDINGS_REGISTRY: BuildingMeta[] = [
  {
    id: 'power',     hebrewName: 'תחנת כוח',   emoji: '⚡',
    conceptHe: 'ממוצע', conceptEn: 'Mean',
    formula: 'μ = Σxᵢ / n',
    position: [-9, 0, -9], color: '#FFD700',
  },
  {
    id: 'housing',   hebrewName: 'מנהל דיור',  emoji: '🏠',
    conceptHe: 'חציון', conceptEn: 'Median',
    formula: 'Sort data → middle value',
    position: [-3, 0, -9], color: '#4ECDC4',
  },
  {
    id: 'traffic',   hebrewName: 'בקרת תנועה', emoji: '🚦',
    conceptHe: 'סטיית תקן', conceptEn: 'Standard Deviation',
    formula: 'σ = √[Σ(xᵢ-μ)²/n]',
    position: [3, 0, -9], color: '#FF6B6B',
  },
  {
    id: 'hospital',  hebrewName: 'בית חולים',  emoji: '🏥',
    conceptHe: 'התפלגות נורמלית', conceptEn: 'Normal Distribution',
    formula: 'f(x) = (1/σ√2π)·e^(-(x-μ)²/2σ²)',
    position: [9, 0, -9], color: '#95E1D3',
  },
  {
    id: 'school',    hebrewName: 'בית ספר',    emoji: '🏫',
    conceptHe: 'מדגם', conceptEn: 'Sampling',
    formula: 'SE = σ / √n',
    position: [-9, 0, -3], color: '#AA96DA',
  },
  {
    id: 'bank',      hebrewName: 'בנק',        emoji: '🏦',
    conceptHe: 'רגרסיה', conceptEn: 'Regression',
    formula: 'y = β₀ + β₁x + ε',
    position: [-3, 0, -3], color: '#FCBAD3',
  },
  {
    id: 'market',    hebrewName: 'שוק',        emoji: '🏪',
    conceptHe: 'קורלציה', conceptEn: 'Correlation',
    formula: 'r = Σ[(xᵢ-x̄)(yᵢ-ȳ)] / (n·σₓ·σᵧ)',
    position: [3, 0, -3], color: '#A8E6CF',
  },
  {
    id: 'city-hall', hebrewName: 'עיריה',      emoji: '🏛️',
    conceptHe: 'בינום', conceptEn: 'Binomial Distribution',
    formula: 'P(X=k) = C(n,k)·pᵏ·(1-p)^(n-k)',
    position: [9, 0, -3], color: '#F38181',
  },
  {
    id: 'research',  hebrewName: 'מכון מחקר',  emoji: '🔬',
    conceptHe: 'מבחן השערות', conceptEn: 'Hypothesis Testing',
    formula: 'z = (x̄-μ₀) / (σ/√n)',
    position: [-3, 0, 3], color: '#C3A6FF',
  },
  {
    id: 'news',      hebrewName: 'תחנת חדשות', emoji: '📰',
    conceptHe: 'רווח סמך', conceptEn: 'Confidence Interval',
    formula: 'CI = x̄ ± z·(σ/√n)',
    position: [3, 0, 3], color: '#FFB347',
  },
]

/** Lookup helper */
export function getBuilding(id: BuildingId): BuildingMeta | undefined {
  return BUILDINGS_REGISTRY.find(b => b.id === id)
}
