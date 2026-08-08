import * as React from 'react';

export interface CoinPillProps {
  /**
   * Real prop. 'economy' renders the full pill (glyph + tabular-nums balance,
   * clickable); 'learning' renders a quiet 20px coin glyph only (R13).
   * @default 'economy'
   */
  surface?: 'economy' | 'learning';
  /**
   * [ds-extract seam] Replaces coinBalance(loadLedger(userId)) — the coin
   * balance derived from the localStorage-backed asset-event ledger.
   * @default 145
   */
  balance?: number;
  /**
   * [ds-extract seam] Replaces ledger.graph.some(g => g.type === 'retrieval-passed').
   * false renders null — in the app coins do not exist until the first
   * retrieval gate pass.
   * @default true
   */
  hasPass?: boolean;
  /**
   * [ds-extract seam] Replaces setDrawerOpen(true). In the app this opens the
   * SpendDrawer (חנות הקישוטים).
   */
  onClick?: () => void;
}

export declare function CoinPill(props: CoinPillProps): React.ReactElement | null;
