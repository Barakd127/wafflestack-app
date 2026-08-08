import * as React from 'react';

export interface ConceptCardProps {
  /** English concept name (small, dimmed). */
  concept: string;
  /** Hebrew concept name (bold, colored). */
  conceptHe: string;
  /** Formula shown in the monospace strip. */
  formula: string;
  /** Real-world example line (prefixed with 💡). */
  realWorld: string;
  /** Accent color hex (e.g. "#7f9bd9"); used with 0d/33 alpha suffixes. */
  color: string;
}

export declare function ConceptCard(props: ConceptCardProps): React.ReactElement;
