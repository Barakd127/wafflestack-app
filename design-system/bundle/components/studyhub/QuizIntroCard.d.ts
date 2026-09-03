import * as React from 'react';

export type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

export interface QuizIntroCardCounts {
  all: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface QuizIntroCardProps {
  /** Hebrew topic name after "תרגול:". Replaces the HEBREW_LABELS /
   *  quiz-bank concept lookup by topicId. Default 'ממוצע'. */
  topicName?: string;
  /** Question counts per difficulty. Replaces the quiz-bank derivation.
   *  Zero disables that tile / the start button. */
  counts?: QuizIntroCardCounts;
  /** Whether the 📚 קרא תיאוריה button renders. Replaces the LESSON_CONTENT
   *  lookups. Default true. */
  hasLesson?: boolean;
  onStart?: (difficulty: DifficultyFilter) => void;
  onBack?: () => void;
  onReadLesson?: () => void;
}

/** Centred quiz preview screen (ws-quiz-intro): difficulty selector grid,
 *  pep-talk panel, start / read-theory / back actions. */
export declare function QuizIntroCard(props: QuizIntroCardProps): React.ReactElement;
