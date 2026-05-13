/**
 * TwoMinChallengeCard — "Atomic Habits" Two-Minute Rule entry point. Light
 * glassmorphism matching StudyHub home cards.
 */
interface TwoMinChallengeCardProps {
  topicId: string;
  onStart?: (topicId: string) => void;
}

const GOLD = "#D4AF37";
const GOLD_BRIGHT = "#F5C842";

export const TwoMinChallengeCard = ({ topicId, onStart }: TwoMinChallengeCardProps) => {
  const disabled = topicId.trim().length === 0;

  return (
    <section
      dir="rtl"
      aria-label="אתגר שתי דקות"
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
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          alignSelf: "flex-start",
          borderRadius: 999,
          padding: "5px 12px",
          color: "var(--sh-text-dark)",
          background: `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})`,
          fontWeight: 700,
          fontSize: 12,
          fontFamily: "'Rubik', sans-serif",
          boxShadow: "0 2px 6px rgba(212,175,55,0.35)",
        }}
      >
        🎯 אתגר 2 דקות
      </div>

      <h2 style={{
        margin: "12px 0 6px",
        fontFamily: "'Rubik', sans-serif",
        fontSize: 18,
        fontWeight: 700,
        color: "var(--sh-text-dark)",
      }}>רק להתחיל, בלי לחץ</h2>

      <p style={{
        margin: "0 0 14px",
        fontSize: 13,
        lineHeight: 1.55,
        color: "var(--sh-text-tip)",
        fontFamily: "'Assistant', sans-serif",
        flex: 1,
      }}>
        פותחים את הנושא ומתקדמים שתי דקות בלבד. אם בא להמשיך — מעולה.
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onStart?.(topicId)}
        style={{
          width: "100%",
          border: 0,
          borderRadius: 24,
          padding: "10px 18px",
          color: disabled ? "rgba(31,62,108,0.5)" : "#fff",
          background: disabled ? "rgba(31,62,108,0.12)" : "var(--sh-btn-color)",
          fontWeight: 600,
          fontSize: 15,
          fontFamily: "'Rubik', sans-serif",
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: disabled ? "none" : "0px 2px 6px #8DA7FF",
        }}
      >
        התחלת אתגר ←
      </button>
    </section>
  );
};
