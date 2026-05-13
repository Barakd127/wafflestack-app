import { useMotivationStore } from "../../store/motivationStore";

interface LeadMeasureCardProps {
  topics_mastered: number;
}

const GOLD = "#FFD700";

export const LeadMeasureCard = ({ topics_mastered }: LeadMeasureCardProps) => {
  const focusMinutesWeek = useMotivationStore((state) => state.focus_minutes_week);
  const safeTopicsMastered = Math.max(0, Math.floor(topics_mastered));

  return (
    <section
      dir="rtl"
      aria-label="מדדי התקדמות מובילים"
      style={{
        borderRadius: 24,
        padding: 20,
        color: "white",
        background: "linear-gradient(145deg, #0B1B3E 0%, #142A5C 100%)",
        boxShadow: "0 18px 45px rgba(0,0,0,0.28)",
      }}
    >
      <h2 style={{ margin: "0 0 16px", fontSize: 20 }}>מדדי השבוע</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        <div
          style={{
            borderRadius: 18,
            padding: 16,
            background: "rgba(255,255,255,0.09)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ color: GOLD, fontSize: 34, fontWeight: 900 }}>{focusMinutesWeek}</div>
          <div style={{ opacity: 0.82 }}>דקות פוקוס</div>
        </div>

        <div
          style={{
            borderRadius: 18,
            padding: 16,
            background: "rgba(255,255,255,0.09)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ color: GOLD, fontSize: 34, fontWeight: 900 }}>{safeTopicsMastered}</div>
          <div style={{ opacity: 0.82 }}>נושאים שנשלחו</div>
        </div>
      </div>
    </section>
  );
};
