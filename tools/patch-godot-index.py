#!/usr/bin/env python3
"""Re-apply WaffleStack's required patches to public/godot/index.html.

Godot re-exports regenerate index.html from the engine template, silently
wiping our three required additions. EVERY agent that re-exports the game
MUST run this script afterwards (see CLAUDE.md "Godot export" rule):

  python tools/patch-godot-index.py [--tag <cache-tag>]

Patches applied (idempotent):
 1. godot-progress / godot-ready postMessage hooks (React loader depends on them)
 2. WebGL context-loss guard (recovers from GPU resets instead of freezing)
 3. mainPack cache-bust tag + fileSizes correction (browsers cache the pck)
"""
import io, os, re, sys, datetime, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, "public", "godot", "index.html")
PCK = os.path.join(ROOT, "public", "godot", "index.pck")

tag = None
if "--tag" in sys.argv:
    tag = sys.argv[sys.argv.index("--tag") + 1]
if not tag:
    tag = "auto-" + datetime.date.today().isoformat()

s = io.open(HTML, encoding="utf-8").read()
orig = s
report = []

# ── 1. progress/ready postMessage hooks ──────────────────────────────────────
if "godot-progress" not in s:
    s = s.replace(
        "'onProgress': function (current, total) {",
        "'onProgress': function (current, total) {\n\t\t\t\ttry { window.parent.postMessage({ type: 'godot-progress', current: current, total: total }, '*'); } catch(e) {}",
        1,
    )
    report.append("progress hook: ADDED" if "godot-progress" in s else "progress hook: ANCHOR MISSING!")
else:
    report.append("progress hook: ok")

if "godot-ready" not in s:
    s = s.replace(
        "setStatusMode('hidden');",
        "setStatusMode('hidden');\n\t\t\ttry { window.parent.postMessage({ type: 'godot-ready' }, '*'); } catch(e) {}",
        1,
    )
    report.append("ready hook: ADDED" if "godot-ready" in s else "ready hook: ANCHOR MISSING!")
else:
    report.append("ready hook: ok")

# ── 2. WebGL context-loss guard ──────────────────────────────────────────────
GUARD = """// WebGL context-loss guard: Godot Web cannot recover a lost context (GPU
// reset on integrated GPUs under load) — detect it, tell the parent app,
// offer a clean reload instead of a silent freeze.
(function () {
  const cv = document.getElementById('canvas');
  if (!cv) return;
  let lost = false;
  cv.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    lost = true;
    try { window.parent.postMessage({ type: 'godot-context-lost' }, '*'); } catch (_) {}
    let ov = document.getElementById('ws-ctx-lost');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'ws-ctx-lost';
      ov.setAttribute('dir', 'rtl');
      ov.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:rgba(13,13,26,0.92);color:#fff;font-family:system-ui,Arial,sans-serif;text-align:center;padding:24px;';
      ov.innerHTML = '<div style="font-size:40px">\\ud83c\\udfd9\\ufe0f</div>'
        + '<div style="font-size:18px;font-weight:700">\\u05d4\\u05e8\\u05d9\\u05e0\\u05d3\\u05d5\\u05e8 \\u05e9\\u05dc \\u05d4\\u05e2\\u05d9\\u05e8 \\u05e0\\u05ea\\u05e7\\u05dc \\u05d1\\u05e2\\u05d5\\u05de\\u05e1</div>'
        + '<button id="ws-ctx-reload" style="background:linear-gradient(135deg,#D4AF37,#b8941f);border:none;color:#1F2640;font-weight:800;font-size:15px;padding:11px 26px;border-radius:12px;cursor:pointer">\\u05d8\\u05e2\\u05df \\u05de\\u05d7\\u05d3\\u05e9 \\u05d0\\u05ea \\u05d4\\u05e2\\u05d9\\u05e8</button>';
      document.body.appendChild(ov);
      document.getElementById('ws-ctx-reload').addEventListener('click', function () { window.location.reload(); });
    }
  }, false);
  cv.addEventListener('webglcontextrestored', function () {
    if (lost) window.location.reload();
  }, false);
})();
"""
if "webglcontextlost" not in s:
    anchor = "const GODOT_CONFIG"
    s = s.replace(anchor, GUARD + anchor, 1)
    report.append("ctx guard: ADDED" if "webglcontextlost" in s else "ctx guard: ANCHOR MISSING!")
else:
    report.append("ctx guard: ok")

# ── 3. cache-bust + fileSizes ────────────────────────────────────────────────
pck_size = os.path.getsize(PCK)
# CONTENT-HASH cache key: the ?v= query is the pck's md5, so the URL is STABLE
# when the game is unchanged (a React-only deploy won't re-download the 100 MB
# pck) and changes only when the pck changes. Pairs with vercel.json serving
# *.pck `immutable` → unchanged pck = browser cache hit, no revalidation.
pck_hash = hashlib.md5(io.open(PCK, "rb").read()).hexdigest()[:12]
s = re.sub(r'"index\.pck":\d+', '"index.pck":%d' % pck_size, s)
if "GODOT_CONFIG.mainPack" not in s:
    s = s.replace(
        "const GODOT_THREADS_ENABLED",
        'GODOT_CONFIG.mainPack = "index.pck?v=%s";\nconst GODOT_THREADS_ENABLED' % pck_hash,
        1,
    )
    report.append("cache-bust: ADDED hash=%s" % pck_hash)
else:
    s = re.sub(r'index\.pck\?v=[\w-]+', "index.pck?v=%s" % pck_hash, s)
    report.append("cache-bust: RETAGGED hash=%s" % pck_hash)
# Human build marker (distinct from the content-hash cache key) — lets us poll
# production to confirm a specific build is live.
marker = "<!-- ws-build:%s -->" % tag
if "ws-build:" in s:
    s = re.sub(r'<!-- ws-build:[\w.\-]+ -->', marker, s)
elif "</head>" in s:
    s = s.replace("</head>", marker + "\n</head>", 1)
report.append("build-marker: %s" % tag)
report.append("fileSizes: pck=%d" % pck_size)

if s != orig:
    io.open(HTML, "w", encoding="utf-8", newline="\n").write(s)
    report.append("WROTE " + HTML)
else:
    report.append("no changes needed")

print("\n".join(report))
missing = [r for r in report if "MISSING" in r]
sys.exit(1 if missing else 0)
