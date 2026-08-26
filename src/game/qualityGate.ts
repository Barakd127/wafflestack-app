/**
 * qualityGate — label quality check for player-authored bridge/analogy edges.
 *
 * Rejects lazy labels ("קשור", "related", …) so payouts (R1) only go to
 * edges that actually explain a connection, not stub text farmed for coins.
 * Pure, no store access.
 */
import type { BridgeKind, QualityVerdict } from './bridgeTypes'

const MIN_LABEL_LENGTH = 4
const MIN_MEANINGFUL_WORDS = 8
const MIN_WORD_LENGTH = 2

// Generic / lazy labels, compared after trim + lowercase. Hebrew-aware:
// includes common lazy Hebrew phrases alongside the English equivalents.
const GENERIC_LABELS = new Set([
  'קשור',
  'קשור ל',
  'connected',
  'related',
  'דומה',
  'שייך',
  'יש קשר',
])

function normalize(text: string): string {
  return text.trim().toLowerCase()
}

function countMeaningfulWords(text: string): number {
  return text
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= MIN_WORD_LENGTH).length
}

export function checkLabel(label: string, kind: BridgeKind): QualityVerdict {
  const trimmed = label.trim()

  if (trimmed.length === 0) {
    return { pass: false, reason: 'התווית ריקה — נא לתאר את הקשר בין הנושאים' }
  }

  if (trimmed.length < MIN_LABEL_LENGTH) {
    return { pass: false, reason: 'התווית קצרה מדי — נא לנסח בפירוט רב יותר' }
  }

  if (GENERIC_LABELS.has(normalize(trimmed))) {
    return { pass: false, reason: 'תווית כללית מדי — נסה לנסח מה הקשר באמת' }
  }

  // Word-count check here covers the label alone. When a justification is
  // available too, callers should use checkLabelWithJustification instead —
  // it evaluates the ≥8-meaningful-word requirement over label+justification
  // combined, per the design rules.
  if ((kind === 'analogy' || kind === 'similarity') && countMeaningfulWords(label) < MIN_MEANINGFUL_WORDS) {
    return {
      pass: false,
      reason: 'אנלוגיה/דמיון דורשים הסבר מפורט יותר — נסה להוסיף עוד מילים המסבירות את הקשר',
    }
  }

  return { pass: true, reason: 'התווית עברה את בדיקת האיכות' }
}

/**
 * Full check combining label + optional justification — use this when a
 * justification field is available (bridgeStore.submitEdge does). For
 * 'analogy'/'similarity' kinds, the ≥8-meaningful-word requirement is
 * evaluated over label+justification combined, not label alone.
 */
export function checkLabelWithJustification(
  label: string,
  kind: BridgeKind,
  justification?: string
): QualityVerdict {
  const base = checkLabel(label, kind)
  if (!base.pass) return base

  if (kind === 'analogy' || kind === 'similarity') {
    const combined = `${label} ${justification ?? ''}`
    if (countMeaningfulWords(combined) < MIN_MEANINGFUL_WORDS) {
      return {
        pass: false,
        reason: 'אנלוגיה/דמיון דורשים הסבר מפורט יותר — נסה להוסיף עוד מילים המסבירות את הקשר',
      }
    }
  }

  return { pass: true, reason: 'התווית עברה את בדיקת האיכות' }
}
