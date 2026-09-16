---
name: wafflestack-design
description: Use this skill to generate well-branded interfaces and assets for WaffleStack (וופלסטאק), a Hebrew-first gamified statistics-learning platform — either for production or throwaway prototypes/mocks. Contains the app's REAL design tokens, CSS class components, and React components extracted verbatim from the production codebase.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files (`tokens/`, `components/`, `templates/`, `foundations/`, `assets/`).

WaffleStack is RTL Hebrew (`lang="he" dir="rtl"`), navy + royal-blue with teal and gold accents, glassmorphic cards over the signature blue gradient, Heebo body / Rubik UI type, and warm playful copy (emoji are on-brand). Dark mode is toggled by adding the `dark` class to `<html>` (`html.dark`).

**This bundle mirrors the real app's code** (extracted from `master` — see provenance headers in each file). That means:

- **Tokens are the app's actual CSS variables**: `--sh-*` (StudyHub theme: page/sidebar gradients, glass cards, text scale), `--ls-*` (landing page, scoped to `.landing-root`), `--ws-*` (FAB layout slots, `--ws-hand`), `--mm-*` (mind-map canvas). There are NO `--space-*` / `--radius-*` / `--ws-navy-*` aliases — the app doesn't have them. Sizes and radii are written as raw values in the app, so prototypes should match nearby real component values.
- **The real "component library" is class-based**: `.ws-glass-card` (glass surface + specular streak + hover lift), `.ws-cta-btn` (solid pill CTA with sheen — primary CTAs are SOLID navy in light / teal in dark, never glass), `.ws-glass-btn` (frosted secondary), `.ws-icon-chip--active/--inactive` (sidebar chips), `.ws-tooltip`, `.ws-ribbon`, plus mobile rules — all in `app-classes.css`, verbatim from `src/index.css`.
- **React components in `components/` are extracted from the real app** (StudyHub sidebar/topbar/cards, TutorFAB, CoinPill, ConceptCard, graph theme…). Their markup, classes, Hebrew copy and inline styles match production; runtime seams (stores, routing) are replaced by props marked `[ds-extract]`.
- **Templates in `templates/` are the real screens** — start prototypes from them so new work drops into the actual app shell.

If creating visual artifacts (slides, mocks, throwaway prototypes), create static HTML files and link `styles.css` for all tokens/classes. If working on production code, these files ARE the production styles — copy class names and var() references directly; they will exist in the app.

Known app quirk (do not "fix" here): `--sh-gold` and `--sh-cream` are consumed by economy components + RiskBoard but defined nowhere; RiskBoard falls back to `#D4A017`.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask a few questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
