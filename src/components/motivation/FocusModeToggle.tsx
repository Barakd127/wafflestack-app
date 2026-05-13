import { useMotivationStore } from "../../store/motivationStore";

const GOLD = "#FFD700";

export const FocusModeToggle = () => {
  const active = useMotivationStore((state) => state.focus_mode_active);
  const toggleFocusMode = useMotivationStore((state) => state.toggleFocusMode);

  const handleToggle = (): void => {
    const nextActive = toggleFocusMode();

    window.dispatchEvent(
      new CustomEvent<{ active: boolean }>("ws-focus-mode", {
        detail: { active: nextActive },
      }),
    );
  };

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={handleToggle}
      dir="rtl"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        border: `1px solid ${active ? GOLD : "rgba(255,255,255,0.18)"}`,
        borderRadius: 999,
        padding: "10px 14px",
        color: active ? "#0B1B3E" : "white",
        background: active
          ? GOLD
          : "linear-gradient(145deg, #0B1B3E 0%, #142A5C 100%)",
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: active ? "0 0 24px rgba(255,215,0,0.35)" : "none",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: active ? "#0B1B3E" : GOLD,
        }}
      />
      {active ? "מצב פוקוס פעיל" : "הפעל מצב פוקוס"}
    </button>
  );
};
