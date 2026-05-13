import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type CardType = "text" | "math";

interface NotebookCardModel {
  id: string;
  x: number;
  y: number;
  w: 200;
  h: 100;
  type: CardType;
  content: string;
}

interface ViewState {
  x: number;
  y: number;
  scale: number;
}

interface PersistedNotebook {
  cards: NotebookCardModel[];
  view: ViewState;
}

interface KatexRenderOptions {
  displayMode?: boolean;
  throwOnError?: boolean;
  strict?: boolean | string;
}

// Local typed handle on the existing window.katex CDN global. The project
// already declares it elsewhere (LessonScreen.tsx); we cast through unknown
// to avoid colliding with the more-restricted global declaration.
const getKatex = (): {
  render?: (tex: string, el: HTMLElement, opts?: KatexRenderOptions) => void;
} | null => {
  const k = (window as unknown as { katex?: unknown }).katex;
  return (k ?? null) as {
    render?: (tex: string, el: HTMLElement, opts?: KatexRenderOptions) => void;
  } | null;
};

const STORAGE_KEY = "ws_notebook";
const CARD_WIDTH = 200;
const CARD_HEIGHT = 100;
const MIN_SCALE = 0.4;
const MAX_SCALE = 2.5;

const DEFAULT_VIEW: ViewState = {
  x: 120,
  y: 120,
  scale: 1,
};

type DragState =
  | {
      kind: "pan";
      pointerId: number;
      startClientX: number;
      startClientY: number;
      startX: number;
      startY: number;
    }
  | {
      kind: "card";
      pointerId: number;
      cardId: string;
      offsetX: number;
      offsetY: number;
    };

interface Point {
  x: number;
  y: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isCardType = (value: unknown): value is CardType =>
  value === "text" || value === "math";

const normalizeCard = (value: unknown): NotebookCardModel | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { id, x, y, w, h, type, content } = value;

  if (
    typeof id !== "string" ||
    !isFiniteNumber(x) ||
    !isFiniteNumber(y) ||
    !isCardType(type) ||
    typeof content !== "string"
  ) {
    return null;
  }

  return {
    id,
    x,
    y,
    w: w === CARD_WIDTH ? CARD_WIDTH : CARD_WIDTH,
    h: h === CARD_HEIGHT ? CARD_HEIGHT : CARD_HEIGHT,
    type,
    content,
  };
};

const normalizeView = (value: unknown): ViewState => {
  if (!isRecord(value)) {
    return DEFAULT_VIEW;
  }

  const { x, y, scale } = value;

  if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(scale)) {
    return DEFAULT_VIEW;
  }

  return {
    x,
    y,
    scale: clamp(scale, MIN_SCALE, MAX_SCALE),
  };
};

const loadNotebook = (): PersistedNotebook => {
  if (typeof window === "undefined") {
    return { cards: [], view: DEFAULT_VIEW };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return { cards: [], view: DEFAULT_VIEW };
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed) || !Array.isArray(parsed.cards)) {
      return { cards: [], view: DEFAULT_VIEW };
    }

    const cards = parsed.cards
      .map(normalizeCard)
      .filter((card): card is NotebookCardModel => card !== null);

    return {
      cards,
      view: normalizeView(parsed.view),
    };
  } catch {
    return { cards: [], view: DEFAULT_VIEW };
  }
};

const createId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const isNoDragTarget = (target: EventTarget | null): boolean =>
  target instanceof Element && target.closest("[data-no-drag]") !== null;

const insertPlainTextAtSelection = (text: string): void => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();

  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.setEndAfter(node);

  selection.removeAllRanges();
  selection.addRange(range);
};

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ value, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element || document.activeElement === element) {
      return;
    }

    if ((element.textContent ?? "") !== value) {
      element.textContent = value;
    }
  }, [value]);

  const handleInput = useCallback(
    (event: React.FormEvent<HTMLDivElement>) => {
      onChange(event.currentTarget.textContent ?? "");
    },
    [onChange],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      insertPlainTextAtSelection(event.clipboardData.getData("text/plain"));
      onChange(event.currentTarget.textContent ?? "");
    },
    [onChange],
  );

  return (
    <div
      ref={ref}
      className="unified-notebook__text-editor"
      contentEditable
      data-no-drag="true"
      dir="rtl"
      role="textbox"
      suppressContentEditableWarning
      onInput={handleInput}
      onPaste={handlePaste}
    >
      {value}
    </div>
  );
};

interface MathPreviewProps {
  latex: string;
}

const MathPreview: React.FC<MathPreviewProps> = ({ latex }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    element.textContent = "";

    const trimmed = latex.trim();

    if (!trimmed) {
      element.textContent = "הקלידו LaTeX";
      return;
    }

    const katex = getKatex();

    if (!katex || !katex.render) {
      element.textContent = "KaTeX לא נטען";
      return;
    }

    try {
      katex.render(trimmed, element, {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      element.textContent = "שגיאת נוסחה";
    }
  }, [latex]);

  return <div ref={ref} className="unified-notebook__math-preview" dir="ltr" />;
};

interface NotebookCardProps {
  card: NotebookCardModel;
  selected: boolean;
  onPointerDown: (
    event: React.PointerEvent<SVGGElement>,
    card: NotebookCardModel,
  ) => void;
  onContentChange: (id: string, content: string) => void;
  onTypeChange: (id: string, type: CardType) => void;
}

const NotebookCard: React.FC<NotebookCardProps> = ({
  card,
  selected,
  onPointerDown,
  onContentChange,
  onTypeChange,
}) => {
  const nextType: CardType = card.type === "text" ? "math" : "text";

  return (
    <g
      data-card="true"
      transform={`translate(${card.x} ${card.y})`}
      onPointerDown={(event) => onPointerDown(event, card)}
      className="unified-notebook__card-group"
    >
      <rect
        width={card.w}
        height={card.h}
        rx="14"
        className={
          selected
            ? "unified-notebook__card-rect unified-notebook__card-rect--selected"
            : "unified-notebook__card-rect"
        }
      />
      <foreignObject width={card.w} height={card.h}>
        {/* xmlns is required by the SVG foreignObject contract — TS DOM types
            don't include it on div, so spread it via attr-suppress cast. */}
        <div
          {...{ xmlns: "http://www.w3.org/1999/xhtml" }}
          className="unified-notebook__card"
          dir="rtl"
        >
          <div className="unified-notebook__card-header">
            <span className="unified-notebook__card-title">
              {card.type === "text" ? "כרטיס טקסט" : "כרטיס נוסחה"}
            </span>
            <button
              type="button"
              className="unified-notebook__type-button"
              data-no-drag="true"
              onClick={() => onTypeChange(card.id, nextType)}
            >
              {card.type === "text" ? "נוסחה" : "טקסט"}
            </button>
          </div>

          <div className="unified-notebook__card-body">
            {card.type === "text" ? (
              <TextEditor
                value={card.content}
                onChange={(content) => onContentChange(card.id, content)}
              />
            ) : (
              <div className="unified-notebook__math-card">
                <textarea
                  className="unified-notebook__math-input"
                  data-no-drag="true"
                  dir="ltr"
                  spellCheck={false}
                  value={card.content}
                  onChange={(event) =>
                    onContentChange(card.id, event.currentTarget.value)
                  }
                />
                <MathPreview latex={card.content} />
              </div>
            )}
          </div>
        </div>
      </foreignObject>
    </g>
  );
};

const UnifiedNotebook: React.FC = () => {
  const initialNotebook = useMemo(loadNotebook, []);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const [cards, setCards] = useState<NotebookCardModel[]>(
    initialNotebook.cards,
  );
  const [view, setView] = useState<ViewState>(initialNotebook.view);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const timer = window.setTimeout(() => {
      const payload: PersistedNotebook = { cards, view };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }, 500);

    return () => window.clearTimeout(timer);
  }, [cards, view]);

  const clientToWorld = useCallback(
    (clientX: number, clientY: number): Point => {
      const rect = svgRef.current?.getBoundingClientRect();

      if (!rect) {
        return { x: 0, y: 0 };
      }

      return {
        x: (clientX - rect.left - view.x) / view.scale,
        y: (clientY - rect.top - view.y) / view.scale,
      };
    },
    [view],
  );

  const capturePointer = useCallback((pointerId: number) => {
    const svg = svgRef.current;

    if (!svg) {
      return;
    }

    try {
      svg.setPointerCapture(pointerId);
    } catch {
      return;
    }
  }, []);

  const releasePointer = useCallback((pointerId: number) => {
    const svg = svgRef.current;

    if (!svg) {
      return;
    }

    try {
      if (svg.hasPointerCapture(pointerId)) {
        svg.releasePointerCapture(pointerId);
      }
    } catch {
      return;
    }
  }, []);

  const handleCanvasPointerDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (event.button !== 0) {
        return;
      }

      const target = event.target;

      if (target instanceof Element && target.closest("[data-card]")) {
        return;
      }

      event.preventDefault();
      capturePointer(event.pointerId);
      setSelectedCardId(null);

      dragRef.current = {
        kind: "pan",
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: view.x,
        startY: view.y,
      };
    },
    [capturePointer, view.x, view.y],
  );

  const handleCardPointerDown = useCallback(
    (
      event: React.PointerEvent<SVGGElement>,
      card: NotebookCardModel,
    ): void => {
      setSelectedCardId(card.id);

      if (event.button !== 0 || isNoDragTarget(event.target)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const world = clientToWorld(event.clientX, event.clientY);
      capturePointer(event.pointerId);

      dragRef.current = {
        kind: "card",
        pointerId: event.pointerId,
        cardId: card.id,
        offsetX: world.x - card.x,
        offsetY: world.y - card.y,
      };
    },
    [capturePointer, clientToWorld],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;

      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();

      if (drag.kind === "pan") {
        setView((current) => ({
          ...current,
          x: drag.startX + event.clientX - drag.startClientX,
          y: drag.startY + event.clientY - drag.startClientY,
        }));
        return;
      }

      const world = clientToWorld(event.clientX, event.clientY);

      setCards((current) =>
        current.map((card) =>
          card.id === drag.cardId
            ? {
                ...card,
                x: world.x - drag.offsetX,
                y: world.y - drag.offsetY,
              }
            : card,
        ),
      );
    },
    [clientToWorld],
  );

  const finishPointerDrag = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;

      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      releasePointer(event.pointerId);
      dragRef.current = null;
    },
    [releasePointer],
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent<SVGSVGElement>) => {
      event.preventDefault();

      const rect = svgRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const worldX = (pointerX - view.x) / view.scale;
      const worldY = (pointerY - view.y) / view.scale;
      const zoomFactor = Math.exp(-event.deltaY * 0.0012);
      const nextScale = clamp(view.scale * zoomFactor, MIN_SCALE, MAX_SCALE);

      setView({
        scale: nextScale,
        x: pointerX - worldX * nextScale,
        y: pointerY - worldY * nextScale,
      });
    },
    [view],
  );

  const handleAddCard = useCallback(() => {
    const rect = svgRef.current?.getBoundingClientRect();
    const viewportWidth = rect?.width ?? 900;
    const viewportHeight = rect?.height ?? 600;
    const centerX = (viewportWidth / 2 - view.x) / view.scale;
    const centerY = (viewportHeight / 2 - view.y) / view.scale;

    const card: NotebookCardModel = {
      id: createId(),
      x: centerX - CARD_WIDTH / 2,
      y: centerY - CARD_HEIGHT / 2,
      w: CARD_WIDTH,
      h: CARD_HEIGHT,
      type: "text",
      content: "",
    };

    setCards((current) => [...current, card]);
    setSelectedCardId(card.id);
  }, [view]);

  const handleFitView = useCallback(() => {
    const rect = svgRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    if (cards.length === 0) {
      setView(DEFAULT_VIEW);
      return;
    }

    const minX = Math.min(...cards.map((card) => card.x));
    const minY = Math.min(...cards.map((card) => card.y));
    const maxX = Math.max(...cards.map((card) => card.x + card.w));
    const maxY = Math.max(...cards.map((card) => card.y + card.h));
    const width = Math.max(maxX - minX, 1);
    const height = Math.max(maxY - minY, 1);
    const padding = 96;
    const scale = clamp(
      Math.min(
        rect.width / (width + padding * 2),
        rect.height / (height + padding * 2),
      ),
      MIN_SCALE,
      MAX_SCALE,
    );

    setView({
      scale,
      x: rect.width / 2 - (minX + width / 2) * scale,
      y: rect.height / 2 - (minY + height / 2) * scale,
    });
  }, [cards]);

  const handleContentChange = useCallback((id: string, content: string) => {
    setCards((current) =>
      current.map((card) => (card.id === id ? { ...card, content } : card)),
    );
  }, []);

  const handleTypeChange = useCallback((id: string, type: CardType) => {
    setCards((current) =>
      current.map((card) => (card.id === id ? { ...card, type } : card)),
    );
  }, []);

  return (
    <section className="unified-notebook" dir="rtl" aria-label="מחברת חזותית">
      <style>{styles}</style>

      <div className="unified-notebook__toolbar">
        <button
          type="button"
          className="unified-notebook__toolbar-button"
          onClick={handleAddCard}
        >
          הוסף כרטיס
        </button>
        <button
          type="button"
          className="unified-notebook__toolbar-button"
          onClick={handleFitView}
        >
          התאם תצוגה
        </button>
        <span className="unified-notebook__zoom">
          {Math.round(view.scale * 100)}%
        </span>
      </div>

      <svg
        ref={svgRef}
        className="unified-notebook__svg"
        role="application"
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerDrag}
        onPointerCancel={finishPointerDrag}
        onWheel={handleWheel}
      >
        <defs>
          <linearGradient id="wsNotebookGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#0B1B3E" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <pattern
            id="wsNotebookGrid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="rgba(255, 215, 0, 0.08)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#wsNotebookGradient)" />
        <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
          <rect
            x="-50000"
            y="-50000"
            width="100000"
            height="100000"
            fill="url(#wsNotebookGrid)"
            pointerEvents="none"
          />
          {cards.map((card) => (
            <NotebookCard
              key={card.id}
              card={card}
              selected={selectedCardId === card.id}
              onPointerDown={handleCardPointerDown}
              onContentChange={handleContentChange}
              onTypeChange={handleTypeChange}
            />
          ))}
        </g>
      </svg>
    </section>
  );
};

const styles = `
.unified-notebook {
  position: relative;
  width: 100%;
  height: min(78vh, 860px);
  min-height: 560px;
  overflow: hidden;
  border: 1px solid rgba(255, 215, 0, 0.28);
  border-radius: 22px;
  background: linear-gradient(135deg, #0B1B3E, #1E3A8A);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.36);
  color: #fff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.unified-notebook__toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid rgba(255, 215, 0, 0.24);
  border-radius: 16px;
  background: rgba(5, 15, 36, 0.72);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(14px);
}

.unified-notebook__toolbar-button,
.unified-notebook__type-button {
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 12px;
  background: rgba(255, 215, 0, 0.12);
  color: #FFD700;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  transition:
    background 140ms ease,
    border-color 140ms ease,
    transform 140ms ease;
}

.unified-notebook__toolbar-button {
  padding: 9px 14px;
}

.unified-notebook__type-button {
  padding: 4px 8px;
  font-size: 11px;
}

.unified-notebook__toolbar-button:hover,
.unified-notebook__type-button:hover {
  border-color: #FFD700;
  background: rgba(255, 215, 0, 0.2);
  transform: translateY(-1px);
}

.unified-notebook__toolbar-button:active,
.unified-notebook__type-button:active {
  transform: translateY(0);
}

.unified-notebook__zoom {
  min-width: 48px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  text-align: center;
}

.unified-notebook__svg {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: grab;
  user-select: none;
}

.unified-notebook__svg:active {
  cursor: grabbing;
}

.unified-notebook__card-group {
  cursor: grab;
}

.unified-notebook__card-group:active {
  cursor: grabbing;
}

.unified-notebook__card-rect {
  fill: rgba(10, 25, 58, 0.94);
  stroke: rgba(255, 215, 0, 0.42);
  stroke-width: 1.4;
  filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.34));
}

.unified-notebook__card-rect--selected {
  stroke: #FFD700;
  stroke-width: 2;
}

.unified-notebook__card {
  box-sizing: border-box;
  width: 200px;
  height: 100px;
  overflow: hidden;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.018));
}

.unified-notebook__card-header {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 5px 8px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.18);
  background: rgba(255, 215, 0, 0.08);
}

.unified-notebook__card-title {
  overflow: hidden;
  color: #FFD700;
  font-size: 12px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unified-notebook__card-body {
  box-sizing: border-box;
  height: 70px;
  padding: 7px 8px;
}

.unified-notebook__text-editor {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: auto;
  outline: none;
  color: rgba(255, 255, 255, 0.94);
  font-size: 13px;
  line-height: 1.45;
  text-align: right;
  white-space: pre-wrap;
  cursor: text;
  user-select: text;
  scrollbar-width: thin;
}

.unified-notebook__text-editor:empty::before {
  content: "כתבו כאן...";
  color: rgba(255, 255, 255, 0.42);
}

.unified-notebook__math-card {
  display: grid;
  grid-template-rows: 30px 1fr;
  gap: 5px;
  height: 100%;
}

.unified-notebook__math-input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: 30px;
  resize: none;
  border: 1px solid rgba(255, 215, 0, 0.28);
  border-radius: 8px;
  outline: none;
  background: rgba(0, 0, 0, 0.22);
  color: rgba(255, 255, 255, 0.94);
  font: 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  line-height: 1.25;
  cursor: text;
  user-select: text;
}

.unified-notebook__math-input:focus {
  border-color: rgba(255, 215, 0, 0.75);
}

.unified-notebook__math-preview {
  overflow: hidden;
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  line-height: 1.15;
  text-align: center;
}

.unified-notebook__math-preview .katex-display {
  margin: 0;
}

@media (max-width: 640px) {
  .unified-notebook {
    height: 72vh;
    min-height: 480px;
    border-radius: 16px;
  }

  .unified-notebook__toolbar {
    top: 10px;
    right: 10px;
    left: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .unified-notebook__toolbar-button {
    padding: 8px 10px;
    font-size: 13px;
  }
}
`;

export default UnifiedNotebook;
