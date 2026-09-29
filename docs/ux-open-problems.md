# Open UX problems

Not rules. Rules live in `design-rules.md` and are settled; these two are
analysed but undecided, and Shirli wants them written up properly — the menu
one is going in her portfolio. Everything here is measured, so returning to it
costs nothing.

---

## 1. The companion menu — its form contradicts its behaviour

**Where it is.** Bottom-right of the glass board, on both screens:
ללא · מפת חשיבה · הארסנל שלי · קנבס · לוח ציור.

**What the board actually carries** (practice, measured 2026-09-29, board at
28,147, 670×200):

| Control | Position | Kind |
|---|---|---|
| ⛶ מסך מלא · ⤢ צף | top-left, y=176 | acts on the board |
| frost button + slider | bottom-left, y=222 and y=288 | acts on the board |
| the five chips | bottom-right, y=279 | opens a different surface |

Nine controls on one surface, in one visual language, with nothing separating
the four that act on the board from the five that do not.

### The real defect

The picker is built as a **segmented control** — pill container, one-of-N, the
active item filled. That form carries a convention: *the same content, shown a
different way.* list/map, day/week/month. What you are looking at stays; only
its presentation changes.

This control **creates and destroys a pane**. מפת חשיבה does not re-present the
question — it splits the screen and loads a different application. ללא removes
half the screen.

So the form promises "switch a view" and the behaviour delivers "change the
layout". **That is why no position felt right: we kept moving a control whose
shape was wrong, and position cannot fix a form mismatch.**

The tell is ללא. A sound segmented control does not need a "none" segment.
Needing one says this is not a set of alternatives — it is *off, plus four
things*. A launcher with a close, wearing a switcher's clothes.

### What was tried

- **On the board** (current). Location does not predict outcome: press here,
  something appears there. Also competes for the board's corners with controls
  that genuinely belong to the board.
- **On the seam** (option ב, approved from a sketch, built, reverted the same
  day). The reasoning held — the control governs the split, so it belongs on
  the line where the split happens — but built at full width it read as a
  mistake. **The sketch was 390px and the screen is 1240**: a schematic tests
  the logic of an arrangement, never how it reads. Any further sketch here
  must be at real scale, or built behind a flag and looked at directly.
- **Tabs on the pane** (option ג, rejected on the sketch). Right form, but with
  nothing open there is no pane to hold the tabs and therefore nothing to press
  to open one — a second control appears just for the closed state, which is
  the problem we started from.

### Not yet tried

- A **launcher**: one button that opens a menu of four; the opened pane carries
  its own name and an ✕. Form matches behaviour — a button that opens, a pane
  that closes itself — and placement stops mattering so much.
- A **permanently present lower pane**, which would make the segmented control
  honest: it really would be switching what occupies a region that is always
  there. Costs screen height.
- Keeping it on the board but **visually separating** it from frost/float/
  fullscreen, so it stops claiming to be one of them.

---

## 2. The glass board is becoming chrome

The board is the motif — build through glass, crisp in front, frosted behind.
It exists to show the work.

It now carries nine controls (table above). Each arrived for a good local
reason. Together they have turned a surface that shows content into a surface
that hosts buttons, and the motif pays for it every time.

The rule that probably wants writing, once the menu question is settled:
**the board is content, not chrome — every control placed on it is charged to
the motif, so it has to earn its place there by acting on the board itself.**

By that test the four that act on the board can stay and the five that open
something else cannot, which is the same conclusion problem 1 reaches from the
other direction.

---

*Pinned 2026-09-29. Both need Shirli's decision, not more analysis.*
