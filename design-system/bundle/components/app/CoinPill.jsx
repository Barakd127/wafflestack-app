// [ds-extract] from src/components/economy/CoinPill.tsx @ c1a3ad12 (master)
/**
 * CoinPill — the only place a coin BALANCE is ever displayed (R13: coin
 * feedback is secondary to competence feedback; on learning surfaces the pill
 * shrinks to a 20px icon with no number). Hidden entirely until the ledger
 * holds ≥1 retrieval-passed event — coins appear with the first gate pass,
 * never before.
 */
import React from 'react';

// ── Formatting ───────────────────────────────────────────────────────────────

const nf = new Intl.NumberFormat('he-IL');

// ── Glyphs ───────────────────────────────────────────────────────────────────

function CoinGlyph({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" fill="var(--sh-gold)" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1.5" />
    </svg>
  );
}

// ── CoinPill ─────────────────────────────────────────────────────────────────

const pillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 44,
  paddingBlock: 8,
  paddingInline: 14,
  borderRadius: 999,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--sh-gold)',
  fontSize: 15,
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  cursor: 'pointer',
};

// [ds-extract] replaced userId prop + useLedgerVersion(userId) subscription + loadLedger/coinBalance (localStorage-backed ledger) with balance prop — visual output unchanged
// [ds-extract] replaced ledger.graph.some(g => g.type === 'retrieval-passed') gate with hasPass prop (true = pill visible; the real pill renders null until the first retrieval gate pass) — visual output unchanged
// [ds-extract] replaced setDrawerOpen(true) + <SpendDrawer/> mount with onClick prop (drawer is closed at rest; see Seams in CoinPill.prompt.md) — visual output unchanged
export function CoinPill({
  surface = 'economy',
  balance = 145,
  hasPass = true,
  onClick = () => {},
}) {
  // Approved decision: coins do not exist until the first retrieval gate pass.
  if (!hasPass) return null;

  if (surface === 'learning') {
    // R13: on learning surfaces the coin is a quiet presence — icon only,
    // no number, nothing clickable, nothing that competes with competence.
    return (
      <span role="img" aria-label="מטבעות" title="מטבעות" style={{ display: 'inline-flex' }}>
        <CoinGlyph size={20} />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`מטבעות: ${nf.format(balance)} — פתיחת חנות הקישוטים`}
      style={pillStyle}
    >
      <CoinGlyph size={20} />
      <span style={{ direction: 'ltr' /* keep digit run stable inside RTL pill */ }}>
        {nf.format(balance)}
      </span>
    </button>
  );
}
