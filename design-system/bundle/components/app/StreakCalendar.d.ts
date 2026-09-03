export interface StreakCalendarProps {
  /**
   * Current streak length in days. In the app this comes from
   * useMotivationStore((state) => state.streak_current_days).
   * The last `streak` days (capped at 28) render gold-filled.
   * @default 12
   */
  streak?: number;
}

export declare function StreakCalendar(props: StreakCalendarProps): JSX.Element;
