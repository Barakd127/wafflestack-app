import { useMemo } from "react";
import { useMotivationStore } from "../../store/motivationStore";

const GOLD = "#FFD700";

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
        borderRadius: 24,
        padding: 20,
        color: "white",
        background: "linear-gradient(145deg, #0B1B3E 0%, #142A5C 100%)",
        boxShadow: "0 18px 45px rgba(0,0,0,0.28)",
      }}
    >
      <style>
        {`
          @keyframes wsPulseGold {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,215,0,0.45); }
            50% { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(255,215,0,0); }
          }
        `}
      </style>

      <h2 style={{ margin: "0 0 16px", fontSize: 22, color: GOLD }}>
        {streak} ימים ברצף 🔥
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 10,
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
                borderRadius: 12,
                background: isFilled ? GOLD : "rgba(255,255,255,0.12)",
                border: isToday ? `2px solid ${GOLD}` : "1px solid rgba(255,255,255,0.14)",
                opacity: isFilled ? 1 : 0.55,
                animation: isToday ? "wsPulseGold 1.6s ease-in-out infinite" : undefined,
              }}
            />
          );
        })}
      </div>
    </section>
  );
};
