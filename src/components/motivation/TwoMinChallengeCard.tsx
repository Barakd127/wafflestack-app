interface TwoMinChallengeCardProps {
  topicId: string;
  onStart?: (topicId: string) => void;
}

const GOLD = "#FFD700";

export const TwoMinChallengeCard = ({ topicId, onStart }: TwoMinChallengeCardProps) => {
  const disabled = topicId.trim().length === 0;

  return (
    <section
      dir="rtl"
      aria-label="אתגר שתי דקות"
      style={{
        borderRadius: 24,
        padding: 20,
        color: "white",
        background: "linear-gradient(145deg, #0B1B3E 0%, #142A5C 100%)",
        boxShadow: "0 18px 45px rgba(0,0,0,0.28)",
        border: `1px solid rgba(255,215,0,0.22)`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: 999,
          padding: "6px 10px",
          color: "#0B1B3E",
          background: GOLD,
          fontWeight: 900,
          fontSize: 13,
        }}
      >
        אתגר 2 דקות
      </div>

      <h2 style={{ margin: "14px 0 8px", fontSize: 24 }}>רק להתחיל, בלי לחץ</h2>

      <p style={{ margin: "0 0 18px", opacity: 0.82, lineHeight: 1.6 }}>
        פותחים את הנושא ומתקדמים שתי דקות בלבד. אם בא להמשיך — מעולה.
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onStart?.(topicId)}
        style={{
          width: "100%",
          border: 0,
          borderRadius: 999,
          padding: "12px 18px",
          color: "#0B1B3E",
          background: disabled ? "rgba(255,255,255,0.28)" : GOLD,
          fontWeight: 900,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        התחלת אתגר
      </button>
    </section>
  );
};
