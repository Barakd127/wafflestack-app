import { useCallback, useEffect } from "react";

export type WaffleStackEventName =
  | "quiz_start"
  | "quiz_answer"
  | "quiz_complete"
  | "lesson_view"
  | "screen_blur"
  | "tab_switch";

export type WaffleStackEventPayload = Record<string, string | number | boolean | null>;

export interface WaffleStackEvent {
  id: string;
  name: WaffleStackEventName;
  timestamp: string;
  payload?: WaffleStackEventPayload;
}

const STORAGE_KEY = "ws_events";
const MAX_EVENTS = 200;

const canUseStorage = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readEvents = (): WaffleStackEvent[] => {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((event): event is WaffleStackEvent => {
      if (!event || typeof event !== "object") return false;
      const candidate = event as Partial<WaffleStackEvent>;
      return typeof candidate.id === "string" && typeof candidate.name === "string";
    });
  } catch {
    return [];
  }
};

const writeEvent = (event: WaffleStackEvent): void => {
  if (!canUseStorage()) return;

  const events = [...readEvents(), event].slice(-MAX_EVENTS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

const createId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const useEventTracker = () => {
  const trackEvent = useCallback(
    (name: WaffleStackEventName, payload?: WaffleStackEventPayload): void => {
      writeEvent({
        id: createId(),
        name,
        timestamp: new Date().toISOString(),
        payload,
      });
    },
    [],
  );

  useEffect(() => {
    const handleBlur = (): void => trackEvent("screen_blur");
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === "hidden") trackEvent("tab_switch");
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [trackEvent]);

  return { trackEvent };
};
