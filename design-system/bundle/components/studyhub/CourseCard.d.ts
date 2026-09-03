import * as React from 'react';

export interface CourseDef {
  id: 'stat-a' | 'stat-b' | 'methods' | 'anova' | 'sql';
  label: string;
  /** Emoji shown on the card (legacy field; the rendered chip uses CourseIcon). */
  icon: string;
  desc: string;
  active: boolean;
  /** Tile gradient. */
  bg: string;
}

/** The REAL course array from StudyHub.tsx, verbatim. */
export declare const COURSES: CourseDef[];

export interface CourseIconProps {
  id: CourseDef['id'];
  /** Default 30. */
  size?: number;
}

/** Bespoke stroke-only line icon per course (sidebar icon language). */
export declare function CourseIcon(props: CourseIconProps): React.ReactElement | null;

export interface CourseCardProps {
  /** Course entry to render. Default COURSES[0] (סטטיסטיקה א'). */
  course?: CourseDef;
  /** Replaces CourseGate's pickCourse routing (coming-soon modal /
   *  window.open / embedded player / onSelectActive). */
  onSelect?: (course: CourseDef) => void;
}

/** One ws-glass-card tile of the "הקורסים שלי" course grid: sidebar-language
 *  icon chip, label, description, and the "בקרוב" pin when inactive. */
export declare function CourseCard(props: CourseCardProps): React.ReactElement;
