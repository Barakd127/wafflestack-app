/**
 * ModelPicker — floating panel to swap any building's 3D model.
 * Shows 94+ Kenney GLBs organized by pack, with instant preview on selection.
 */
import { useState } from 'react'

export interface KenneyModel {
  file: string            // filename within pack folder
  label: string           // pretty display label
  targetHeight: number    // suggested auto-scale height (scene units)
  path: string            // full path from public/ root (no leading slash)
  emoji: string           // icon shown in grid
}

type PackId = 'commercial' | 'industrial' | 'suburban' | 'modular'

interface Pack {
  id: PackId
  label: string
  icon: string
  accent: string
  models: KenneyModel[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function letters(prefix: string, count: number, basePath: string, height: number, emoji: string): KenneyModel[] {
  return Array.from({ length: count }, (_, i) => {
    const letter = String.fromCharCode(65 + i).toLowerCase()
    const file = `${prefix}${letter}.glb`
    return { file, label: `${prefix.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}${String.fromCharCode(65 + i)}`, targetHeight: height, path: `${basePath}/${file}`, emoji }
  })
}

function types(count: number, basePath: string, height: number, emoji: string): KenneyModel[] {
  return Array.from({ length: count }, (_, i) => {
    const letter = String.fromCharCode(65 + i).toLowerCase()
    const file = `building-type-${letter}.glb`
    return { file, label: `Type ${String.fromCharCode(65 + i)}`, targetHeight: height, path: `${basePath}/${file}`, emoji }
  })
}

// ── Catalog ───────────────────────────────────────────────────────────────────

const PACKS: Pack[] = [
  {
    id: 'commercial',
    label: 'Commercial',
    icon: '🏢',
    accent: '#3B82F6',
    models: [
      // 14 main buildings
      ...letters('building-', 14, 'kenney/commercial', 3.0, '🏢'),
      // 5 skyscrapers
      ...(['a','b','c','d','e'].map((l, i) => ({
        file: `building-skyscraper-${l}.glb`,
        label: `Skyscraper ${l.toUpperCase()}`,
        targetHeight: 5.5 + i * 0.3,
        path: `kenney/commercial/building-skyscraper-${l}.glb`,
        emoji: '🏙️',
      }))),
      // 14 low-detail
      ...letters('low-detail-building-', 14, 'kenney/commercial', 2.2, '🏬'),
      // 2 low-detail wide
      ...(['a','b'].map(l => ({
        file: `low-detail-building-wide-${l}.glb`,
        label: `Low-Detail Wide ${l.toUpperCase()}`,
        targetHeight: 2.2,
        path: `kenney/commercial/low-detail-building-wide-${l}.glb`,
        emoji: '🏬',
      }))),
    ],
  },
  {
    id: 'industrial',
    label: 'Industrial',
    icon: '🏭',
    accent: '#F59E0B',
    models: [
      // 20 industrial buildings (a-t)
      ...letters('building-', 20, 'kenney/industrial', 3.5, '🏭'),
    ],
  },
  {
    id: 'suburban',
    label: 'Suburban',
    icon: '🏡',
    accent: '#10B981',
    models: [
      // 21 suburban types (a-u)
      ...types(21, 'kenney/suburban', 2.8, '🏡'),
    ],
  },
  {
    id: 'modular',
    label: 'Modular',
    icon: '🏗️',
    accent: '#8B5CF6',
    models: [
      { file: 'building-sample-house-a.glb', label: 'House A', targetHeight: 2.8, path: 'kenney/modular/building-sample-house-a.glb', emoji: '🏠' },
      { file: 'building-sample-house-b.glb', label: 'House B', targetHeight: 2.8, path: 'kenney/modular/building-sample-house-b.glb', emoji: '🏠' },
      { file: 'building-sample-house-c.glb', label: 'House C', targetHeight: 2.8, path: 'kenney/modular/building-sample-house-c.glb', emoji: '🏠' },
      { file: 'building-sample-tower-a.glb', label: 'Tower A', targetHeight: 4.5, path: 'kenney/modular/building-sample-tower-a.glb', emoji: '🗼' },
      { file: 'building-sample-tower-b.glb', label: 'Tower B', targetHeight: 4.8, path: 'kenney/modular/building-sample-tower-b.glb', emoji: '🗼' },
      { file: 'building-sample-tower-c.glb', label: 'Tower C', targetHeight: 5.0, path: 'kenney/modular/building-sample-tower-c.glb', emoji: '🗼' },
      { file: 'building-sample-tower-d.glb', label: 'Tower D', targetHeight: 5.5, path: 'kenney/modular/building-sample-tower-d.glb', emoji: '🗼' },
    ],
  },
]

export const ALL_MODELS: KenneyModel[] = PACKS.flatMap(p => p.models)
export const TOTAL_MODEL_COUNT = ALL_MODELS.length

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  buildingId: string
  buildingLabel: string
  currentPath?: string          // currently active model path for this building
  onSelect: (model: KenneyModel) => void
  onClose: () => void
}

/**
 * Derive the preview-PNG URL from a model's GLB path.
 * Example: "kenney/commercial/building-a.glb" → "previews/commercial/building-a.png"
 * Falls back to emoji if the image fails to load.
 */
function previewUrlFromPath(path: string): string {
  return path.replace(/^kenney\//, 'previews/').replace(/\.glb$/, '.png')
}

export default function ModelPicker({ buildingId, buildingLabel, currentPath, onSelect, onClose }: Props) {
  const [activePack, setActivePack] = useState<PackId>('commercial')
  const [search, setSearch] = useState('')
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  const [imgFailed, setImgFailed] = useState<Set<string>>(new Set())

  const pack = PACKS.find(p => p.id === activePack)!
  const filtered = search.trim()
    ? pack.models.filter(m => m.label.toLowerCase().includes(search.toLowerCase()))
    : pack.models

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {/* Dim backdrop (click-through except on panel) */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(5,20,60,0.35)', pointerEvents: 'auto' }}
        onClick={onClose}
      />

      {/* Picker panel */}
      <div
        style={{
          position: 'relative',
          width: 380,
          height: '100%',
          background: 'linear-gradient(160deg, #FFFFFF 0%, #D8E7FA 60%, #C4DCFF 100%)',
          borderLeft: '1px solid rgba(31,62,108,0.15)',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Heebo', system-ui, sans-serif",
          boxShadow: '-12px 0 40px rgba(5,20,60,0.2)',
          pointerEvents: 'auto',
          animation: 'mpSlideIn 0.22s cubic-bezier(.25,.46,.45,.94) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes mpSlideIn {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
          .mp-card { transition: all 0.15s ease; cursor: pointer; }
          .mp-card:hover { transform: scale(1.04); }
        `}</style>

        {/* ── Header ── */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid rgba(31,62,108,0.1)',
          background: 'rgba(255,255,255,0.6)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1F3E6C' }}>🏗️ Choose Model</div>
              <div style={{ fontSize: 12, color: '#7F9BD9', marginTop: 2 }}>
                {buildingLabel} · {TOTAL_MODEL_COUNT} models available
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(31,62,108,0.07)', border: '1px solid rgba(31,62,108,0.2)',
                borderRadius: 8, width: 32, height: 32, color: '#254A9F',
                cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search models…"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(31,62,108,0.15)',
              borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#1F3E6C',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* ── Pack tabs ── */}
        <div style={{
          display: 'flex', flexShrink: 0,
          borderBottom: '1px solid rgba(31,62,108,0.1)',
          background: 'rgba(255,255,255,0.4)',
          overflowX: 'auto',
        }}>
          {PACKS.map(p => (
            <button
              key={p.id}
              onClick={() => { setActivePack(p.id); setSearch('') }}
              style={{
                flex: 1, padding: '10px 4px', border: 'none', background: 'none', cursor: 'pointer',
                borderBottom: `2px solid ${activePack === p.id ? p.accent : 'transparent'}`,
                color: activePack === p.id ? p.accent : 'rgba(31,62,108,0.45)',
                fontWeight: 700, fontSize: 11, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 2, fontFamily: 'inherit',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: 18 }}>{p.icon}</span>
              <span>{p.label}</span>
              <span style={{ fontSize: 10, opacity: 0.6 }}>{p.models.length}</span>
            </button>
          ))}
        </div>

        {/* ── Model grid ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: 12,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
          alignContent: 'start',
        }}>
          {filtered.map(model => {
            const isActive = model.path === currentPath
            const isHovered = model.path === hoveredPath
            return (
              <button
                key={model.path}
                className="mp-card"
                onClick={() => onSelect(model)}
                onMouseEnter={() => setHoveredPath(model.path)}
                onMouseLeave={() => setHoveredPath(null)}
                style={{
                  background: isActive
                    ? `${pack.accent}22`
                    : isHovered ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.55)',
                  border: `${isActive ? 2 : 1}px solid ${isActive ? pack.accent + '77' : 'rgba(31,62,108,0.12)'}`,
                  borderRadius: 10,
                  padding: '10px 6px',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 4,
                  boxShadow: isActive ? `0 0 0 2px ${pack.accent}44` : 'none',
                  fontFamily: 'inherit',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    fontSize: 9, background: pack.accent, color: '#fff',
                    borderRadius: 4, padding: '1px 4px', fontWeight: 700,
                  }}>✓</div>
                )}
                {imgFailed.has(model.path) ? (
                  <span style={{ fontSize: 30, lineHeight: 1 }}>{model.emoji}</span>
                ) : (
                  <img
                    src={`${import.meta.env.BASE_URL}${previewUrlFromPath(model.path)}`}
                    alt={model.label}
                    onError={() => setImgFailed(prev => new Set(prev).add(model.path))}
                    style={{
                      width: 56, height: 56, objectFit: 'contain',
                      imageRendering: 'auto',
                      filter: isActive ? 'drop-shadow(0 0 6px ' + pack.accent + '88)' : 'none',
                    }}
                  />
                )}
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: isActive ? pack.accent : '#1F3E6C',
                  textAlign: 'center', lineHeight: 1.3,
                  maxWidth: '100%', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {model.label}
                </span>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div style={{
              gridColumn: '1 / -1', padding: '32px 16px', textAlign: 'center',
              color: '#7F9BD9', fontSize: 13,
            }}>
              No models match "{search}"
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(31,62,108,0.1)',
          background: 'rgba(255,255,255,0.5)',
          flexShrink: 0,
          fontSize: 11, color: '#7F9BD9', textAlign: 'center',
        }}>
          Click a model to apply it instantly · Changes are saved automatically
        </div>
      </div>
    </div>
  )
}
