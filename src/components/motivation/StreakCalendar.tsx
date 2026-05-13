/**
 * StreakCalendar — 7×4 grid of last 28 days. Gold-filled = study day completed.
 * Today pulses. Light glassmorphism to match StudyHub home cards.
 */
import { useMemo } from "react";
import { useMotivationStore } from "../../store/motivationStore";

const GOLD = "#D4AF37";
const GOLD_BRIGHT = "#F5C842";

const localDate = (date = new Date()): string => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const dateDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return localDate(date);
};

export const StreakCalendar = () => {
  const streak = useMotivationStore((state) => state.streak_current_days);
  const days = useMemo(() => Array.from({ length: 28 }, (_, index) => dateDaysAgo(27 - index)), []);

  const filledDates = useMemo(() => {
    const filled = new Set<string>();
    for (let i = 0; i < Math.min(streak, 28); i += 1) {
      filled.add(dateDaysAgo(i));
    }
    return filled;
  }, [streak]);

  const today = localDate();

  return (
    <section
      dir="rtl"
      aria-label="לוח רצף למידה"
      style={{
        background: "var(--sh-glass-card)",
        backdropFilter: "blur(20px)",
        boxShadow: "var(--sh-card-shadow)",
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.5)",
        padding: "22px 22px 18px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>
        {`
          @keyframes wsPulseGold {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212,175,55,0.45); }
            50% { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(212,175,55,0); }
          }
        `}
      </style>

      <h2 style={{
        margin: "0 0 14px",
        fontFamily: "'Rubik', sans-serif",
        fontSize: 18,
        fontWeight: 700,
        color: "var(--sh-text-dark)",
      }}>
        🔥 {streak} ימים ברצף
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 6,
        }}
      >
        {days.map((day) => {
          const isFilled = filledDates.has(day);
          const isToday = day === today;

          return (
            <div
              key={day}
              title={day}
              aria-label={`${day}${isFilled ? " הושלם" : " לא הושלם"}`}
              style={{
                aspectRatio: "1 / 1",
                borderRadius: 6,
                background: isFilled
                  ? `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`
                  : "rgba(31,62,108,0.06)",
                border: isToday ? `2px solid ${GOLD}` : "1px solid rgba(31,62,108,0.10)",
                animation: isToday ? "wsPulseGold 1.6s ease-in-out infinite" : undefined,
              }}
            />
          );
        })}
      </div>
    </section>
  );
};
