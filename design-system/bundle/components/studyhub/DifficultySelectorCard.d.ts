import * as React from 'react';

export interface DifficultySelectorCardProps {
  /** Hebrew difficulty label (הכל / קל / בינוני / מאתגר). */
  label: string;
  /** Question count for this difficulty. */
  count: number;
  /** Emoji icon (🎯 / 🌱 / ⚡ / 🔥). */
  icon: string;
  /** Difficulty accent color (hex). */
  color: string;
  /** Resting translucent background (rgba). */
  bg: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/** One clickable difficulty tile in the quiz-intro 4-up grid. */
export declare function DifficultySelectorCard(props: DifficultySelectorCardProps): React.ReactElement;
