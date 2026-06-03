# Mindmap v2 — Readability + Interaction Overhaul

File: `public/mindmap.html` (~7,543 lines, vanilla JS, `MM` model).
Goal: make the map usable at macro AND micro scale, and make editing/navigation feel like X-Mind.

Node model (existing): `{id,type,text,x,y,color,parentId,childIds,collapsed,W,H,zoneId,...}`.
Orientation: `mmOrient()` → `'tb'` (top→bottom, as in user screenshots) or `'lr'`. Layout: `mmTidyLayout()` / `mmTidyLayoutTB()`.
Selection: `MM.sel` (single), `MM.multiSel` (array). Render: `mmRender()`. Global keydown: L5141.

---

## Problem (user)
At 10% the whole tree is an unreadable blob (screenshot 2). No human parses that many nodes at once. Need: **macro = main branches only**, **deep-dive = expand one path, collapse the rest**. Plus 6 interaction gaps.

---

## Item 2 — Collapse / macro↔micro (HIGHEST VALUE)
Infra already present: `collapsed` flag, per-node toggle (L1543/1572), `setCollapseAll` (L2330), depth-collapse (L2341), `mmInitialFocus`. Build on it.

1. **Macro button** (toolbar): "מבט-על" → collapse every node to depth 1 (only root + main branches visible). Reuse depth-collapse with `maxDepth=1`, then `mmTidyLayout()` + fit-to-screen.
2. **Focus-dive** (X-Mind style): double-click a branch (or `F`/Enter on selected) → expand path root→node→its direct children, collapse ALL other branches. New fn `mmFocusBranch(id)`: walk ancestors (keep expanded), collapse every sibling not on the path, expand target + 1 level.
3. **Space** = toggle collapse of `MM.sel` (fast keyboard collapse).
4. **Auto-collapse on load** stays (depth-based) so first paint is readable.
5. Collapsed node shows child-count badge (`+N`) so user knows there's hidden depth.

Acceptance: at macro you see ~6–10 main branches; clicking one expands just it; the rest fold away.

---

## Item 3+4 — Spatial arrow-key navigation (replace topological)
Current (L5225) is topological: Right=firstChild, Left=parent, Up/Down=cyclic siblings. User wants **visual/spatial** (matches screenshot 2 TB layout): Right=node to the right, Left=left, Up=up, Down=down — regardless of orientation.

Rewrite the ArrowKey branch:
- Build list of currently VISIBLE nodes (`mmIsVisible`).
- From `MM.sel` center (x,y), pick nearest node in the pressed direction using a cone test: candidate must be in the half-plane of the arrow; score = primary-axis distance + 0.5×perpendicular offset; pick min.
- TB layout result: Left/Right = siblings, Up = parent, Down = first child (exactly item 3+4). LR layout: still intuitive because it's purely spatial.
- Keep `mmEnsureSelVisible()` pan-to-selection (already exists L5250).

Acceptance: Right selects the topic visually to the right (screenshot 2); Up/Down walk the subtopic column.

---

## Item 5 — Ctrl+C / Ctrl+X / Ctrl+V on topics (move/copy/cut subtrees)
Not implemented. Add internal clipboard `MM.clip = {mode:'copy'|'cut', rootId, snapshot}`.
- **Copy** (`Ctrl+C`): deep-clone selected subtree (node + all descendants) into `MM.clip.snapshot` (serialize ids+fields+structure). mode=copy.
- **Cut** (`Ctrl+X`): same snapshot, mode=cut, mark source for removal on paste.
- **Paste** (`Ctrl+V`): re-id every node in snapshot (fresh `uid()`), attach as child of `MM.sel` (or root). If mode=cut, delete the original subtree. `mmTidyLayout()` + `mmPushHistory()`.
- Multi-select aware: copy/cut all `MM.multiSel` roots (skip nodes whose ancestor is also selected).
Guard: never cut/delete `MM.root`. Respect editing-input check (already at L5145).

Acceptance: select topic → Ctrl+X → select new parent → Ctrl+V → subtree moves intact.

---

## Item 6 — Paste images into the map
Not implemented (only whiteboard paste exists L4135). Add `document.addEventListener('paste', …)` (skip when typing in input/contenteditable):
- If clipboard has an image blob → `FileReader` → dataURL.
- New node type `'image'`: `{type:'image', src:dataURL, W,H (from natural size, capped)}`. Render in `mmRender` as an `<img>` inside `.node-wrap` (no text bubble).
- **Placement rule (user):** if `MM.sel` set → add as child of selected (`parentId=MM.sel`). Else → floating node (no parent) near current viewport center (`screen→world` via panX/zoom), `parentId:null` so it shows (free-node visibility fix already in `mmIsVisible`).
- Reuse existing node drag + connect-later wiring so the image is draggable + connectable.

Acceptance: Ctrl+V an image → lands on selected topic, or floats where you're looking; draggable + connectable.

---

## Item 7 — Click-to-type (no F2)
Current: edit only via dblclick / F2 (L1566, L5197). Add **type-to-edit**: in global keydown, if `MM.sel`, not editing, key is a single printable char (and no ctrl/meta) → `startEditNode(n,el)` then insert that char as the initial value (clear existing or append per UX — start fresh on first char). Also: single-click already selects; keep dblclick for explicit edit. This gives "click a topic, just start typing."
Edge: Hebrew chars, digits, space all trigger; arrows/Tab/Enter/Delete keep their nav meaning.

Acceptance: click topic, type — it edits immediately, no F2.

---

## Item 8 — Summaries that follow the flow (frame + auto-subtopics)
Current: `type:'summary'` renders as a small floating label beside a group (L1475–1493), no frame, overlaps nodes (screenshot 1 — ugly).
Rework:
1. **Auto-subtopics:** "add summary to a topic" → summary's group = that topic's visible direct children (auto). Store `summary.groupIds = childIds(target)` (or a target topicId it summarizes). No manual multi-pick needed.
2. **Flow-aware placement + visible frame:**
   - TB orientation → place summary label BELOW the group; draw a bracket/box spanning the group's x-range at the bottom, label centered under it.
   - LR orientation → place to the side (existing behavior) with a vertical brace.
   - Draw a real **frame**: rounded rect or brace SVG enclosing the summarized subtopics, with a connector to the summary label. Compute bbox from `groupIds` node x/y/W/H in the layout pre-pass.
3. Summary stays attached: when the group moves/relayouts, recompute frame + label position (hook into `mmTidyLayout` post-pass).

Acceptance: summary sits at the bottom (TB) of the topics it covers, inside a visible frame; adding a summary to a parent auto-includes its subtopics.

---

## Build order (atomic commits, verify each in live preview)
1. Spatial arrow nav (3+4) — small, high feel-impact.
2. Type-to-edit (7) — small.
3. Macro button + focus-dive + Space-collapse (2) — the readability win.
4. Ctrl+C/X/V subtree clipboard (5).
5. Image paste (6).
6. Summary flow + frame + auto-subtopics (8).

Each: edit `public/mindmap.html`, reload `http://localhost:<dev>` (or the live preview), DOM-verify per `wafflestack-conventions` §29 (probe, don't bundle-grep). Commit per item. Toolbar color stays `#4E71DA`.

## Out of scope
- Zeppelin (separate track).
- Server/Supabase sync of map (already keyed `mm-data-<userId>`).
