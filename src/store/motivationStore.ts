import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EffortScore = 1 | 2 | 3 | 4 | 5;

interface MotivationState {
  streak_current_days: number;
  streak_longest_days: number;
  focus_minutes_week: number;
  perceived_effort_avg: number;
  cognitive_load_today: number;
  last_study_date: string | null;
  commitment_set: boolean;
  habit_stack_anchor: string;
  focus_mode_active: boolean;
  effort_sample_count: number;
  focus_week_start: string;
  recordQuizComplete: (effort: EffortScore) => void;
  recordFocusMinute: () => void;
  setCommitment: (isSet: boolean) => void;
  setHabitStack: (anchor: string) => void;
  toggleFocusMode: () => boolean;
}

const localDate = (date = new Date()): string => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const daysBetween = (from: string, to: string): number => {
  const fromTime = new Date(`${from}T00:00:00`).getTime();
  const toTime = new Date(`${to}T00:00:00`).getTime();
  return Math.round((toTime - fromTime) / 86_400_000);
};

const weekStart = (date = new Date()): string => {
  const day = date.getDay();
  const diff = date.getDate() - day;
  return localDate(new Date(date.getFullYear(), date.getMonth(), diff));
};

const nextStreak = (
  current: number,
  longest: number,
  lastStudyDate: string | null,
): Pick<MotivationState, "streak_current_days" | "streak_longest_days" | "last_study_date"> => {
  const today = localDate();

  if (lastStudyDate === today) {
    return {
      streak_current_days: current,
      streak_longest_days: Math.max(longest, current),
      last_study_date: today,
    };
  }

  const gap = lastStudyDate ? daysBetween(lastStudyDate, today) : Number.POSITIVE_INFINITY;
  const updatedCurrent = gap === 1 ? current + 1 : 1;

  return {
    streak_current_days: updatedCurrent,
    streak_longest_days: Math.max(longest, updatedCurrent),
    last_study_date: today,
  };
};

const normalizeEffort = (effort: EffortScore): EffortScore => {
  if (![1, 2, 3, 4, 5].includes(effort)) {
    throw new Error("Effort must be an integer from 1 to 5.");
  }

  return effort;
};

export const useMotivationStore = create<MotivationState>()(
  persist(
    (set, get) => ({
      streak_current_days: 0,
      streak_longest_days: 0,
      focus_minutes_week: 0,
      perceived_effort_avg: 0,
      cognitive_load_today: 0,
      last_study_date: null,
      commitment_set: false,
      habit_stack_anchor: "",
      focus_mode_active: false,
      effort_sample_count: 0,
      focus_week_start: weekStart(),

      recordQuizComplete: (effort) => {
        const score = normalizeEffort(effort);
        set((state) => {
          const count = state.effort_sample_count + 1;
          const average =
            (state.perceived_effort_avg * state.effort_sample_count + score) / count;

          return {
            ...nextStreak(
              state.streak_current_days,
              state.streak_longest_days,
              state.last_study_date,
            ),
            perceived_effort_avg: Number(average.toFixed(2)),
            cognitive_load_today: score,
            effort_sample_count: count,
          };
        });
      },

      recordFocusMinute: () => {
        set((state) => {
          const currentWeekStart = weekStart();
          const resetWeek = state.focus_week_start !== currentWeekStart;

          return {
            ...nextStreak(
              state.streak_current_days,
              state.streak_longest_days,
              state.last_study_date,
            ),
            focus_week_start: currentWeekStart,
            focus_minutes_week: (resetWeek ? 0 : state.focus_minutes_week) + 1,
          };
        });
      },

      setCommitment: (isSet) => set({ commitment_set: isSet }),

      setHabitStack: (anchor) => set({ habit_stack_anchor: anchor.trim() }),

      toggleFocusMode: () => {
        const next = !get().focus_mode_active;
        set({ focus_mode_active: next });
        return next;
      },
    }),
    {
      name: "ws_msv",
      version: 1,
    },
  ),
);
