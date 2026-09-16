import * as React from 'react';

export interface TopicCardTopic {
  id: string;
  /** Hebrew topic label (HEBREW_LABELS value in the app). */
  label: string;
  /** Building / unit name shown under the label (may be ''). */
  building: string;
  questionCount: number;
}

export interface TopicCardProgress {
  mastered?: boolean;
  bestScore?: number;
  sessionsAttempted?: number;
}

export interface TopicCardProps {
  topic?: TopicCardTopic;
  /** Per-topic progress. Replaces userProgress.topics[topic.id] (progressStore). */
  progress?: TopicCardProgress;
  /** Personal-plan hint chip text. Replaces hintByTopic.get(topic.id). */
  planHint?: string;
  /** Fired by the 📚 תיאוריה / 📝 תרגול buttons. */
  onSelectTopic?: (topicId: string, mode: 'lesson' | 'quiz') => void;
}

/** One glass tile of the topic-selector grid (TopicSelector's renderTopicCard
 *  converted to a component): mastery star, stats row, optional plan-hint and
 *  mastery banner, lesson/quiz action buttons. */
export declare function TopicCard(props: TopicCardProps): React.ReactElement;
