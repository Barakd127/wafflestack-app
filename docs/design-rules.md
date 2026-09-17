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

Two levels. That is the whole system, and they are told apart by **fill, not by
size**: the primary is the only thing on the card that is filled.

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

### Rules

1. One primary per card. Two buttons of equal weight say there is no main action.
2. Pressed is always darker than hover, hover always darker than rest. This
   holds for every control in the app, including chips and bar icons.
3. Only the primary is filled. Everything below it is a border, or nothing.
4. The arrow points left. In Hebrew, forward is leftward.
5. Never re-implement either button inline. Inline styles outrank every class
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

Three states, one set of colours. They are the only colours in the app
allowed outside the 222° scale, because a state is not decoration: it has to
read as itself at a glance rather than as one more shade of the house blue.

| State | Mark | Ground | Ink |
|---|---|---|---|
| נכון / התקבל | `--ws-ok` `#07B95A` | `--ws-ok-bg` `#E9F9F0` | `--ws-ok-ink` `#0A8F47` |
| שגוי / נדחה | `--ws-bad` `#F4523C` | `--ws-bad-bg` `#FDEDEA` | `--ws-bad-ink` `#D63A25` |
| ממתין | `--ws-wait` `#FFAE1A` | `--ws-wait-bg` `#FFF6E6` | `--ws-wait-ink` `#B37400` |

The shape is `.ws-status` + `.ws-status--{ok,bad,wait}`: a filled round mark,
then the word, on a pale ground of the same hue.

**Waiting is amber, not coral.** `--ws-wait` sits at 38.8° and the coral
accent at 11.9°. They started sixteen degrees apart — two oranges at the same
saturation and lightness, which the eye reads as one colour — so both moved:
waiting toward gold, coral toward red. The coral was the one to move because
it comes in small doses; a state colour has to be unmistakable where it is
used, and coral only has to be recognisable.

**Nothing that is not a state may use these.** A green that means "this is a
chart series" or an amber that means "this is important" is how a status
system stops meaning anything.
