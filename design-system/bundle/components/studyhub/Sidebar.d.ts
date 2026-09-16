import * as React from 'react';

/** Nav destinations (item.id) and actions (item.action) the sidebar emits. */
export type SidebarNavTarget = 'home' | 'courses' | 'arsenal' | 'world' | 'tours';

export interface SidebarProps {
  /** Which nav row renders the solid active pill. Default 'home'.
   *  (Replaces the app's `active: InternalView` prop.) */
  activeItem?: 'home' | 'courses' | 'arsenal';
  /** Single navigation seam — receives the row's id ('home' | 'courses' |
   *  'arsenal') or action ('world' | 'tours'). Replaces the app's
   *  onNav/onGoWorld/onGoMindmap/onGoDrawing/onGoNotebook/onOpenTours callbacks. */
  onNavigate?: (target: SidebarNavTarget) => void;
  /** Feature ids to render locked (dimmed row + 🔒 pin). Only 'arsenal' is
   *  feature-gated in the source. Default [] = everything unlocked.
   *  Replaces the useLearningStore unlockedFeatures/adminMode gating. */
  lockedFeatures?: string[];
  /** Hebrew tooltip per locked feature id (replaces FEATURE_UNLOCKS_BY_ID
   *  descriptionHe lookup). */
  lockTips?: Record<string, string>;
}

/** 247px RTL app-shell sidebar (fixed width; the app's collapse/drag-resize
 *  seam is removed). Bottom section keeps the admin toggle (local state) and
 *  an empty Pomodoro placeholder honoring --ws-pomodoro-left. */
export declare function Sidebar(props: SidebarProps): React.ReactElement;
