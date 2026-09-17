# WaffleStack — design rules

Mapped from the home screen on 2026-09-11, from the values in the code rather
than from intent. Every other screen is built to this. A deviation needs a
reason, not a habit.

The visual version lives in the design canvas, page **חוקי העיצוב** — swatches,
live button states, real type specimens. This file is the text of the same
thing, for review and for grep.

---

## 1. Colour

One hue at 222°. Coral is the only non-blue, and it has exactly one job.

| Token | Value | Job |
|---|---|---|
| `--sh-text-dark` | `#1F3E6C` | page title, primary text |
| `--sh-text-med` | `#254A9F` | card titles, selected icon |
| `--sh-text-tip` | `#465CA5` | prose inside a card |
| `--sh-text-light` | `#7F9BD9` | labels, meta, empty state |
| — | `#2530A6` | every icon; the midpoint of the CTA's pressed gradient |
| — | `#C0D0F6` | CTA fill at rest |
| `--sh-sidebar-bg` | `linear-gradient(265.4deg, #83B2F8 -108.21%, #3351CA 169.33%)` | the rail, the avatar |
| — | `#FF7A59` | coral — progress only |
| — | `#FFBCAC` | light coral — progress tracks, thin lines |

**Banned: any colour outside the scale.** `#D4AF37` gold, `#34A853` green and
`#8a6d1c` brown are all still running in the learning area and are all bugs.

**Coral never touches a surface, a button, or the inside of an icon.** It says
"this moved": charts, timelines, achievements.

## 2. Type

Three faces, one job each. A fourth face is a bug.

- **Tel Aviv Modernist** (`var(--ws-display)`) — headings only. Licensed for the
  site; see `docs/font-licence.md` before moving to a custom domain
- **Assistant** — everything running: prose, buttons, labels, menus
- **Gveret Levin** (`var(--ws-hand)`) — lesson content on the glass board, nowhere else

| Role | Spec |
|---|---|
| Screen heading | Modernist 28 / 700, `--sh-text-dark` — the page's own h2 |
| Location label | Modernist 20 / 600, `--sh-text-med` — the line in the top bar |
| Card title | Modernist 23 / 700, `--sh-text-med` |
| Prose | Assistant 16 / 400, line-height 1.6, `--sh-text-tip` |
| Button | Assistant 16 / 600 |
| Label | Assistant 13 / 400, `--sh-text-light` — the smallest allowed |

**Banned: `Inter`.** It still sets the numbers on the topic cards.

## 3. Buttons

Three levels. **Shape says which, before a word is read.**

| | Shape | Fill |
|---|---|---|
| Primary | rectangle, radius 16 | the only filled control in the app |
| Secondary | round, radius 999 | never |
| Navigation | round, radius 999 | never |
| Tertiary | round, radius 999 | never — and no border either |
| Toggle | round, radius 999 | only while it is on |

The rectangle belongs to the primary and to nothing else. Everything that is
not the main action of its surface is round — secondaries, the board’s own
controls, every back control, every on/off switch. Fill alone never carried
this: a border at a glance is mostly just “a box”, and the reader had to get
close enough to read the label before knowing what kind of control it was.
Per Shirli, 2026-09-17.

**The one exception: a matched pair.** When a secondary sits beside the
primary as its partner — same card, same moment, two ways to start — it takes
the primary’s rectangle, through `.ws-cta-boxed`. תיאוריה / תרגול is the whole
population today. They are one group of controls, not a button and a chip, and
shape is what says so; fill still says which of the two leads.

### Primary — `.ws-cta`

Dark from the start. It carries the sidebar's own colour — literally the dark
half of `--sh-sidebar-bg`, ending on the same `#3351CA` at the same 265.4deg —
so the main action of a card reads as a sibling of the app's own chrome. The
resemblance is the point, not a side effect.

```
rest    265.4deg #4769D5→#3351CA  ink #fff  0 3px 8px rgba(39,24,126,.20)
hover   265.4deg #3E5CBB→#2D47B2      #fff  0 5px 10px rgba(39,24,126,.24)  translateY(-3px)
active  265.4deg #18247E→#313CCE      #fff  inset 0 2px 5px rgba(11,6,48,.55)  translateY(1px)
        radius 16 · padding 11px 26px · gap 9 · arrow last, pointing left
```

Measured luminance 0.134 · 0.102 · 0.053 — every step is a real darkening, not
a tint. White on the lightest stop is 4.94:1, so the label holds AA at 16px.

The stops are written out rather than read from `--sh-sidebar-bg`, because that
token flips to near-black in dark mode, which would leave the pressed state
**lighter** than rest and invert the whole ladder.

`.ws-cta.is-on` — a toggle that stays down — repeats the `:active` declaration
exactly. "On" and "being pressed" must not look like two different things.

### Secondary — `.ws-cta-outline`

**A border and nothing else. No fill, in any state** — not on hover, not when
pressed, not when done. A half-strength fill reads as something that failed to
finish loading, and a filled secondary competes with the primary beside it.

The states move the **ink and the border**, never a background:

```
rest    border+ink #254A9F   transparent
hover   border+ink #1B3878   transparent   0 4px 9px rgba(39,24,126,.18)  translateY(-3px)
active  border+ink #132A5C   transparent   inset 0 2px 5px rgba(11,6,48,.35)  translateY(1px)
is-done border+ink #132A5C   transparent   no lift
```

All three inks sit at 221° — the house hue — at 7.29 · 9.90 · 12.32 : 1 against
a card. The inset shadow on press is what says "it went in"; an inset is edge
shading, not a fill.

`.is-done` carries no fill either. Every caller already swaps the label and
shows a check, which is what actually reports the state. Filling it used to make
a spent secondary darker than the live primary next to it.

`.ws-cta-xs` is the same button at board scale — a 1px border at 42 % and the
ink at full strength, which is what replaced the white wash it used to sit on.

### Navigation — `.ws-cta-nav`

The third level, and a different job: a control that **leaves** the screen
rather than acting on it. Today that is the back control, and nothing else.

```
rest    border rgba(51,65,85,.32)  ink --ws-ink-sub
hover   border rgba(51,65,85,.55)  ink #22303F  0 3px 8px rgba(31,62,108,.14)  translateY(-2px)
active  border rgba(51,65,85,.70)  ink #16202B  inset 0 2px 5px rgba(11,6,48,.28)  translateY(1px)
        radius 999 · padding 7px 16px · 14px/600 · gap 7
```

Round, because a pill reads as "press to go" more plainly than a rectangle,
and because **the primary is never round** — the two can never be confused.
A hairline rather than 1.5px, and the description ink rather than the house
blue, because it sits opposite the list/map switch and must not weigh the
same: at 1.5px in `#254A9F` it weighed exactly as much and read as too loud.
Luminance ladder 0.051 / 0.028 / 0.014.

It still obeys the secondary law: a border and no fill, in every state.

### Tertiary — `.ws-cta-text`

The fourth level: a text button. דלג, הקודם — controls that have to be on
the screen and must not compete for it.

```
rest    ink --sh-text-tip #465CA5
hover   ink #254A9F
active  ink #18247E  translateY(1px)
        radius 999 · padding 11px 14px · min-height 44 · 14px/600 · no border, no fill
```

No border and no fill, in any state — only the ink moves. It starts a step
softer than the secondary’s so the control reads as available rather than as
offered: 5.59 : 7.29 : 10.24 against a card, each step darker, the same law
every other control obeys. Disabled is `aria-disabled="true"`, which the class
styles — not a second set of inline colours.

### The toggle — `.ws-cta.is-on`

A control that stays down repeats the `:active` declaration **exactly** — same
gradient, same inset, no lift. "On" and "being pressed" must never look like
two different things; if they do, a reader cannot tell what a press did.

### Rules

1. One primary per card. Two buttons of equal weight say there is no main action.
2. Pressed is always darker than hover, hover always darker than rest. This
   holds for every control in the app, including chips and bar icons.
3. Only the primary is filled. Everything below it is a border, or nothing.
4. Four levels, and they answer four different questions: primary — what
   should I do here; secondary — what else can I do here; navigation — how do
   I leave; tertiary — what I can do without it mattering much. A control that
   leaves never wears the weight of one that acts.
5. The arrow points left. In Hebrew, forward is leftward. The back control is
   the exception that proves it: its arrow points the other way, because it is
   the only one going backwards.
6. Never re-implement any of them inline. Inline styles outrank every class
   selector and silently kill `:hover` and `:active` — the button then looks
   right and does nothing.

Per Shirli, 2026-09-17. This reverses the earlier rule that the primary should
rest on the *lighter* end of the ramp.

## 4. Surfaces

One glass card. Not two kinds, not three.

```
background  linear-gradient(180deg, rgba(255,255,255,.45) 54.33%, rgba(255,255,255,.15) 100%)
blur        blur(20px) saturate(160%)
border      1px rgba(255,255,255,.55)
shadow      0 8px 32px rgba(31,62,108,.18), inset 0 1px 0 rgba(255,255,255,.55)
radius      24
```

**Radius: four values.** 24 card · 16 button · 999 chip · 10 small control.
Eight distinct radii are currently in use.

Gap between cards 24, inner padding 24–28. Everything right-aligned; centring
is for things that cannot wrap to a second line.

## 5. Icons

See `memory/icon-language.md` for the full account. In short:

- **Three sizes.** 26 in content, 22 in chrome (rail and top bar), 16 inside a component.
- **One colour**, `#2530A6`. Stroke 1.6 in content, 1.8 in chrome.
- **Outline at rest, filled only when the control is engaged** — a selected rail
  row, an open top-bar menu. Same silhouette both ways, so nothing shifts.
- **An emoji is not an icon.** It cannot be coloured or sized to the system and
  renders differently on every OS.

## 6. Grid

**A control the reader comes back to must not move.** When the same element
appears on item after item — the answer options on every question, an action
row on every card — its box is reserved, not derived. If the container is
allowed to size itself to this item’s content, the reader has to find the
control again every time, and the screen reads as unstable even though nothing
is wrong with any single frame.

Two traps this cost us on the practice board:

- `margin-inline: auto` on a flex item **cancels the stretch** it would
  otherwise get from its column, so a grid with `maxWidth` but no `width`
  shrank to its content and centred that. Measured across six questions: the
  option grid ran 410px to 1180px wide and its edge moved 385px. Set `width`
  **and** `maxWidth`; the auto margins then only centre the cap.
- Text above it moves everything below it. A one-line stem is 41px and a
  two-line stem 87px, which pushed the options down 47px on about half the
  questions. Reserve the common maximum with `min-height` in `em`, including
  any gap between lines — a min, never a fixed height, so genuinely longer
  content still grows instead of being clipped.

Verified by measuring the same element across eight consecutive questions:
left, top and width identical on all eight.


1. **The content column starts on the line of the rail's first row.** That is
   what makes the rail and the content read as one grid rather than two panels
   that happen to be adjacent.
2. **1.25fr / 1fr** for every two-column row — one vertical seam down the screen.
3. **Cards in a row share a height**; the button pins to the bottom, not to the
   end of the text.
4. **No widow.** `text-wrap: balance` on headings, `pretty` on prose, never a
   hard `<br>`.

---

## Status

Four states, one set of colours. They are the only colours in the app allowed
outside the 222° scale, because a state is not decoration: it has to read as
itself at a glance rather than as one more shade of the house blue.

| State | Mark | Ground | Ink |
|---|---|---|---|
| נכון / התקבל | `--ws-ok` `#07B95A` | `--ws-ok-bg` `#E9F9F0` | `--ws-ok-ink` `#0A8F47` |
| שגוי / נדחה / התראה | `--ws-bad` `#FA0030` | `--ws-bad-bg` `#FFEBEF` | `--ws-bad-ink` `#D10028` |
| ממתין | `--ws-wait` `#FFAE1A` | `--ws-wait-bg` `#FFF6E6` | `--ws-wait-ink` `#B37400` |
| טרם התחיל | `--ws-idle` `#94A3B8` | `--ws-idle-bg` `#F1F5F9` | `--ws-idle-ink` `#64748B` |

The shape is `.ws-status` + `.ws-status--{ok,bad,wait}`: a filled round mark,
then the word, on a pale ground of the same hue.

**Idle is the fourth because "nothing yet" is not "waiting".** Waiting means
something is pending on someone. Idle means the reader has not arrived yet. It
is desaturated and cooler than the house blue so it reads as absence rather
than as a quiet member of the scale.

**The red is a rose-red, not an orange-red.** It sat at 7.2° until it moved to
`#FA0030` at 348.5°. At 7.2° it was 4.7° from the coral accent and the two
read as one colour whenever they met; the gap is now 23.4°. One red serves
every negative — a wrong answer, a rejected request, the dot on the bell.
Never a second one.

**Waiting is amber, not coral.** `--ws-wait` sits at 38.8° and the coral accent
at 11.9°. They started sixteen degrees apart — two oranges at the same
saturation and lightness, which the eye reads as one colour — so both moved:
waiting toward gold, coral toward red. The coral was the one to move because
it comes in small doses; a state colour has to be unmistakable where it is
used, and coral only has to be recognisable.

### A score is a state

The best score on a topic card is these four applied to a number, and it is
the pattern for any other measure with a "good" end:

```
0        טרם תורגל     --ws-idle-ink
1-59     נמוך          --ws-bad-ink
60-84    בינוני        --ws-wait-ink
85-100   גבוה          --ws-ok-ink
```

The two numbers beside it carry no state at all. **שאלות** is how much content
exists — a fixed `TEXT_MED`, because a count is not an achievement and its
colour must never change. **סשנים** is idle grey at zero and `TEXT_DARK` above
it, so "I work here, a lot" reads without a label.

The `-ink` variants were calibrated against the pale status grounds, not
against glass. On a card the mid tier lands at 3.88:1 — under AA for 16px,
over the 3:1 large-text floor. Raising the number to 19px bold clears it;
darkening the token would change every status pill in the app.

**Nothing that is not a state may use these.** A green that means "this is a
chart series" or an amber that means "this is important" is how a status
system stops meaning anything.
