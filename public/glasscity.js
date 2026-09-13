/* glasscity.js — a live 3D city behind GlassMap's glass, built from the
 * same real Kenney assets and tile-fit logic as the WaffleStack app's own
 * Godot city (wafflestack-godot/scripts/CityBuilder.gd) — one packed
 * plateau, a road ring, a rocky underside, water below.
 *
 * Loaded as <script type="module" src="glasscity.js"> at the end of
 * glassmap.html. Reads the map's own live state via window.GM.S() and
 * renders into a <canvas class="gm-city3d"> placed inside .gm-world, in
 * front of the static #gmCity picture — then hides that picture once the
 * first frame lands. If WebGL is unavailable, or three.js / any model
 * fails to load before the first frame, this bails out quietly and the
 * static picture stays exactly as it was.
 *
 * Model source: real Kenney assets (commercial / suburban / industrial /
 * modular towers / trees / cars) copied from the Godot app's own asset
 * pack into public/models/godot-city/<kit>/, each kit keeping its own
 * Textures/colormap.png beside its GLBs so colours load with no redirect
 * hack. Read from window.GM_ASSET_BASE (default 'models/') so an Obsidian
 * build can point it elsewhere later.
 *
 * Mapping: the root node is the tallest tower at the plateau's centre,
 * each top-level branch owns an angular quarter of the same plateau (a
 * thin street marks the quarter boundary), and every visible descendant is
 * a building inside its quarter. depth 1 is a landmark commercial
 * building; deeper nodes are suburban houses, except kind 'gap' (a low /
 * unfinished building) and kind 'question' (an industrial building, calm
 * but distinct). Every plateau cell a real node doesn't claim gets a
 * smaller decorative filler (a building or a tree) so the plateau reads as
 * packed, never as an empty lawn. A collapsed node still shows its own
 * building; its children just aren't placed (mirrors the map's own
 * visibleSubtreeIds).
 *
 * Render-on-demand only: there is no requestAnimationFrame loop. A single
 * frame is scheduled (and coalesced) after a map change, a theme change, a
 * resize, or a parallax move — never on a timer. The few cars on the road
 * ring are static GLBs, not an animation loop.
 */
(function () {
  'use strict';

  if (window.__glassCityBooted) return;      /* never double-boot (e.g. a re-included script tag) */
  window.__glassCityBooted = true;

  var THREE_VERSION = '0.160.0';
  var THREE_BASE = 'https://cdn.jsdelivr.net/npm/three@' + THREE_VERSION + '/';
  var ASSET_BASE = (typeof window.GM_ASSET_BASE === 'string' && window.GM_ASSET_BASE) || 'models/';
  if (ASSET_BASE.charAt(ASSET_BASE.length - 1) !== '/') ASSET_BASE += '/';

  var TILE = 2;             /* world units per grid cell */
  var LOT_CAP = 200;        /* hard cap on placed buildings */
  /* Real per-kit assets copied from the Godot app's own CityBuilder pools
     (wafflestack-godot/assets/kenney/*), each with its OWN Textures/
     colormap.png sitting right beside its GLBs under
     public/models/godot-city/<kit>/ — no cross-kit redirect needed, and no
     colour guessing: these are the exact same models + textures the real
     app renders. */
  var GC = 'godot-city/';
  var POOLS = {
    root: [GC + 'modular/building-sample-tower-a.glb', GC + 'modular/building-sample-tower-b.glb',
      GC + 'modular/building-sample-tower-c.glb', GC + 'modular/building-sample-tower-d.glb'],
    landmark: [GC + 'commercial/building-a.glb', GC + 'commercial/building-b.glb', GC + 'commercial/building-c.glb',
      GC + 'commercial/building-d.glb', GC + 'commercial/building-e.glb',
      GC + 'commercial/building-skyscraper-a.glb', GC + 'commercial/building-skyscraper-b.glb', GC + 'commercial/building-skyscraper-c.glb'],
    house: [GC + 'suburban/building-type-a.glb', GC + 'suburban/building-type-b.glb', GC + 'suburban/building-type-c.glb',
      GC + 'suburban/building-type-d.glb', GC + 'suburban/building-type-e.glb', GC + 'suburban/building-type-f.glb',
      GC + 'suburban/building-type-g.glb', GC + 'suburban/building-type-h.glb'],
    gap: [GC + 'commercial/low-detail-building-a.glb', GC + 'commercial/low-detail-building-b.glb', GC + 'commercial/low-detail-building-c.glb'],
    question: [GC + 'industrial/building-a.glb', GC + 'industrial/building-b.glb', GC + 'industrial/building-c.glb', GC + 'industrial/building-d.glb'],
    decor: [GC + 'suburban/building-type-a.glb', GC + 'suburban/building-type-c.glb', GC + 'suburban/building-type-e.glb',
      GC + 'suburban/building-type-g.glb', GC + 'commercial/low-detail-building-a.glb', GC + 'commercial/low-detail-building-b.glb'],
    tree: [GC + 'trees/tree-crooked.glb', GC + 'trees/tree-high-crooked.glb'],
    car: [GC + 'cars/sedan.glb', GC + 'cars/hatchback-sports.glb', GC + 'cars/taxi.glb']
  };

  /* ── deterministic seeded hash (no Math.random anywhere) ─────────────── */
  function hashId(id) {
    var h = 2166136261;
    id = String(id);
    for (var i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return (h >>> 0) % 100000 / 100000;
  }
  function pick(seedStr, arr) { return arr[Math.floor(hashId(seedStr) * arr.length) % arr.length]; }

  /* ── classic square-spiral walk: index 0 is the centre ───────────────── */
  function spiralCells(count) {
    var cells = [{ gx: 0, gz: 0 }];
    if (count <= 1) return cells.slice(0, Math.max(count, 0));
    var dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    var x = 0, z = 0, dirIdx = 0, stepLen = 1, lenUses = 0;
    while (cells.length < count) {
      var d = dirs[dirIdx % 4];
      for (var s = 0; s < stepLen && cells.length < count; s++) { x += d[0]; z += d[1]; cells.push({ gx: x, gz: z }); }
      dirIdx++; lenUses++;
      if (lenUses % 2 === 0) stepLen++;
    }
    return cells;
  }

  /* ── WebGL feature check ──────────────────────────────────────────────── */
  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  /* ── three.js loading: dynamic import only, so a bare-specifier import
     map can be injected first without racing a static import of our own. */
  function injectImportMap() {
    if (document.querySelector('script[data-glasscity-importmap]')) return;
    var s = document.createElement('script');
    s.type = 'importmap';
    s.setAttribute('data-glasscity-importmap', '1');
    s.textContent = JSON.stringify({ imports: { three: THREE_BASE + 'build/three.module.js' } });
    document.head.insertBefore(s, document.head.firstChild);
  }
  function loadThree() {
    injectImportMap();
    return Promise.all([
      import(/* webpackIgnore: true */ THREE_BASE + 'build/three.module.js'),
      import(/* webpackIgnore: true */ THREE_BASE + 'examples/jsm/loaders/GLTFLoader.js')
    ]).then(function (mods) { return { THREE: mods[0], GLTFLoader: mods[1].GLTFLoader }; });
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  (async function init() {
    var world = document.querySelector('.gm-world');
    var gmCity = document.getElementById('gmCity');
    if (!world || !hasWebGL()) return;

    var THREE, GLTFLoader;
    try {
      var mods = await loadThree();
      THREE = mods.THREE; GLTFLoader = mods.GLTFLoader;
      if (!THREE || !GLTFLoader) return;
    } catch (e) { return; }               /* CDN unreachable etc — leave the picture alone */

    /* ── canvas: inserted BEFORE #gmCity so the picture still wins the
       paint order (and stays visible) until we explicitly hide it. ──── */
    var style = document.createElement('style');
    style.textContent = '.gm-city3d{position:absolute;inset:0;width:100%;height:100%;display:block;}';
    document.head.appendChild(style);
    var canvas = document.createElement('canvas');
    canvas.className = 'gm-city3d';
    if (gmCity) world.insertBefore(canvas, gmCity); else world.appendChild(canvas);

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) { canvas.remove(); style.remove(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 500);
    var target = new THREE.Vector3(0, 0, 0);
    var ISO_DIR = new THREE.Vector3(1, 0.92, 1).normalize();   /* a touch lower than pure iso — reveals the island's side bands */
    var camDist = 80;
    var parallax = { x: 0, y: 0 };   /* subtle offset, world units */

    function sizeRenderer() {
      var w = Math.max(1, world.clientWidth), h = Math.max(1, world.clientHeight);
      renderer.setSize(w, h, false);
      return { w: w, h: h };
    }
    function placeCamera(halfExtent) {
      var sz = sizeRenderer();
      var aspect = sz.w / sz.h;
      var hh = halfExtent, hw = halfExtent * aspect;
      camera.left = -hw; camera.right = hw; camera.top = hh; camera.bottom = -hh;
      camera.position.copy(target).addScaledVector(ISO_DIR, camDist);
      camera.position.x += parallax.x; camera.position.z += parallax.y;
      camera.up.set(0, 1, 0);
      camera.lookAt(target.x + parallax.x, target.y, target.z + parallax.y);
      camera.near = 0.1; camera.far = camDist * 4;
      camera.updateProjectionMatrix();
    }

    /* ── render-on-demand: one coalesced rAF per burst of triggers, never
       a self-perpetuating loop. ─────────────────────────────────────── */
    var renderScheduled = false, paused = false;
    function requestRender() {
      if (paused || renderScheduled) return;
      renderScheduled = true;
      requestAnimationFrame(function () {
        renderScheduled = false;
        try { renderer.render(scene, camera); } catch (e) {}
      });
    }
    document.addEventListener('visibilitychange', function () {
      paused = document.hidden;
      if (!paused) requestRender();
    });

    /* ── theme ────────────────────────────────────────────────────────── */
    function currentTheme() {
      var attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'dark' || attr === 'light') return attr;
      try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch (e) { return 'light'; }
    }
    var lastTheme = null;
    var keyLight = null;   /* the shadow-casting sun — its shadow-camera frustum is refit per rebuild */
    function applyLighting(theme) {
      (scene.userData.lights || []).forEach(function (l) { scene.remove(l); });
      var lights = [];
      keyLight = null;
      if (theme === 'dark') {
        lights.push(new THREE.HemisphereLight(0x8fa5e8, 0x1a2038, 1.1));
        var sun = new THREE.DirectionalLight(0xaebcff, 0.55); sun.position.set(-9, 14, -6); lights.push(sun);
        var warm = new THREE.DirectionalLight(0xffcf9e, 0.35); warm.position.set(7, 9, 9); lights.push(warm);
      } else {
        lights.push(new THREE.HemisphereLight(0xffffff, 0xcfe0c8, 0.85));
        var sun2 = new THREE.DirectionalLight(0xfff2d6, 1.05); sun2.position.set(9, 14, 6); lights.push(sun2);
        sun2.castShadow = true;
        sun2.shadow.mapSize.set(1536, 1536);
        sun2.shadow.bias = -0.0018;
        sun2.shadow.normalBias = 0.02;
        keyLight = sun2;
      }
      lights.forEach(function (l) { scene.add(l); l.target && scene.add(l.target); });
      scene.userData.lights = lights;
    }
    /* fit the key light's orthographic shadow frustum to the current
       layout footprint — too loose and shadows go blocky, too tight and
       they clip at the island's edge. */
    function fitShadowFrustum(halfExtent) {
      if (!keyLight) return;
      var cam = keyLight.shadow.camera;
      cam.left = -halfExtent; cam.right = halfExtent;
      cam.top = halfExtent; cam.bottom = -halfExtent;
      cam.near = 1; cam.far = 60;
      cam.updateProjectionMatrix();
      keyLight.target.position.set(0, 0, 0);
      keyLight.target.updateMatrixWorld();
    }
    /* ── GLTF loading. Each godot-city/<kit> folder ships its own real
       Textures/colormap.png right beside its GLBs (copied straight from the
       Godot app's own asset pack), so no cross-kit texture redirect is
       needed here — the colours are simply correct. ────────────────────── */
    var gltfLoader = new GLTFLoader();
    var modelCache = Object.create(null);

    /* Ported from the Godot app's CityBuilder.gd (_footprint_xform /
       _measure_aabb_local): different Kenney packs have different native
       GLB sizes AND different pivot conventions, so a single fixed "assume
       a 2x2 tile" scale leaves gaps or overlaps depending on the kit. This
       measures each model's real local AABB once, then computes a
       non-uniform x/z scale that snaps it exactly onto a TILE-sized cell
       (with the same 3% overlap the Godot code uses to hide seams) plus a
       pivot-recentring offset so the visual centre — not just the mesh's
       stored origin — lands on the cell's centre. */
    var TILE_OVERSIZE = 1.03;
    function footprintFit(box) {
      var size = box.getSize(new THREE.Vector3());
      var center = box.getCenter(new THREE.Vector3());
      if (size.x < 0.01 || size.z < 0.01) return { sx: 1, sy: 1, sz: 1, ox: 0, oz: 0 };
      var sx = (TILE / size.x) * TILE_OVERSIZE;
      var sz = (TILE / size.z) * TILE_OVERSIZE;
      var sy = Math.min(sx, sz);
      return { sx: sx, sy: sy, sz: sz, ox: -center.x * sx, oz: -center.z * sz };
    }
    function loadModel(relPath) {
      if (modelCache[relPath]) return modelCache[relPath];
      var p = gltfLoader.loadAsync(ASSET_BASE + relPath).then(function (gltf) {
        var box = new THREE.Box3().setFromObject(gltf.scene);
        return { tpl: gltf.scene, groundYLocal: -box.min.y, fx: footprintFit(box) };
      });
      modelCache[relPath] = p;
      return p;
    }
    function place(entry, x, z, ry, scale) {
      var emph = scale || 1;
      var fx = entry.fx;
      var obj = entry.tpl.clone(true);
      obj.scale.set(fx.sx * emph, fx.sy * emph, fx.sz * emph);
      obj.position.set(x + fx.ox * emph, entry.groundYLocal * fx.sy * emph, z + fx.oz * emph);
      if (ry) obj.rotation.y = ry;
      obj.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      return obj;
    }

    /* ── city group lifecycle: only OUR primitives (ground slab) get
       disposed on rebuild — GLTF clones share geometry/material with the
       cache, which lives for the page's whole lifetime on purpose. ───── */
    var cityGroup = null, ownGeoms = [], ownMats = [];
    function clearCity() {
      if (cityGroup) scene.remove(cityGroup);
      ownGeoms.forEach(function (g) { g.dispose(); });
      ownMats.forEach(function (m) { m.dispose(); });
      ownGeoms = []; ownMats = [];
      cityGroup = null;
    }
    function ownMesh(geo, mat, x, y, z) {
      ownGeoms.push(geo); ownMats.push(mat);
      var m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      return m;
    }

    /* ── GlassMap state → visible node list (mirrors the map's own
       visibleSubtreeIds: a collapsed node still renders itself, its
       children just aren't walked). ─────────────────────────────────── */
    function getState() {
      try { return (window.GM && window.GM.S && window.GM.S()) || null; } catch (e) { return null; }
    }
    /* One packed plateau (not spread-out districts on a ring): the root
       sits at the centre, each top-level branch owns an angular wedge of
       the same disc, and every cell in the disc holds something — a real
       node's building, or (once every node has a home) a decorative filler
       so the plateau reads as packed edge to edge, the way the reference
       Godot island does, instead of a lawn with buildings scattered on it. */
    function buildLayout(S) {
      if (!S || !Array.isArray(S.nodes) || !S.nodes.length) return null;
      var byId = {}; S.nodes.forEach(function (n) { byId[n.id] = n; });
      var root = null;
      for (var i = 0; i < S.nodes.length; i++) if (S.nodes[i].parent == null) { root = S.nodes[i]; break; }
      if (!root) root = S.nodes[0];
      var childrenOf = {};
      S.nodes.forEach(function (n) {
        if (n === root) return;
        var p = (n.parent != null && byId[n.parent]) ? n.parent : root.id;
        (childrenOf[p] || (childrenOf[p] = [])).push(n);
      });
      var visible = [];
      (function walk(id) {
        visible.push(id);
        var node = byId[id];
        if (node && node.collapsed) return;
        (childrenOf[id] || []).forEach(function (c) { walk(c.id); });
      })(root.id);
      var visibleSet = {}; visible.forEach(function (id) { visibleSet[id] = 1; });

      var districtRoots = (childrenOf[root.id] || []).filter(function (n) { return visibleSet[n.id]; });
      var districtCount = districtRoots.length;

      var buildings = [{ id: root.id, node: root, x: 0, z: 0, depth: 0, isRoot: true }];
      var placed = 1;

      /* BFS every district's subtree first, so the plateau can be sized to
         the real total before any cell gets assigned. */
      var districtData = districtRoots.map(function (dnode) {
        if (placed >= LOT_CAP) return null;
        var bfsOrder = [], queue = [{ node: dnode, depth: 1, parentId: root.id }];
        while (queue.length) {
          if (placed >= LOT_CAP) break;
          var cur = queue.shift();
          if (!visibleSet[cur.node.id]) continue;
          bfsOrder.push(cur); placed++;
          (childrenOf[cur.node.id] || []).forEach(function (c) {
            if (visibleSet[c.id]) queue.push({ node: c, depth: cur.depth + 1, parentId: cur.node.id });
          });
        }
        return bfsOrder.length ? { dnode: dnode, bfsOrder: bfsOrder } : null;
      }).filter(Boolean);
      var totalNodes = 1 + districtData.reduce(function (n, d) { return n + d.bfsOrder.length; }, 0);

      /* size the buildable disc so it holds every real node plus enough
         spare cells that filler decoration reads as "packed", not sparse. */
      var targetCells = Math.max(totalNodes * 1.3, 7);
      var R = Math.max(3, Math.ceil(Math.sqrt(targetCells / Math.PI)));   /* radius, in TILE cells */
      var RIM = 2;   /* extra cell-rings reserved for the walkway + road ring, no buildings there */

      var cellList = [];
      for (var gx = -R; gx <= R; gx++) {
        for (var gz = -R; gz <= R; gz++) {
          var rr = Math.hypot(gx, gz);
          if (rr <= R + 0.01) cellList.push({ gx: gx, gz: gz, r: rr, a: Math.atan2(gz, gx) });
        }
      }
      cellList.sort(function (p, q) { return p.r - q.r; });

      var used = Object.create(null);
      function key(gx, gz) { return gx + ',' + gz; }
      used[key(0, 0)] = 1;   /* reserved for the root */

      var buildingCells = {};   /* node id -> {gx,gz} for road/street bookkeeping */
      buildingCells[root.id] = { gx: 0, gz: 0 };

      var TWO_PI = Math.PI * 2;
      function sectorOf(angle, di) {
        var a = (angle + Math.PI) % TWO_PI; if (a < 0) a += TWO_PI;
        return Math.floor(a / (TWO_PI / districtCount)) === di;
      }

      districtData.forEach(function (d, di) {
        var mine = districtCount > 1 ? cellList.filter(function (c) { return !used[key(c.gx, c.gz)] && sectorOf(c.a, di); }) : cellList.filter(function (c) { return !used[key(c.gx, c.gz)]; });
        var overflow = cellList.filter(function (c) { return !used[key(c.gx, c.gz)]; });   /* fallback if a wedge runs out */
        var cursor = 0, overflowCursor = 0;
        d.bfsOrder.forEach(function (entry) {
          var cell = mine[cursor++];
          if (!cell) { while (overflow[overflowCursor] && used[key(overflow[overflowCursor].gx, overflow[overflowCursor].gz)]) overflowCursor++; cell = overflow[overflowCursor++]; }
          if (!cell) return;   /* plateau is completely full — extremely unlikely given the sizing margin */
          used[key(cell.gx, cell.gz)] = 1;
          var w = { x: cell.gx * TILE, z: cell.gz * TILE };
          buildingCells[entry.node.id] = cell;
          buildings.push({ id: entry.node.id, node: entry.node, x: w.x, z: w.z, depth: entry.depth, isRoot: false });
        });
      });

      /* every remaining cell inside the disc becomes a decorative filler —
         smaller than a real node building (set in buildCity) so the two
         stay visually distinguishable, but still a building, never grass. */
      var decor = [];
      cellList.forEach(function (c) {
        if (used[key(c.gx, c.gz)]) return;
        used[key(c.gx, c.gz)] = 1;
        decor.push({ x: c.gx * TILE, z: c.gz * TILE, seed: c.gx + ':' + c.gz });
      });

      /* one thin street along each sector boundary, centre to rim — "a thin
         street or colour tint separates them" — plus the rim ring itself. */
      var streets = [];
      for (var s = 0; s < districtCount; s++) {
        var ang = -Math.PI + (TWO_PI / districtCount) * s;
        streets.push({ ax: 0, az: 0, bx: Math.cos(ang) * R * TILE, bz: Math.sin(ang) * R * TILE });
      }

      return {
        root: root, buildings: buildings, decor: decor, streets: streets,
        plateauRadius: R * TILE, rimRadius: (R + RIM) * TILE, totalNodes: totalNodes
      };
    }

    var NODE_SCALE = 1.15;    /* real node buildings — kept a touch bigger than filler so they stay identifiable */
    var ROOT_SCALE = 2.1;     /* the centre tower stands well above everything else */
    var LANDMARK_SCALE = 1.5;
    var DECOR_SCALE = 0.85;   /* smaller than a real node building, on purpose */

    /* A thin ribbon (plain BoxGeometry, guaranteed continuous regardless of
       what fraction of a GLB tile's own footprint is actually paved) used
       for the sector-boundary streets. */
    function addRibbon(group, ax, az, bx, bz, mat, width, y) {
      var dx = bx - ax, dz = bz - az, dist = Math.hypot(dx, dz);
      if (dist < 1e-6) return;
      var ry = Math.atan2(dx, dz);
      var mx = (ax + bx) / 2, mz = (az + bz) / 2;
      var m = ownMesh(new THREE.BoxGeometry(width, 0.08, dist + 0.4), mat, mx, y, mz);
      m.rotation.y = ry; m.receiveShadow = true;
      group.add(m);
    }

    /* a low-poly, deliberately irregular tapered rock under the plateau —
       a jittered, tapered cylinder rather than a clean cone, so it reads as
       rough stone instead of a perfect geometric shape. */
    function buildRock(topRadius, height, theme) {
      var radial = 14, heightSeg = 5;
      var geo = new THREE.CylinderGeometry(topRadius * 0.97, topRadius * 0.22, height, radial, heightSeg, false);
      var pos = geo.attributes.position;
      for (var i = 0; i < pos.count; i++) {
        var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        var r = Math.hypot(x, z);
        if (r > 0.001) {
          var jitter = 0.88 + hashId('rock:' + i) * 0.24;   /* deterministic — stable across rebuilds at the same size */
          pos.setX(i, x / r * r * jitter);
          pos.setZ(i, z / r * r * jitter);
        }
      }
      geo.computeVertexNormals();
      var mat = new THREE.MeshLambertMaterial({ color: theme === 'dark' ? 0x2c2620 : 0x6b5946, flatShading: true });
      ownGeoms.push(geo); ownMats.push(mat);
      var mesh = new THREE.Mesh(geo, mat);
      mesh.receiveShadow = true;
      return mesh;
    }


    async function buildCity() {
      var S = getState();
      var layout = buildLayout(S);
      clearCity();
      var group = new THREE.Group();

      if (!layout) { cityGroup = group; scene.add(group); window.__glassCity.buildingCount = 0; requestRender(); return; }

      var theme = currentTheme();
      var plateauR = layout.plateauRadius, rimR = layout.rimRadius;
      var walkwayR = plateauR + (rimR - plateauR) * 0.4;   /* inner slice of the rim: cream walkway */

      /* plateau top — a flat disc reaching out to the rim, buildings sit on
         its inner disc and the walkway/road rings sit on its outer collar. */
      var topColor = theme === 'dark' ? 0x2f3d33 : 0x8fbf6e;
      var plateauTop = ownMesh(new THREE.CylinderGeometry(rimR, rimR, 0.3, 28), new THREE.MeshLambertMaterial({ color: topColor }), 0, -0.15, 0);
      plateauTop.receiveShadow = true;
      group.add(plateauTop);

      /* cream stone walkway, then a mint-green road ring, right at the rim. */
      var walkMat = new THREE.MeshLambertMaterial({ color: theme === 'dark' ? 0x6b6455 : 0xe9dfc4 });
      var ringMat = new THREE.MeshLambertMaterial({ color: theme === 'dark' ? 0x2f6d64 : 0x8fd9c4 });
      var walkway = ownMesh(new THREE.RingGeometry(plateauR, walkwayR, 40), walkMat, 0, 0.01, 0);
      walkway.rotation.x = -Math.PI / 2; walkway.receiveShadow = true;
      group.add(walkway);
      var roadRing = ownMesh(new THREE.RingGeometry(walkwayR, rimR, 40), ringMat, 0, 0.012, 0);
      roadRing.rotation.x = -Math.PI / 2; roadRing.receiveShadow = true;
      group.add(roadRing);

      /* sector-boundary streets — thin stone dividers between quarters. */
      var streetMat = new THREE.MeshLambertMaterial({ color: theme === 'dark' ? 0x554f42 : 0xd8cca6 });
      layout.streets.forEach(function (ln) { addRibbon(group, ln.ax, ln.az, ln.bx, ln.bz, streetMat, 0.55, 0.02); });

      /* a few small, static cars on the road ring — real GLBs from the same
         asset pack the Godot app uses, not spinning or animated in any way. */
      var carAngles = [0.3, 1.4, 2.6, 3.7, 4.9];
      var carJobs = carAngles.map(function (a, i) {
        var relPath = POOLS.car[i % POOLS.car.length];
        var radius = (walkwayR + rimR) / 2;
        return loadModel(relPath).then(function (entry) {
          group.add(place(entry, Math.cos(a) * radius, Math.sin(a) * radius, a + Math.PI / 2, 0.5));
        }).catch(function () {});
      });

      /* rocky, tapered underside + a soft-shadowed water surface below it. */
      var rockHeight = plateauR * 0.85;
      var rock = buildRock(rimR, rockHeight, theme);
      rock.position.set(0, -0.3 - rockHeight / 2, 0);
      group.add(rock);
      var waterColor = theme === 'dark' ? 0x0d3a44 : 0x2fb0ad;
      var water = ownMesh(new THREE.CircleGeometry(rimR * 1.3, 32), new THREE.MeshLambertMaterial({ color: waterColor, transparent: true, opacity: 0.88 }), 0, -0.3 - rockHeight - 1.4, 0);
      water.rotation.x = -Math.PI / 2; water.receiveShadow = true;
      group.add(water);

      /* dusk: a few cheap warm point lights stand in for "window glow"
         without touching any material. */
      if (theme === 'dark') {
        [0, 1, 2, 3].forEach(function (i) {
          var a = (Math.PI * 2 / 4) * i + 0.6;
          var glow = new THREE.PointLight(0xffcf8a, 0.65, 12, 2);
          glow.position.set(Math.cos(a) * plateauR * 0.5, 3, Math.sin(a) * plateauR * 0.5);
          group.add(glow);
        });
      }

      /* decorative filler buildings — every plateau cell a real node didn't
         claim, so nothing reads as an empty gap. Smaller than a node
         building and never counted in buildingCount. */
      var decorJobs = layout.decor.map(function (d) {
        /* about a third of filler cells get a tree instead of a building —
           breaks up the packed blocks the way the reference's plateau has
           small gaps of greenery between clusters. */
        var isTree = hashId(d.seed + ':veg') < 0.32;
        var relPath = isTree ? pick(d.seed, POOLS.tree) : pick(d.seed, POOLS.decor);
        var scale = isTree ? DECOR_SCALE * 1.1 : DECOR_SCALE;
        return loadModel(relPath).then(function (entry) {
          var ry = Math.floor(hashId(d.seed + ':rot') * 4) * (Math.PI / 2);
          group.add(place(entry, d.x, d.z, ry, scale));
        }).catch(function () {});
      });

      /* buildings — one per visible node, the only thing counted. */
      var placedCount = 0;
      var buildingJobs = layout.buildings.map(function (b) {
        var relPath, scale;
        if (b.isRoot) { relPath = pick(b.id, POOLS.root); scale = ROOT_SCALE; }
        else if (b.depth === 1) { relPath = pick(b.id, POOLS.landmark); scale = LANDMARK_SCALE; }
        else if (b.node.kind === 'gap') { relPath = pick(b.id, POOLS.gap); scale = NODE_SCALE; }
        else if (b.node.kind === 'question') { relPath = pick(b.id, POOLS.question); scale = NODE_SCALE * 1.1; }
        else { relPath = pick(b.id, POOLS.house); scale = NODE_SCALE; }
        return loadModel(relPath).then(function (entry) {
          var ry = Math.floor(hashId(b.id + ':rot') * 4) * (Math.PI / 2);
          group.add(place(entry, b.x, b.z, ry, scale));
          placedCount++;
        }).catch(function () { /* skip this one lot rather than show a broken box */ });
      });

      await Promise.all(buildingJobs.concat(decorJobs).concat(carJobs));

      cityGroup = group;
      scene.add(group);
      window.__glassCity.buildingCount = placedCount;
      window.__glassCity.rebuilds = (window.__glassCity.rebuilds || 0) + 1;
      window.__glassCity.footprint = rimR;
      var halfExtent = Math.max(rimR * 1.12, 6.5);   /* island fills the reference's ~40-50% of the frame, water visible around it */
      fitShadowFrustum(halfExtent + 4);
      placeCamera(halfExtent);
      /* debug/measurement hook only — not used by the render path itself */
      window.__glassCity.cameraTop = camera.top;
      window.__glassCity.pxPerUnit = world.clientHeight / (2 * camera.top);   /* CSS px per world unit, vertical axis */
      requestRender();
    }

    /* ── parallax: mirrors the picture's own Addendum D behaviour — read
       #world's translate3d(x,y) and drift the camera by a small, clamped
       fraction of it. ────────────────────────────────────────────────── */
    var worldEl = document.getElementById('world');
    if (worldEl) {
      var clamp = function (v) { return Math.max(-40, Math.min(40, v)); };
      var syncParallax = function () {
        var m = /translate3d\((-?[\d.]+)px,\s*(-?[\d.]+)px/.exec(worldEl.style.transform || '');
        var x = m ? parseFloat(m[1]) : 0, y = m ? parseFloat(m[2]) : 0;
        parallax.x = clamp(x * 0.03) * 0.06;   /* world units — a subtle drift, not a pixel-matched one */
        parallax.y = clamp(y * 0.03) * 0.06;
        placeCamera(camera.top);
        requestRender();
      };
      new MutationObserver(syncParallax).observe(worldEl, { attributes: true, attributeFilter: ['style'] });
    }

    /* ── resize ───────────────────────────────────────────────────────── */
    var onResize = debounce(function () { placeCamera(camera.top || 8); requestRender(); }, 150);
    if (window.ResizeObserver) new ResizeObserver(onResize).observe(world);
    else window.addEventListener('resize', onResize);

    /* ── theme change ─────────────────────────────────────────────────── */
    function onThemeMaybeChanged() {
      var t = currentTheme();
      if (t === lastTheme) return;
      lastTheme = t;
      applyLighting(t);
      buildCity();   /* ground colours are theme-dependent too */
    }
    new MutationObserver(onThemeMaybeChanged).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onThemeMaybeChanged); } catch (e) {}

    /* ── map change: wrap the map's own render(), debounced ──────────── */
    var rebuildDebounced = debounce(function () { buildCity(); }, 150);
    var prevRender = window.render;
    if (typeof prevRender === 'function') {
      window.render = function () {
        var r = prevRender.apply(this, arguments);
        rebuildDebounced();
        return r;
      };
    }

    /* ── boot ─────────────────────────────────────────────────────────── */
    window.__glassCity = { buildingCount: 0, rebuilds: 0, ready: false };
    lastTheme = currentTheme();
    applyLighting(lastTheme);
    try {
      await buildCity();
      renderer.render(scene, camera);   /* guarantee one synchronous frame before we hide the picture */
      window.__glassCity.ready = true;
      if (gmCity) gmCity.style.display = 'none';
    } catch (e) {
      /* something failed mid-build — remove our canvas and leave the
         picture exactly as it was, per spec. */
      try { canvas.remove(); style.remove(); } catch (e2) {}
    }
  })();
})();
