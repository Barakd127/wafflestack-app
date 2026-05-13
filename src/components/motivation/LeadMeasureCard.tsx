/**
 * LeadMeasureCard — two big numbers: weekly focus minutes + topics mastered.
 * Light glassmorphism to match StudyHub home cards.
 */
import { useMotivationStore } from "../../store/motivationStore";

interface LeadMeasureCardProps {
  topics_mastered: number;
}

const GOLD = "#D4AF37";

export const LeadMeasureCard = ({ topics_mastered }: LeadMeasureCardProps) => {
  const focusMinutesWeek = useMotivationStore((state) => state.focus_minutes_week);
  const safeTopicsMastered = Math.max(0, Math.floor(topics_mastered));

  return (
    <section
      dir="rtl"
      aria-label="מדדי התקדמות מובילים"
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
      <h2 style={{
        margin: "0 0 14px",
        fontFamily: "'Rubik', sans-serif",
        fontSize: 18,
        fontWeight: 700,
        color: "var(--sh-text-dark)",
      }}>📊 מדדי השבוע</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, flex: 1 }}>
        <div
          style={{
            borderRadius: 16,
            padding: "14px 12px",
            background: "rgba(31,62,108,0.05)",
            border: "1px solid rgba(31,62,108,0.10)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ color: GOLD, fontSize: 32, fontWeight: 900, lineHeight: 1, fontFamily: "'Inter', sans-serif" }}>{focusMinutesWeek}</div>
          <div style={{ fontSize: 12, color: "var(--sh-text-tip)", marginTop: 6, fontFamily: "'Assistant', sans-serif" }}>דקות פוקוס</div>
        </div>

        <div
          style={{
            borderRadius: 16,
            padding: "14px 12px",
            background: "rgba(31,62,108,0.05)",
            border: "1px solid rgba(31,62,108,0.10)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ color: GOLD, fontSize: 32, fontWeight: 900, lineHeight: 1, fontFamily: "'Inter', sans-serif" }}>{safeTopicsMastered}</div>
          <div style={{ fontSize: 12, color: "var(--sh-text-tip)", marginTop: 6, fontFamily: "'Assistant', sans-serif" }}>נושאים שלמדת</div>
        </div>
      </div>
    </section>
  );
};
