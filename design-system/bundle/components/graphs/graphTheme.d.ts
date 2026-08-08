import * as React from 'react';

/** Handwritten Hebrew graph font stack: 'Playpen Sans Hebrew', 'Assistant', sans-serif */
export declare const GRAPH_FONT: string;

/** Graph colour tokens (navy ink, gold data marks, blue interactive accents). */
export declare const GC: {
  /** navy — headings, axis text, data point fill */
  readonly ink: '#1F3E6C';
  /** primary data mark (curve, bars, highlight) */
  readonly gold: '#D4AF37';
  /** shaded area under a curve */
  readonly goldFill: 'rgba(212,175,55,0.28)';
  /** gold-on-light readable label */
  readonly goldText: '#9A7B1F';
  /** interactive accents (guides, slider fill, hints) */
  readonly blue: '#4E71DA';
  readonly axis: 'rgba(31,62,108,0.45)';
  readonly axisText: 'rgba(31,62,108,0.6)';
  /** semantic positive (result / coverage) */
  readonly good: '#1f7a6d';
  /** semantic negative (miss / error) — only legitimate red */
  readonly warn: '#b33a3a';
};

/** Card container style — consumes var(--sh-q-card-bg) and var(--sh-text-dark). */
export declare const graphCardStyle: React.CSSProperties;
export declare const graphTitleStyle: React.CSSProperties;
export declare const graphSubtitleStyle: React.CSSProperties;

export interface GraphFrameProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
/** Standard graph shell: light RTL card + handwritten title + optional subtitle. */
export declare function GraphFrame(props: GraphFrameProps): React.ReactElement;

export interface GraphSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  /** @default 1 */
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}
/** Labelled range slider in the reference style (blue accent, hand font). */
export declare function GraphSlider(props: GraphSliderProps): React.ReactElement;

export interface GraphSliderRowProps {
  children: React.ReactNode;
}
/** Two-column slider grid (μ / σ style). */
export declare function GraphSliderRow(props: GraphSliderRowProps): React.ReactElement;
