import { FormEvent, useState } from "react";
import { useMotivationStore } from "../../store/motivationStore";

interface WhenThenWizardProps {
  open: boolean;
  onClose: () => void;
}

const GOLD = "#FFD700";

export const WhenThenWizard = ({ open, onClose }: WhenThenWizardProps) => {
  const setCommitment = useMotivationStore((state) => state.setCommitment);
  const setHabitStack = useMotivationStore((state) => state.setHabitStack);

  const [step, setStep] = useState(0);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [anchor, setAnchor] = useState("");

  if (!open) return null;

  const steps = [
    {
      label: "מתי תלמדו?",
      value: time,
      setValue: setTime,
      placeholder: "לדוגמה: אחרי ארוחת ערב",
    },
    {
      label: "איפה תלמדו?",
      value: location,
      setValue: setLocation,
      placeholder: "לדוגמה: בשולחן בחדר",
    },
    {
      label: "מה העוגן להרגל?",
      value: anchor,
      setValue: setAnchor,
      placeholder: "לדוגמה: אחרי שאני מניח את הטלפון בצד",
    },
  ] as const;

  const current = steps[step];
  const canContinue = current.value.trim().length > 1;

  const resetAndClose = (): void => {
    setStep(0);
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canContinue) return;

    if (step < steps.length - 1) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    setHabitStack(`כש${time.trim()} ב${location.trim()}, אז אלמד אחרי: ${anchor.trim()}`);
    setCommitment(true);
    resetAndClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="יצירת התחייבות למידה"
      dir="rtl"
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        padding: 16,
        background: "rgba(0,0,0,0.62)",
        zIndex: 50,
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) resetAndClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "min(440px, 100%)",
          borderRadius: 28,
          padding: 24,
          color: "white",
          background: "linear-gradient(145deg, #0B1B3E 0%, #162E65 100%)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
        }}
      >
        <p style={{ margin: "0 0 8px", color: GOLD, fontWeight: 700 }}>
          שלב {step + 1} מתוך 3
        </p>

        <h2 style={{ margin: "0 0 20px", fontSize: 26 }}>{current.label}</h2>

        <input
          autoFocus
          value={current.value}
          placeholder={current.placeholder}
          onChange={(event) => current.setValue(event.target.value)}
          style={{
            boxSizing: "border-box",
            width: "100%",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 16,
            padding: "14px 16px",
            color: "white",
            background: "rgba(255,255,255,0.1)",
            fontSize: 16,
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            type="submit"
            disabled={!canContinue}
            style={{
              flex: 1,
              border: 0,
              borderRadius: 999,
              padding: "12px 18px",
              background: canContinue ? GOLD : "rgba(255,255,255,0.2)",
              color: "#0B1B3E",
              fontWeight: 800,
              cursor: canContinue ? "pointer" : "not-allowed",
            }}
          >
            {step === 2 ? "שמירה" : "המשך"}
          </button>

          <button
            type="button"
            onClick={resetAndClose}
            style={{
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 999,
              padding: "12px 18px",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
};
