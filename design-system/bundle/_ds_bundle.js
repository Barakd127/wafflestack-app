/* @ds-bundle: {"format":4,"namespace":"WaffleStackDesignSystem_a43b54","components":[{"name":"CoinPill","sourcePath":"components/app/CoinPill.jsx"},{"name":"ConceptCard","sourcePath":"components/app/ConceptCard.jsx"},{"name":"Ribbon","sourcePath":"components/app/Ribbon.jsx"},{"name":"StreakCalendar","sourcePath":"components/app/StreakCalendar.jsx"},{"name":"Tooltip","sourcePath":"components/app/Tooltip.jsx"},{"name":"TutorFAB","sourcePath":"components/app/TutorFAB.jsx"},{"name":"GraphFrame","sourcePath":"components/graphs/graphTheme.jsx"},{"name":"GraphSlider","sourcePath":"components/graphs/graphTheme.jsx"},{"name":"GraphSliderRow","sourcePath":"components/graphs/graphTheme.jsx"},{"name":"CourseIcon","sourcePath":"components/studyhub/CourseCard.jsx"},{"name":"CourseCard","sourcePath":"components/studyhub/CourseCard.jsx"},{"name":"DifficultySelectorCard","sourcePath":"components/studyhub/DifficultySelectorCard.jsx"},{"name":"QuizIntroCard","sourcePath":"components/studyhub/QuizIntroCard.jsx"},{"name":"Sidebar","sourcePath":"components/studyhub/Sidebar.jsx"},{"name":"TopBar","sourcePath":"components/studyhub/TopBar.jsx"},{"name":"TopicCard","sourcePath":"components/studyhub/TopicCard.jsx"}],"sourceHashes":{"components/studyhub/_shared.js":"a67b1318c62e","components/app/CoinPill.jsx":"a0aeccf20362","components/app/ConceptCard.jsx":"80ce776546af","components/app/Ribbon.jsx":"034757456c3e","components/app/StreakCalendar.jsx":"1ed754345221","components/app/Tooltip.jsx":"6ab41410e2ef","components/app/TutorFAB.jsx":"c7f4238abcf6","components/graphs/graphTheme.jsx":"ed1194428885","components/studyhub/CourseCard.jsx":"75dbbf38cc3a","components/studyhub/DifficultySelectorCard.jsx":"b948155cde7d","components/studyhub/QuizIntroCard.jsx":"989bf76633c1","components/studyhub/Sidebar.jsx":"37aff418e1c4","components/studyhub/TopBar.jsx":"760720a511f4","components/studyhub/TopicCard.jsx":"0888f736bd38"},"inlinedExternals":[],"unexposedExports":["components/graphs/graphTheme.jsx:graphTitleStyle","components/graphs/graphTheme.jsx:graphSubtitleStyle"]} */

(() => {

const __ds_ns = (window.WaffleStackDesignSystem_a43b54 = window.WaffleStackDesignSystem_a43b54 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/studyhub/_shared.js (shared scope)
const PAGE_BG = "var(--sh-page-bg)";
const SIDEBAR_BG = "var(--sh-sidebar-bg)";
const SIDEBAR_ACTIVE = "var(--sh-sidebar-active)";
const GLASS_CARD = "var(--sh-glass-card)";
const GLASS_CARD_SM = "var(--sh-glass-card-sm)";
const CARD_SHADOW = "var(--sh-card-shadow)";
const CARD_RADIUS = 24;
const BUTTON_COLOR = "var(--sh-btn-color)";
const TEXT_DARK = "var(--sh-text-dark)";
const TEXT_MED = "var(--sh-text-med)";
const TEXT_LIGHT = "var(--sh-text-light)";
const TEXT_TIP = "var(--sh-text-tip)";

__ds_ns.PAGE_BG = PAGE_BG;
__ds_ns.SIDEBAR_BG = SIDEBAR_BG;
__ds_ns.SIDEBAR_ACTIVE = SIDEBAR_ACTIVE;
__ds_ns.GLASS_CARD = GLASS_CARD;
__ds_ns.GLASS_CARD_SM = GLASS_CARD_SM;
__ds_ns.CARD_SHADOW = CARD_SHADOW;
__ds_ns.CARD_RADIUS = CARD_RADIUS;
__ds_ns.BUTTON_COLOR = BUTTON_COLOR;
__ds_ns.TEXT_DARK = TEXT_DARK;
__ds_ns.TEXT_MED = TEXT_MED;
__ds_ns.TEXT_LIGHT = TEXT_LIGHT;
__ds_ns.TEXT_TIP = TEXT_TIP;

// components/app/CoinPill.jsx
try { (() => {
const nf = new Intl.NumberFormat("he-IL");
function CoinGlyph({ size }) {
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      style: { display: "block", flexShrink: 0 }
    },
    /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10", fill: "var(--sh-gold)" }),
    /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "6.5", fill: "none", stroke: "rgba(0,0,0,0.28)", strokeWidth: "1.5" })
  );
}
const pillStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  minHeight: 44,
  paddingBlock: 8,
  paddingInline: 14,
  borderRadius: 999,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "var(--sh-gold)",
  fontSize: 15,
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  cursor: "pointer"
};
function CoinPill({
  surface = "economy",
  balance = 145,
  hasPass = true,
  onClick = () => {
  }
}) {
  if (!hasPass) return null;
  if (surface === "learning") {
    return /* @__PURE__ */ React.createElement("span", { role: "img", "aria-label": "\u05DE\u05D8\u05D1\u05E2\u05D5\u05EA", title: "\u05DE\u05D8\u05D1\u05E2\u05D5\u05EA", style: { display: "inline-flex" } }, /* @__PURE__ */ React.createElement(CoinGlyph, { size: 20 }));
  }
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick,
      "aria-label": `\u05DE\u05D8\u05D1\u05E2\u05D5\u05EA: ${nf.format(balance)} \u2014 \u05E4\u05EA\u05D9\u05D7\u05EA \u05D7\u05E0\u05D5\u05EA \u05D4\u05E7\u05D9\u05E9\u05D5\u05D8\u05D9\u05DD`,
      style: pillStyle
    },
    /* @__PURE__ */ React.createElement(CoinGlyph, { size: 20 }),
    /* @__PURE__ */ React.createElement("span", { style: {
      direction: "ltr"
      /* keep digit run stable inside RTL pill */
    } }, nf.format(balance))
  );
}

__ds_ns.CoinPill = CoinPill;
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/CoinPill.jsx", error: String((e && e.message) || e) }); }

// components/app/ConceptCard.jsx
try { (() => {
function ConceptCard({ concept, conceptHe, formula, realWorld, color }) {
  return /* @__PURE__ */ React.createElement("div", { style: {
    background: `linear-gradient(135deg, ${color}0d 0%, transparent 100%)`,
    border: `1px solid ${color}33`,
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: 12
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color } }, conceptHe), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "rgba(255,255,255,0.35)" } }, concept)), /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    background: "rgba(0,0,0,0.25)",
    padding: "6px 10px",
    borderRadius: 6,
    marginBottom: 8,
    letterSpacing: 0.3
  } }, formula), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 } }, "\u{1F4A1} ", realWorld));
}

__ds_ns.ConceptCard = ConceptCard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/ConceptCard.jsx", error: String((e && e.message) || e) }); }

// components/app/Ribbon.jsx
try { (() => {
function Ribbon({ label, hideLabel, children }) {
  return /* @__PURE__ */ React.createElement("div", { className: "ws-ribbon", "aria-label": label }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "row", gap: 8, alignItems: "center" } }, children), !hideLabel && /* @__PURE__ */ React.createElement("span", { className: "ws-ribbon-label" }, label));
}

__ds_ns.Ribbon = Ribbon;
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/Ribbon.jsx", error: String((e && e.message) || e) }); }

// components/app/StreakCalendar.jsx
try { (() => {
const GOLD = "#D4AF37";
const GOLD_BRIGHT = "#F5C842";
const localDate = (date = /* @__PURE__ */ new Date()) => {
  const offset = date.getTimezoneOffset() * 6e4;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};
const dateDaysAgo = (daysAgo) => {
  const date = /* @__PURE__ */ new Date();
  date.setDate(date.getDate() - daysAgo);
  return localDate(date);
};
const StreakCalendar = ({ streak = 12 }) => {
  const days = React.useMemo(() => Array.from({ length: 28 }, (_, index) => dateDaysAgo(27 - index)), []);
  const filledDates = React.useMemo(() => {
    const filled = /* @__PURE__ */ new Set();
    for (let i = 0; i < Math.min(streak, 28); i += 1) {
      filled.add(dateDaysAgo(i));
    }
    return filled;
  }, [streak]);
  const today = localDate();
  return /* @__PURE__ */ React.createElement(
    "section",
    {
      dir: "rtl",
      "aria-label": "\u05DC\u05D5\u05D7 \u05E8\u05E6\u05E3 \u05DC\u05DE\u05D9\u05D3\u05D4",
      style: {
        background: "var(--sh-glass-card)",
        backdropFilter: "blur(20px)",
        boxShadow: "var(--sh-card-shadow)",
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.5)",
        padding: "22px 22px 18px",
        display: "flex",
        flexDirection: "column"
      }
    },
    /* @__PURE__ */ React.createElement("style", null, `
          @keyframes wsPulseGold {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212,175,55,0.45); }
            50% { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(212,175,55,0); }
          }
        `),
    /* @__PURE__ */ React.createElement("h2", { style: {
      margin: "0 0 14px",
      fontFamily: "'Rubik', sans-serif",
      fontSize: 18,
      fontWeight: 700,
      color: "var(--sh-text-dark)"
    } }, "\u{1F525} ", streak, " \u05D9\u05DE\u05D9\u05DD \u05D1\u05E8\u05E6\u05E3"),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 6
        }
      },
      days.map((day) => {
        const isFilled = filledDates.has(day);
        const isToday = day === today;
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            key: day,
            title: day,
            "aria-label": `${day}${isFilled ? " \u05D4\u05D5\u05E9\u05DC\u05DD" : " \u05DC\u05D0 \u05D4\u05D5\u05E9\u05DC\u05DD"}`,
            style: {
              aspectRatio: "1 / 1",
              borderRadius: 6,
              background: isFilled ? `linear-gradient(135deg, ${GOLD_BRIGHT}, ${GOLD})` : "rgba(31,62,108,0.06)",
              border: isToday ? `2px solid ${GOLD}` : "1px solid rgba(31,62,108,0.10)",
              animation: isToday ? "wsPulseGold 1.6s ease-in-out infinite" : void 0
            }
          }
        );
      })
    )
  );
};

__ds_ns.StreakCalendar = StreakCalendar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/StreakCalendar.jsx", error: String((e && e.message) || e) }); }

// components/app/Tooltip.jsx
try { (() => {
function mergeRefs(...refs) {
  return (el) => {
    refs.forEach((r) => {
      if (typeof r === "function") r(el);
      else if (r && "current" in r) r.current = el;
    });
  };
}
function Tooltip({ label, description, placement = "bottom", delay = 400, children }) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });
  const timerRef = React.useRef(null);
  const childRef = React.useRef(null);
  const idRef = React.useRef(`ws-tt-${Math.random().toString(36).slice(2)}`);
  const isTouch = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  };
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") hide();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);
  React.useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);
  if (isTouch) return children;
  const computeCoords = () => {
    if (!childRef.current) return;
    const r = childRef.current.getBoundingClientRect();
    const GAP = 8;
    switch (placement) {
      case "top":
        setCoords({ top: r.top - GAP, left: r.left + r.width / 2 });
        break;
      case "bottom":
        setCoords({ top: r.bottom + GAP, left: r.left + r.width / 2 });
        break;
      case "left":
        setCoords({ top: r.top + r.height / 2, left: r.left - GAP });
        break;
      case "right":
        setCoords({ top: r.top + r.height / 2, left: r.right + GAP });
        break;
    }
  };
  const show = () => {
    computeCoords();
    timerRef.current = setTimeout(() => setOpen(true), delay);
  };
  const getTooltipStyle = () => {
    switch (placement) {
      case "top":
        return { top: coords.top, left: coords.left, transform: "translateX(-50%) translateY(-100%)" };
      case "bottom":
        return { top: coords.top, left: coords.left, transform: "translateX(-50%)" };
      case "left":
        return { top: coords.top, left: coords.left, transform: "translateX(-100%) translateY(-50%)" };
      case "right":
        return { top: coords.top, left: coords.left, transform: "translateY(-50%)" };
    }
  };
  const origRef = children.ref;
  const child = React.cloneElement(children, {
    ref: mergeRefs(childRef, ...origRef ? [origRef] : []),
    "aria-describedby": open ? idRef.current : void 0,
    onMouseEnter: (e) => {
      show();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e) => {
      hide();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e) => {
      show();
      children.props.onFocus?.(e);
    },
    onBlur: (e) => {
      hide();
      children.props.onBlur?.(e);
    }
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, child, open && /* @__PURE__ */ React.createElement("div", { id: idRef.current, role: "tooltip", className: "ws-tooltip", style: getTooltipStyle() }, label, description && /* @__PURE__ */ React.createElement("div", { className: "ws-tooltip-desc" }, description)));
}

__ds_ns.Tooltip = Tooltip;
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/app/TutorFAB.jsx
try { (() => {
const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPod|iPad/i.test(navigator.platform || navigator.userAgent || "");
const SHORTCUT_LABEL = IS_MAC ? "Cmd+K" : "Ctrl+K";
function TutorFAB({
  onClick = () => {
  },
  kbOpen = false,
  bottom = 20,
  left = 20
}) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick,
      "aria-label": `\u05E9\u05D0\u05DC/\u05D9 \u05D0\u05EA \u05D5\u05D5\u05E4\u05DC (${SHORTCUT_LABEL})`,
      title: `\u05E9\u05D0\u05DC/\u05D9 \u05D0\u05EA \u05D5\u05D5\u05E4\u05DC \xB7 ${SHORTCUT_LABEL}`,
      style: {
        position: "fixed",
        bottom,
        left,
        // z-index 230: FAB band (tutor-fab slot, per uiStacks z-index discipline).
        zIndex: 230,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #FBBF24, #F97316)",
        color: "#fff",
        border: "2px solid rgba(255,255,255,0.3)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        minWidth: 44,
        minHeight: 44,
        // 200ms fade-out when keyboard opens; restore on close.
        opacity: kbOpen ? 0 : 1,
        pointerEvents: kbOpen ? "none" : "auto",
        transition: "opacity 200ms ease, transform 150ms ease",
        transform: "scale(1)"
      }
    },
    /* @__PURE__ */ React.createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: 26,
        height: 26,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round"
      },
      /* @__PURE__ */ React.createElement("path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" })
    ),
    /* @__PURE__ */ React.createElement(
      "span",
      {
        "aria-hidden": "true",
        style: {
          position: "absolute",
          top: -4,
          right: -4,
          fontSize: 10,
          background: "#fff",
          color: "#EA580C",
          borderRadius: 999,
          padding: "2px 6px",
          fontWeight: 700,
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
        }
      },
      "\u{1F9C7}"
    )
  );
}

__ds_ns.TutorFAB = TutorFAB;
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/app/TutorFAB.jsx", error: String((e && e.message) || e) }); }

// components/graphs/graphTheme.jsx
try { (() => {
const GRAPH_FONT = "'Playpen Sans Hebrew', 'Assistant', sans-serif";
const GC = {
  ink: "#1F3E6C",
  // navy — headings, axis text, data point fill
  gold: "#D4AF37",
  // primary data mark (curve, bars, highlight)
  goldFill: "rgba(212,175,55,0.28)",
  // shaded area under a curve
  goldText: "#9A7B1F",
  // gold-on-light readable label
  blue: "#4E71DA",
  // interactive accents (guides, slider fill, hints)
  axis: "rgba(31,62,108,0.45)",
  axisText: "rgba(31,62,108,0.6)",
  good: "#1f7a6d",
  // semantic positive (result / coverage)
  warn: "#b33a3a"
  // semantic negative (miss / error) — only legitimate red
};
const graphCardStyle = {
  background: "var(--sh-q-card-bg, #FCFDFF)",
  borderRadius: 16,
  padding: 20,
  margin: "24px auto",
  maxWidth: 700,
  color: "var(--sh-text-dark)",
  border: "1px solid rgba(127,155,217,0.22)",
  boxShadow: "0 6px 24px rgba(31,62,108,0.08)",
  fontFamily: GRAPH_FONT
};
const graphTitleStyle = {
  fontFamily: GRAPH_FONT,
  fontSize: 20,
  fontWeight: 700,
  margin: "0 0 4px",
  color: GC.ink
};
const graphSubtitleStyle = {
  fontFamily: GRAPH_FONT,
  fontSize: 14,
  opacity: 0.8,
  margin: "0 0 12px"
};
function GraphFrame({ title, subtitle, children, style }) {
  return /* @__PURE__ */ React.createElement("div", { dir: "rtl", style: { ...graphCardStyle, ...style } }, /* @__PURE__ */ React.createElement("h3", { style: graphTitleStyle }, title), subtitle && /* @__PURE__ */ React.createElement("p", { style: graphSubtitleStyle }, subtitle), children);
}
function GraphSlider({ label, value, min, max, step = 1, onChange, suffix }) {
  return /* @__PURE__ */ React.createElement("label", { style: { fontFamily: GRAPH_FONT, fontSize: 14, fontWeight: 600, display: "block" } }, label, ": ", value, suffix ?? "", /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min,
      max,
      step,
      value,
      onChange: (e) => onChange(+e.target.value),
      className: "ws-graph-range",
      style: { width: "100%", accentColor: GC.blue }
    }
  ));
}
function GraphSliderRow({ children }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 4, fontFamily: GRAPH_FONT } }, children);
}

__ds_ns.GRAPH_FONT = GRAPH_FONT;
__ds_ns.GC = GC;
__ds_ns.graphCardStyle = graphCardStyle;
__ds_ns.GraphFrame = GraphFrame;
__ds_ns.GraphSlider = GraphSlider;
__ds_ns.GraphSliderRow = GraphSliderRow;
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/graphs/graphTheme.jsx", error: String((e && e.message) || e) }); }

// components/studyhub/CourseCard.jsx
try { (() => {
const COURSES = [
  { id: "stat-a", label: "\u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9\u05E7\u05D4 \u05D0'", icon: "\u{1F4CA}", desc: "\u05DE\u05D1\u05D5\u05D0, \u05DE\u05D3\u05D3\u05D9\u05DD, \u05D4\u05EA\u05E4\u05DC\u05D2\u05D5\u05D9\u05D5\u05EA, \u05E8\u05D2\u05E8\u05E1\u05D9\u05D4, \u05D4\u05E1\u05EA\u05D1\u05E8\u05D5\u05EA", active: true, bg: "linear-gradient(135deg,#F5C842,#D4AF37)" },
  { id: "stat-b", label: "\u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9\u05E7\u05D4 \u05D1'", icon: "\u{1F4C8}", desc: "\u05D3\u05D2\u05D9\u05DE\u05D4, \u05D0\u05DE\u05D9\u05D3\u05D4, \u05E8\u05D5\u05D5\u05D7\u05D9 \u05E1\u05DE\u05DA, \u05D1\u05D3\u05D9\u05E7\u05EA \u05D4\u05E9\u05E2\u05E8\u05D5\u05EA, \u05D0-\u05E4\u05E8\u05DE\u05D8\u05E8\u05D9\u05D9\u05DD, \u05E8\u05D2\u05E8\u05E1\u05D9\u05D4", active: true, bg: "linear-gradient(135deg,#7CB7F8,#4A90E2)" },
  { id: "methods", label: "\u05E9\u05D9\u05D8\u05D5\u05EA \u05DE\u05D7\u05E7\u05E8", icon: "\u{1F52C}", desc: "\u05EA\u05DB\u05E0\u05D5\u05DF \u05DE\u05D7\u05E7\u05E8, \u05DE\u05D3\u05D9\u05D3\u05D4, \u05DE\u05D4\u05D9\u05DE\u05E0\u05D5\u05EA \u05D5\u05EA\u05E7\u05E4\u05D5\u05EA", active: false, bg: "linear-gradient(135deg,#A78BFA,#7C3AED)" },
  { id: "anova", label: "\u05E0\u05D9\u05EA\u05D5\u05D7 \u05E9\u05D5\u05E0\u05D5\u05EA \u05D5\u05E8\u05D2\u05E8\u05E1\u05D9\u05D4", icon: "\u{1F4D0}", desc: "\u05E8\u05D2\u05E8\u05E1\u05D9\u05D4 \u05DE\u05E8\u05D5\u05D1\u05D4, \u05DE\u05E9\u05EA\u05E0\u05D9 \u05D3\u05DE\u05D9, ANOVA \u05D7\u05D3-\u05DB\u05D9\u05D5\u05D5\u05E0\u05D9, \u05D4\u05E9\u05D5\u05D5\u05D0\u05D5\u05EA \u05DE\u05E8\u05D5\u05D1\u05D5\u05EA \u05D5\u05D1\u05DC\u05D5\u05E7\u05D9\u05DD", active: true, bg: "linear-gradient(135deg,#67C29E,#229E69)" },
  { id: "sql", label: "SQL \u2014 \u05E9\u05E4\u05EA \u05DE\u05E1\u05D3\u05D9 \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD", icon: "\u{1F5C4}\uFE0F", desc: "\u05E9\u05D0\u05D9\u05DC\u05EA\u05D5\u05EA, JOIN, \u05D0\u05D9\u05E0\u05D3\u05E7\u05E1\u05D9\u05DD \u05D5\u05E4\u05D5\u05E0\u05E7\u05E6\u05D9\u05D5\u05EA \u05D7\u05DC\u05D5\u05DF \u2014 \u05D1\u05DE\u05D8\u05D0\u05E4\u05D5\u05E8\u05EA \u05DE\u05D7\u05E1\u05DF, \u05E2\u05DD \u05E1\u05D9\u05DE\u05D5\u05DC\u05D8\u05D5\u05E8\u05D9\u05DD \u05D5\u05D7\u05D9\u05D3\u05D5\u05E0\u05D9\u05DD", active: true, bg: "linear-gradient(135deg,#F0B429,#C97C18)" }
];
function CourseIcon({ id, size = 30 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };
  switch (id) {
    case "stat-a":
      return /* @__PURE__ */ React.createElement("svg", { ...common }, /* @__PURE__ */ React.createElement("path", { d: "M3 20h18" }), /* @__PURE__ */ React.createElement("path", { d: "M5.5 20v-5h3.2v5" }), /* @__PURE__ */ React.createElement("path", { d: "M10.4 20v-9h3.2v9" }), /* @__PURE__ */ React.createElement("path", { d: "M15.3 20v-6.5h3.2v6.5" }), /* @__PURE__ */ React.createElement("path", { d: "M3.5 15.5C7 14.5 8.5 4.5 12 4.5s5 10 8.5 11" }));
    case "stat-b":
      return /* @__PURE__ */ React.createElement("svg", { ...common }, /* @__PURE__ */ React.createElement("path", { d: "M3 16.5c3.6 0 4.8-11 9-11s5.4 11 9 11" }), /* @__PURE__ */ React.createElement("path", { d: "M12 6.5v10", strokeDasharray: "0.5 3" }), /* @__PURE__ */ React.createElement("path", { d: "M6.5 21h11" }), /* @__PURE__ */ React.createElement("path", { d: "M6.5 19.3v3.4" }), /* @__PURE__ */ React.createElement("path", { d: "M17.5 19.3v3.4" }));
    case "methods":
      return /* @__PURE__ */ React.createElement("svg", { ...common }, /* @__PURE__ */ React.createElement("path", { d: "M6 3.5h9a1.5 1.5 0 0 1 1.5 1.5v4.5" }), /* @__PURE__ */ React.createElement("path", { d: "M6 3.5A1.5 1.5 0 0 0 4.5 5v12A1.5 1.5 0 0 0 6 18.5h4" }), /* @__PURE__ */ React.createElement("path", { d: "M7.5 8h6" }), /* @__PURE__ */ React.createElement("path", { d: "M7.5 11.5h4" }), /* @__PURE__ */ React.createElement("circle", { cx: "15.5", cy: "15.5", r: "4" }), /* @__PURE__ */ React.createElement("path", { d: "M18.5 18.5l3 3" }));
    case "anova":
      return /* @__PURE__ */ React.createElement("svg", { ...common }, /* @__PURE__ */ React.createElement("path", { d: "M4 4.5V20h16" }), /* @__PURE__ */ React.createElement("circle", { cx: "8", cy: "11.4", r: "0.9", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "8", cy: "13.8", r: "0.9", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "8", cy: "16.2", r: "0.9", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "12.8", cy: "10.5", r: "0.9", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "12.8", cy: "12.9", r: "0.9", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "12.8", cy: "15.3", r: "0.9", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "17.6", cy: "5.6", r: "0.9", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "17.6", cy: "8", r: "0.9", fill: "currentColor", stroke: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "17.6", cy: "10.4", r: "0.9", fill: "currentColor", stroke: "none" }));
    case "sql":
      return /* @__PURE__ */ React.createElement("svg", { ...common }, /* @__PURE__ */ React.createElement("ellipse", { cx: "12", cy: "5.5", rx: "7", ry: "2.6" }), /* @__PURE__ */ React.createElement("path", { d: "M5 5.5v13c0 1.45 3.15 2.6 7 2.6s7-1.15 7-2.6v-13" }), /* @__PURE__ */ React.createElement("path", { d: "M5 10c0 1.45 3.15 2.6 7 2.6s7-1.15 7-2.6" }), /* @__PURE__ */ React.createElement("path", { d: "M5 14.4c0 1.45 3.15 2.6 7 2.6s7-1.15 7-2.6" }));
    default:
      return null;
  }
}
function CourseCard({ course = COURSES[0], onSelect = () => {
} }) {
  const c = course;
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      key: c.id,
      onClick: () => onSelect(c),
      className: "ws-glass-card",
      style: {
        borderRadius: 22,
        padding: "28px 24px",
        cursor: "pointer",
        textAlign: "right",
        fontFamily: "'Rubik', sans-serif",
        direction: "rtl"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      width: 56,
      height: 56,
      borderRadius: 14,
      background: "var(--sh-sidebar-bg)",
      border: "1px solid rgba(255,255,255,0.25)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14
    } }, /* @__PURE__ */ React.createElement(CourseIcon, { id: c.id, size: 30 })),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 19, fontWeight: 700, color: TEXT_DARK, marginBottom: 4 } }, c.label),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: TEXT_MED, lineHeight: 1.45 } }, c.desc),
    !c.active && // Pin moved from insetInlineStart (right edge in RTL — collided
    // with the centered course icon) to insetInlineEnd (left edge
    // in RTL) per user feedback 2026-05-24. Convention §23.
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: 14,
      insetInlineEnd: 14,
      background: "rgba(127,155,217,0.18)",
      color: "#1f3e6c",
      border: "1px solid rgba(127,155,217,0.45)",
      borderRadius: 999,
      padding: "3px 10px",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.2
    } }, "\u05D1\u05E7\u05E8\u05D5\u05D1")
  );
}

__ds_ns.COURSES = COURSES;
__ds_ns.CourseIcon = CourseIcon;
__ds_ns.CourseCard = CourseCard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/studyhub/CourseCard.jsx", error: String((e && e.message) || e) }); }

// components/studyhub/DifficultySelectorCard.jsx
try { (() => {
function DifficultySelectorCard({ label, count, icon, color, bg, selected, onClick, disabled }) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick,
      disabled,
      style: {
        background: selected ? color : bg,
        border: `2px solid ${selected ? color : color + "40"}`,
        color: selected ? "#fff" : color,
        borderRadius: 14,
        padding: "10px 6px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        fontFamily: "'Rubik', sans-serif",
        transition: "all 0.18s ease",
        boxShadow: selected ? `0 6px 18px ${color}60` : "none",
        transform: selected ? "translateY(-2px)" : "translateY(0)"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18 } }, icon),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 600 } }, label),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 800 } }, count)
  );
}

__ds_ns.DifficultySelectorCard = DifficultySelectorCard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/studyhub/DifficultySelectorCard.jsx", error: String((e && e.message) || e) }); }

// components/studyhub/QuizIntroCard.jsx
try { (() => {
const { DifficultySelectorCard } = window.WaffleStackDesignSystem_a43b54;
function QuizIntroCard({
  // [ds-extract] replaced HEBREW_LABELS[topicId] || quizBankData.topics[topicId]?.concept lookup with topicName prop — visual output unchanged
  topicName = "\u05DE\u05DE\u05D5\u05E6\u05E2",
  // [ds-extract] replaced counts derived from quizBankData.topics[topicId].questions difficulty filter with counts prop — visual output unchanged
  counts = { all: 24, easy: 9, medium: 10, hard: 5 },
  // [ds-extract] replaced LESSON_CONTENT/_STAT_B/_SQL/_ANOVA .some(t => t.id === topicId) with hasLesson prop — visual output unchanged
  hasLesson = true,
  onStart = () => {
  },
  onBack = () => {
  },
  onReadLesson = () => {
  }
}) {
  const [selected, setSelected] = React.useState("all");
  return /* @__PURE__ */ React.createElement("div", { dir: "rtl", style: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    fontFamily: "'Rubik', 'Assistant', sans-serif"
  } }, /* @__PURE__ */ React.createElement("div", { className: "ws-quiz-intro", style: {
    width: "100%",
    maxWidth: 540,
    background: GLASS_CARD,
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    boxShadow: CARD_SHADOW,
    border: "1px solid rgba(255,255,255,0.5)",
    padding: 36,
    textAlign: "center"
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 56, marginBottom: 12 } }, "\u{1F4DD}"), /* @__PURE__ */ React.createElement("h2", { className: "ws-h2", style: { fontSize: 26, fontWeight: 700, color: TEXT_DARK, margin: "0 0 6px" } }, "\u05EA\u05E8\u05D2\u05D5\u05DC: ", topicName), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: TEXT_LIGHT, marginBottom: 22 } }, "\u05D1\u05D7\u05E8/\u05D9 \u05E8\u05DE\u05EA \u05E7\u05D5\u05E9\u05D9. \u05DE\u05E7\u05DC \u05DC\u05DE\u05D0\u05EA\u05D2\u05E8."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 } }, /* @__PURE__ */ React.createElement(
    DifficultySelectorCard,
    {
      label: "\u05D4\u05DB\u05DC",
      count: counts.all,
      icon: "\u{1F3AF}",
      color: "#6366f1",
      bg: "rgba(99,102,241,0.12)",
      selected: selected === "all",
      onClick: () => setSelected("all")
    }
  ), /* @__PURE__ */ React.createElement(
    DifficultySelectorCard,
    {
      label: "\u05E7\u05DC",
      count: counts.easy,
      icon: "\u{1F331}",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      selected: selected === "easy",
      onClick: () => setSelected("easy"),
      disabled: counts.easy === 0
    }
  ), /* @__PURE__ */ React.createElement(
    DifficultySelectorCard,
    {
      label: "\u05D1\u05D9\u05E0\u05D5\u05E0\u05D9",
      count: counts.medium,
      icon: "\u26A1",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
      selected: selected === "medium",
      onClick: () => setSelected("medium"),
      disabled: counts.medium === 0
    }
  ), /* @__PURE__ */ React.createElement(
    DifficultySelectorCard,
    {
      label: "\u05DE\u05D0\u05EA\u05D2\u05E8",
      count: counts.hard,
      icon: "\u{1F525}",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.12)",
      selected: selected === "hard",
      onClick: () => setSelected("hard"),
      disabled: counts.hard === 0
    }
  )), /* @__PURE__ */ React.createElement("div", { style: {
    background: "rgba(99,102,241,0.06)",
    border: "1px solid rgba(99,102,241,0.18)",
    borderRadius: 14,
    padding: "14px 18px",
    fontSize: 14,
    color: TEXT_MED,
    lineHeight: 1.7,
    marginBottom: 28,
    textAlign: "right"
  } }, "\u{1F3AF} \u05D4\u05EA\u05E9\u05D5\u05D1\u05D4 \u05EA\u05D9\u05D1\u05D3\u05E7 \u05D0\u05D5\u05D8\u05D5\u05DE\u05D8\u05D9\u05EA. \u05EA\u05E7\u05D1\u05DC \u05E4\u05D9\u05D3\u05D1\u05E7 \u05DE\u05D9\u05D9\u05D3\u05D9, \u05D4\u05E1\u05D1\u05E8 \u05E2\u05DC \u05DB\u05DC \u05E9\u05D0\u05DC\u05D4, \u05D5-XP \u05E2\u05DC \u05DB\u05DC \u05EA\u05E9\u05D5\u05D1\u05D4 \u05E0\u05DB\u05D5\u05E0\u05D4."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => onStart(selected), disabled: counts[selected] === 0, style: {
    background: BUTTON_COLOR,
    color: "#fff",
    border: "none",
    borderRadius: 24,
    padding: "12px 28px",
    fontWeight: 700,
    fontSize: 16,
    cursor: counts[selected] === 0 ? "not-allowed" : "pointer",
    opacity: counts[selected] === 0 ? 0.4 : 1,
    fontFamily: "'Rubik', sans-serif",
    boxShadow: "0 4px 14px rgba(99,102,241,0.4)"
  } }, "\u05D4\u05EA\u05D7\u05DC \u05EA\u05E8\u05D2\u05D5\u05DC (", counts[selected], " \u05E9\u05D0\u05DC\u05D5\u05EA) \u2190"), hasLesson && /* @__PURE__ */ React.createElement("button", { "data-tour": "theory-btn", onClick: onReadLesson, style: {
    background: "rgba(255,255,255,0.6)",
    color: TEXT_DARK,
    border: "1px solid rgba(127,155,217,0.4)",
    borderRadius: 24,
    padding: "12px 22px",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    fontFamily: "'Rubik', sans-serif"
  } }, "\u{1F4DA} \u05E7\u05E8\u05D0 \u05EA\u05D9\u05D0\u05D5\u05E8\u05D9\u05D4"), /* @__PURE__ */ React.createElement("button", { onClick: onBack, style: {
    background: "transparent",
    color: TEXT_LIGHT,
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    padding: "12px 16px",
    fontFamily: "'Rubik', sans-serif"
  } }, "\u2192 \u05D7\u05D6\u05E8\u05D4"))));
}

__ds_ns.QuizIntroCard = QuizIntroCard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/studyhub/QuizIntroCard.jsx", error: String((e && e.message) || e) }); }

// components/studyhub/Sidebar.jsx
try { (() => {
const NAV_ITEMS = [
  { id: "home", label: "\u05D3\u05E3 \u05D4\u05D1\u05D9\u05EA", iconKey: "home" },
  { id: "courses", label: "\u05D0\u05D6\u05D5\u05E8 \u05DC\u05DE\u05D9\u05D3\u05D4", iconKey: "book" },
  { id: "arsenal", label: "\u05D4\u05D0\u05E8\u05E1\u05E0\u05DC \u05E9\u05DC\u05D9", iconKey: "trophy", feature: "arsenal" },
  // 'מפת הלמידה שלי' removed as a separate destination — the concept map now
  // lives only inside אזור למידה (the 🗺️ מפה tab). Per user 2026-06-09.
  { id: null, label: "\u05D4\u05E2\u05D5\u05DC\u05DD \u05E9\u05DC\u05D9", iconKey: "globe", action: "world" },
  { id: null, label: "\u05E1\u05D9\u05D5\u05E8\u05D9\u05DD \u05DE\u05D5\u05D3\u05E8\u05DB\u05D9\u05DD", iconKey: "tour", action: "tours" }
];
function renderIcon(k) {
  const stroke = "currentColor";
  const sw = 1.8;
  const lc = "round";
  const lj = "round";
  switch (k) {
    case "home":
      return /* @__PURE__ */ React.createElement("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: sw, strokeLinecap: lc, strokeLinejoin: lj }, /* @__PURE__ */ React.createElement("path", { d: "M3 11.5L12 4l9 7.5" }), /* @__PURE__ */ React.createElement("path", { d: "M5 10v10h14V10" }), /* @__PURE__ */ React.createElement("path", { d: "M10 20v-6h4v6" }));
    case "book":
      return /* @__PURE__ */ React.createElement("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: sw, strokeLinecap: lc, strokeLinejoin: lj }, /* @__PURE__ */ React.createElement("path", { d: "M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z" }), /* @__PURE__ */ React.createElement("path", { d: "M4 17a3 3 0 0 1 3-3h11" }));
    case "trophy":
      return /* @__PURE__ */ React.createElement("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: sw, strokeLinecap: lc, strokeLinejoin: lj }, /* @__PURE__ */ React.createElement("path", { d: "M7 4h10v5a5 5 0 0 1-10 0z" }), /* @__PURE__ */ React.createElement("path", { d: "M5 6H3v2a3 3 0 0 0 3 3" }), /* @__PURE__ */ React.createElement("path", { d: "M19 6h2v2a3 3 0 0 1-3 3" }), /* @__PURE__ */ React.createElement("path", { d: "M9 19h6" }), /* @__PURE__ */ React.createElement("path", { d: "M12 14v5" }));
    case "map":
      return /* @__PURE__ */ React.createElement("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: sw, strokeLinecap: lc, strokeLinejoin: lj }, /* @__PURE__ */ React.createElement("path", { d: "M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" }), /* @__PURE__ */ React.createElement("path", { d: "M9 4v16" }), /* @__PURE__ */ React.createElement("path", { d: "M15 6v16" }));
    case "globe":
      return /* @__PURE__ */ React.createElement("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: sw, strokeLinecap: lc, strokeLinejoin: lj }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ React.createElement("path", { d: "M3 12h18" }), /* @__PURE__ */ React.createElement("path", { d: "M12 3a13 13 0 0 1 0 18" }), /* @__PURE__ */ React.createElement("path", { d: "M12 3a13 13 0 0 0 0 18" }));
    case "tour":
      return /* @__PURE__ */ React.createElement("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: sw, strokeLinecap: lc, strokeLinejoin: lj }, /* @__PURE__ */ React.createElement("path", { d: "M5 21V4" }), /* @__PURE__ */ React.createElement("path", { d: "M5 4l9 3-9 3" }), /* @__PURE__ */ React.createElement("path", { d: "M5 13l11 3-11 3", opacity: "0.55" }));
    default:
      return null;
  }
}
function AdminToggle({ collapsed }) {
  const [adminMode, setAdminMode] = React.useState(false);
  const toggle = () => setAdminMode((v) => !v);
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: toggle,
      "aria-pressed": adminMode,
      title: adminMode ? "\u05D0\u05D3\u05DE\u05D9\u05DF: \u05E4\u05EA\u05D5\u05D7 \u2014 \u05DC\u05D7\u05E5 \u05DC\u05DB\u05D9\u05D1\u05D5\u05D9" : "\u05D0\u05D3\u05DE\u05D9\u05DF: \u05E1\u05D2\u05D5\u05E8 \u2014 \u05DC\u05D7\u05E5 \u05DC\u05E4\u05EA\u05D9\u05D7\u05EA \u05D4\u05DB\u05DC",
      style: {
        marginTop: "auto",
        alignSelf: "stretch",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: 10,
        padding: collapsed ? "8px" : "8px 12px",
        background: adminMode ? "rgba(245,200,66,0.18)" : "rgba(255,255,255,0.06)",
        border: "1px solid " + (adminMode ? "rgba(245,200,66,0.55)" : "rgba(255,255,255,0.18)"),
        color: adminMode ? "#FFD700" : "rgba(255,255,255,0.85)",
        borderRadius: 10,
        cursor: "pointer",
        fontFamily: "'Rubik', sans-serif",
        fontSize: 12,
        fontWeight: 700,
        direction: "rtl",
        transition: "all 0.15s"
      }
    },
    /* @__PURE__ */ React.createElement("span", { style: {
      width: 24,
      height: 24,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: adminMode ? "#FFD700" : "transparent",
      color: adminMode ? "#0B1B3E" : "currentColor",
      border: "1px solid currentColor",
      borderRadius: 6,
      fontSize: 14,
      flexShrink: 0
    } }, adminMode ? "\u{1F513}" : "\u{1F512}"),
    !collapsed && /* @__PURE__ */ React.createElement("span", { style: { whiteSpace: "nowrap" } }, adminMode ? "\u05D0\u05D3\u05DE\u05D9\u05DF \u05E4\u05E2\u05D9\u05DC" : "\u05DE\u05E6\u05D1 \u05D0\u05D3\u05DE\u05D9\u05DF")
  );
}
function Sidebar({ activeItem = "home", onNavigate = () => {
}, lockedFeatures = [], lockTips = {} }) {
  const isLocked = (f) => !!f && lockedFeatures.includes(f);
  const collapsed = false;
  return /* @__PURE__ */ React.createElement("div", { style: {
    background: SIDEBAR_BG,
    width: 247,
    // [ds-extract] replaced width:'100%' inside the app's resizable <nav width={sidebarWidth}> wrapper with the fixed 247px default — visual output unchanged
    flexShrink: 0,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-4px 0 24px rgba(51,81,202,0.25)",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", padding: "28px 0 20px", borderBottom: "1px solid rgba(255,255,255,0.15)" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: 64,
    height: 64,
    background: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.15))",
    backdropFilter: "blur(10px)",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(31,41,55,0.2)",
    border: "1px solid rgba(255,255,255,0.3)"
  } }, /* @__PURE__ */ React.createElement("svg", { width: "36", height: "36", viewBox: "0 0 36 36", fill: "none" }, /* @__PURE__ */ React.createElement("polygon", { points: "18,4 30,14 18,32 6,14", fill: "none", stroke: "rgba(255,255,255,0.9)", strokeWidth: "1.8" }), /* @__PURE__ */ React.createElement("polygon", { points: "18,4 30,14 18,17 6,14", fill: "rgba(255,255,255,0.3)" }), /* @__PURE__ */ React.createElement("line", { x1: "6", y1: "14", x2: "30", y2: "14", stroke: "rgba(255,255,255,0.6)", strokeWidth: "1.2" })))), /* @__PURE__ */ React.createElement("nav", { style: { flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 } }, NAV_ITEMS.map((item, i) => {
    const isActive = item.id !== null && item.id === activeItem;
    const locked = isLocked(item.feature);
    const lockTip = locked && item.feature ? lockTips[item.feature] : void 0;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        disabled: locked,
        onClick: () => {
          if (locked) return;
          onNavigate(item.action != null ? item.action : item.id);
        },
        title: locked ? lockTip : collapsed ? item.label : void 0,
        style: {
          background: isActive ? SIDEBAR_ACTIVE : "transparent",
          borderRadius: 32,
          padding: collapsed ? "12px 0" : "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 12,
          direction: "rtl",
          border: "none",
          cursor: locked ? "not-allowed" : "pointer",
          width: "100%",
          fontFamily: "'Rubik', sans-serif",
          fontSize: 17,
          fontWeight: isActive ? 600 : 400,
          color: "#FFFFFF",
          opacity: locked ? 0.5 : 1,
          filter: locked ? "grayscale(0.7)" : "none",
          transition: "background 0.15s",
          position: "relative"
        },
        onMouseEnter: (e) => {
          if (!isActive && !locked) e.currentTarget.style.background = "rgba(255,255,255,0.12)";
        },
        onMouseLeave: (e) => {
          if (!isActive && !locked) e.currentTarget.style.background = "transparent";
        }
      },
      /* @__PURE__ */ React.createElement(
        "span",
        {
          className: `ws-icon-chip ${isActive ? "ws-icon-chip--active" : "ws-icon-chip--inactive"}`,
          style: {
            width: 32,
            height: 32,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isActive ? "#FFD700" : "rgba(255,255,255,0.92)",
            borderRadius: 10,
            border: "1px solid",
            transition: "color 0.15s, background 0.15s, transform 0.15s",
            transform: isActive ? "scale(1.06)" : "scale(1)"
          }
        },
        renderIcon(item.iconKey)
      ),
      !collapsed && /* @__PURE__ */ React.createElement("span", { style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, item.label),
      locked && /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: {
        position: "absolute",
        top: 6,
        insetInlineEnd: 8,
        background: "linear-gradient(135deg, #1a237e, #0d1656)",
        color: "#FFD700",
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 999,
        padding: "2px 6px",
        border: "1px solid rgba(255,215,0,0.5)",
        lineHeight: 1
      } }, "\u{1F512}")
    );
  }), /* @__PURE__ */ React.createElement(AdminToggle, { collapsed }), /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", style: { position: "fixed", bottom: "var(--ws-bottom-fab-inset, 20px)", left: "var(--ws-pomodoro-left, 90px)" } })));
}

__ds_ns.Sidebar = Sidebar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/studyhub/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/studyhub/TopBar.jsx
try { (() => {
function Ribbon({ label, hideLabel, children }) {
  return /* @__PURE__ */ React.createElement("div", { className: "ws-ribbon", "aria-label": label }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "row", gap: 8, alignItems: "center" } }, children), !hideLabel && /* @__PURE__ */ React.createElement("span", { className: "ws-ribbon-label" }, label));
}
function TopBar({
  title = "\u05D3\u05E3 \u05D4\u05D1\u05D9\u05EA",
  onLogout,
  darkMode,
  onToggleDark,
  contextControls,
  // [ds-extract] replaced localStorage.getItem('userName') with userName prop — visual output unchanged
  userName = "Student",
  // [ds-extract] replaced useLearningStore(state => state.xp) (zustand) with xp prop — visual output unchanged
  xp = 0,
  // [ds-extract] replaced <PotionInventory /> (economy-store potion icons) with potionsSlot prop, default null — ribbon shell unchanged
  potionsSlot = null,
  // [ds-extract] replaced <TourLauncher /> (tutorial-store guided-tours button) with tourLauncherSlot prop, default null — ribbon shell unchanged
  tourLauncherSlot = null
}) {
  return /* @__PURE__ */ React.createElement("div", { className: "ws-topbar", style: {
    background: "var(--sh-topbar-bg)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--sh-topbar-border)",
    height: 70,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 36px",
    flexShrink: 0
  }, dir: "rtl" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, flex: "1 1 auto", minWidth: 0 } }, /* @__PURE__ */ React.createElement("h1", { style: {
    fontFamily: "'Rubik', sans-serif",
    fontWeight: 800,
    fontSize: 28,
    color: TEXT_DARK,
    margin: 0,
    letterSpacing: "-0.5px",
    textShadow: "0 1px 4px rgba(255,255,255,0.8)",
    // Shrink + ellipsize so the actions (logout etc.) never overlap the
    // title on narrow widths. Per user 2026-06-02.
    flex: "1 1 auto",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginInlineEnd: 16
  } }, title), contextControls && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 } }, contextControls)), /* @__PURE__ */ React.createElement("div", { className: "ws-topbar-actions", style: { display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }, dir: "ltr" }, onToggleDark && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onToggleDark,
      "aria-label": darkMode ? "\u05D4\u05E4\u05E2\u05DC \u05DE\u05E6\u05D1 \u05D1\u05D4\u05D9\u05E8" : "\u05D4\u05E4\u05E2\u05DC \u05DE\u05E6\u05D1 \u05DB\u05D4\u05D4",
      title: darkMode ? "\u05DE\u05E6\u05D1 \u05D1\u05D4\u05D9\u05E8" : "\u05DE\u05E6\u05D1 \u05DB\u05D4\u05D4",
      style: {
        background: "rgba(31,62,108,0.08)",
        border: "1px solid rgba(31,62,108,0.25)",
        borderRadius: 10,
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--sh-text-dark)",
        cursor: "pointer"
      }
    },
    darkMode ? "\u2600" : "\u263E"
  ), /* @__PURE__ */ React.createElement("span", { className: "ws-ribbon-divider" }), /* @__PURE__ */ React.createElement(Ribbon, { label: "\u05D4\u05EA\u05E7\u05D3\u05DE\u05D5\u05EA" }, /* @__PURE__ */ React.createElement("span", { style: {
    background: "rgba(212,175,55,0.15)",
    border: "1px solid rgba(212,175,55,0.4)",
    borderRadius: 999,
    padding: "3px 10px",
    color: "#D4AF37",
    fontSize: 13,
    fontFamily: "'Rubik', sans-serif"
  } }, "\u2B50 ", xp, " XP")), /* @__PURE__ */ React.createElement("span", { className: "ws-ribbon-divider" }), /* @__PURE__ */ React.createElement(Ribbon, { label: "\u05E9\u05D9\u05E7\u05D5\u05D9\u05D9\u05DD", hideLabel: true }, potionsSlot), /* @__PURE__ */ React.createElement("span", { className: "ws-ribbon-divider" }), /* @__PURE__ */ React.createElement(Ribbon, { label: "\u05D7\u05E9\u05D1\u05D5\u05DF", hideLabel: true }, /* @__PURE__ */ React.createElement("span", { className: "hidden md:inline", style: { fontFamily: "'Rubik', sans-serif", fontSize: 16, color: TEXT_DARK } }, "\u05E9\u05DC\u05D5\u05DD, ", userName), tourLauncherSlot, onLogout && // [ds-extract] replaced <Tooltip label="יציאה" description="התנתק מהחשבון"> wrapper (hover-only overlay, hidden at rest) with a native title attribute — visual output unchanged at rest
  /* @__PURE__ */ React.createElement("button", { onClick: onLogout, title: "\u05D9\u05E6\u05D9\u05D0\u05D4 \u2014 \u05D4\u05EA\u05E0\u05EA\u05E7 \u05DE\u05D4\u05D7\u05E9\u05D1\u05D5\u05DF", style: {
    background: "rgba(234,67,53,0.08)",
    border: "1px solid rgba(234,67,53,0.2)",
    borderRadius: 8,
    padding: "5px 12px",
    cursor: "pointer",
    color: "#d32f2f",
    fontSize: 12,
    fontFamily: "'Rubik', sans-serif",
    fontWeight: 600
  } }, "\u21A9 \u05D9\u05E6\u05D9\u05D0\u05D4"))));
}

__ds_ns.TopBar = TopBar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/studyhub/TopBar.jsx", error: String((e && e.message) || e) }); }

// components/studyhub/TopicCard.jsx
try { (() => {
function TopicCard({
  topic = { id: "mean", label: "\u05DE\u05DE\u05D5\u05E6\u05E2", building: "\u05DE\u05D3\u05D3\u05D9 \u05DE\u05E8\u05DB\u05D6", questionCount: 12 },
  // [ds-extract] replaced userProgress.topics[topic.id] (progressStore lookup) with progress prop — visual output unchanged
  progress,
  // [ds-extract] replaced hintByTopic.get(topic.id) (personal-plan map) with planHint prop — visual output unchanged
  planHint,
  onSelectTopic = () => {
  }
}) {
  const isMastered = progress?.mastered;
  const bestScore = progress?.bestScore || 0;
  const sessionsAttempted = progress?.sessionsAttempted || 0;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      key: topic.id,
      className: "ws-topic-card",
      style: {
        background: GLASS_CARD,
        backdropFilter: "blur(20px)",
        border: `2px solid ${isMastered ? "rgba(212,175,55,0.6)" : "rgba(255,255,255,0.3)"}`,
        borderRadius: CARD_RADIUS,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        textAlign: "center",
        transition: "all 0.3s",
        boxShadow: CARD_SHADOW
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(51,81,202,0.25)`;
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = CARD_SHADOW;
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32 } }, isMastered ? "\u2B50" : "\u{1F4D6}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 20, color: TEXT_DARK, textAlign: "center" } }, topic.label), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Rubik', sans-serif", fontSize: 12, color: TEXT_LIGHT, marginTop: 4, textAlign: "center" } }, topic.building))),
    planHint && /* @__PURE__ */ React.createElement("div", { style: {
      background: "linear-gradient(135deg, rgba(245,200,66,0.22), rgba(212,175,55,0.12))",
      border: "1px solid rgba(212,175,55,0.5)",
      borderRadius: 10,
      padding: "6px 10px",
      fontFamily: "'Rubik', sans-serif",
      fontSize: 12,
      color: "#8a6d1c",
      fontWeight: 600,
      textAlign: "right"
    } }, "\u{1F3AF} ", planHint),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: TEXT_MED } }, sessionsAttempted), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT } }, "\u05E1\u05E9\u05E0\u05D9\u05DD")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: bestScore > 85 ? "#34A853" : TEXT_MED } }, bestScore, "%"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT } }, "\u05E6\u05D9\u05D5\u05DF \u05D4\u05D8\u05D5\u05D1")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: "#D4AF37" } }, topic.questionCount), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Rubik', sans-serif", fontSize: 11, color: TEXT_LIGHT } }, "\u05E9\u05D0\u05DC\u05D5\u05EA"))),
    isMastered && /* @__PURE__ */ React.createElement("div", { style: {
      background: "rgba(212,175,55,0.15)",
      border: "1px solid rgba(212,175,55,0.4)",
      borderRadius: 8,
      padding: "6px 10px",
      fontFamily: "'Rubik', sans-serif",
      fontSize: 12,
      color: "#D4AF37",
      fontWeight: 600,
      textAlign: "center"
    } }, "\u2705 \u05D4\u05D5\u05E9\u05D2\u05EA \u05E9\u05DC\u05D9\u05D8\u05D4!"),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 4 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => onSelectTopic(topic.id, "lesson"),
        style: {
          flex: 1,
          background: BUTTON_COLOR,
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "10px 0",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "'Rubik', sans-serif",
          boxShadow: "0px 2px 6px rgba(51,81,202,0.35)"
        }
      },
      "\u{1F4DA} \u05EA\u05D9\u05D0\u05D5\u05E8\u05D9\u05D4"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => onSelectTopic(topic.id, "quiz"),
        style: {
          flex: 1,
          background: "rgba(255,255,255,0.7)",
          color: TEXT_DARK,
          border: "1px solid rgba(127,155,217,0.4)",
          borderRadius: 14,
          padding: "10px 0",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "'Rubik', sans-serif"
        }
      },
      "\u{1F4DD} \u05EA\u05E8\u05D2\u05D5\u05DC"
    ))
  );
}

__ds_ns.TopicCard = TopicCard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/studyhub/TopicCard.jsx", error: String((e && e.message) || e) }); }

})();
