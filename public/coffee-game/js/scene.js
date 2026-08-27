// ============================================================
// CafeScene — the MakeRoom-style corner-cutaway café diorama.
// Real Kenney CC0 models (food kit, suburban planter, commercial
// parasol) sit on hand-built flat-colored furniture. Everything
// visual lives here; game.js only calls the public API.
// ============================================================

import * as THREE from 'three';
import { GLTFLoader } from './vendor-bridge.js';
import { RoundedBoxGeometry } from './vendor-bridge.js';

// Kenney-ish pastel palette
const PAL = {
  floor: 0xc9955f, floorAlt: 0xbf8a55, slab: 0x8a5a3b,
  wallBack: 0xf7e8cd, wallSide: 0xefdcbc, wainscot: 0x99d9b5,
  counter: 0x8c5a3c, counterTop: 0xdeb887, counterFront: 0x99d9b5,
  wood: 0x9c6b45, woodDark: 0x77492c,
  metal: 0xb8bec9, metalDark: 0x6d7482, chrome: 0xdfe5ee,
  red: 0xe4574f, cream: 0xfff3dd, mint: 0x99d9b5, pink: 0xff8fb1,
  skin1: 0xf2c9a1, skin2: 0xd9a06b, skin3: 0xa9744f,
  glass: 0xbfe3ef, sky: 0xa3d9ff, leaf: 0x59b06a,
};

const SKINS = [PAL.skin1, PAL.skin2, PAL.skin3];

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.0, ...opts });
}
function rbox(w, h, d, color, r = 0.06, opts = {}) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), mat(color, opts));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function cyl(rt, rb, h, color, seg = 20, opts = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color, opts));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function sph(r, color, opts = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 16), mat(color, opts));
  m.castShadow = true;
  return m;
}

// Canvas-texture helper for signs/boards (RTL text works via ctx.direction)
function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.direction = 'rtl';
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const HEB_FONT = '"Playpen Sans Hebrew", "Heebo", "Arial Hebrew", sans-serif';

export class CafeScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    this.camTarget = new THREE.Vector3(-0.2, 0.9, 0.2);

    this.clock = new THREE.Clock();
    this.models = {};          // loaded GLB scenes by key
    this.peeps = [];           // animated characters
    this.steam = [];           // steam particle sprites
    this.notes = [];           // music note sprites
    this.flyers = [];          // items flying to customers
    this.decorNodes = {};      // built decor by id
    this.brewingCount = 0;
    this.raycaster = new THREE.Raycaster();
    this._pv = new THREE.Vector3();

    this._lights();
    this._room();
    this._furniture();
    this.setMachineLevel(1);
    this.setCaseLevel(0);
    this._barista();
    this._spots();
    this.resize();
  }

  // ---------- assets ----------
  async loadAssets(onProgress) {
    const loader = new GLTFLoader();
    const want = [
      ['cup-coffee', '../models/food/cup-coffee.glb'],
      ['cup-tea', '../models/food/cup-tea.glb'],
      ['frappe', '../models/food/frappe.glb'],
      ['croissant', '../models/food/croissant.glb'],
      ['donut-sprinkles', '../models/food/donut-sprinkles.glb'],
      ['cupcake', '../models/food/cupcake.glb'],
      ['cake', '../models/food/cake.glb'],
      ['waffle', '../models/food/waffle.glb'],
      ['cookie', '../models/food/cookie-chocolate.glb'],
      ['planter', '../models/kenney-suburban/planter.glb'],
      ['parasol', '../kenney/commercial/detail-parasol-a.glb'],
    ];
    let done = 0;
    await Promise.all(want.map(([key, url]) =>
      new Promise((res) => {
        loader.load(url,
          (gltf) => {
            const node = gltf.scene;
            node.traverse((o) => {
              if (o.isMesh) {
                o.castShadow = true; o.receiveShadow = true;
                if (o.material) { o.material.roughness = 0.9; o.material.metalness = 0; }
              }
            });
            this.models[key] = node;
            done++; onProgress && onProgress(done / want.length); res();
          },
          undefined,
          () => { done++; onProgress && onProgress(done / want.length); res(); }  // missing model → primitive fallback later
        );
      })
    ));
  }

  // Clone a model scaled so its largest dimension = size, resting on y=0.
  itemNode(key, size = 0.3) {
    let node;
    if (this.models[key]) {
      node = this.models[key].clone(true);
    } else {
      node = new THREE.Group();
      const box = rbox(0.5, 0.4, 0.5, PAL.wood, 0.1);
      box.position.y = 0.2;
      node.add(box);
    }
    const bb = new THREE.Box3().setFromObject(node);
    const dim = new THREE.Vector3(); bb.getSize(dim);
    const s = size / Math.max(dim.x, dim.y, dim.z, 0.001);
    node.scale.setScalar(s);
    bb.setFromObject(node);
    node.position.y -= bb.min.y;
    const holder = new THREE.Group();
    holder.add(node);
    return holder;
  }

  // ---------- lights & room ----------
  _lights() {
    this.scene.add(new THREE.HemisphereLight(0xfff6e6, 0xc9a486, 0.95));
    const sun = new THREE.DirectionalLight(0xfff1d6, 1.6);
    sun.position.set(6, 10, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1536, 1536);
    const d = 9;
    Object.assign(sun.shadow.camera, { left: -d, right: d, top: d, bottom: -d, near: 1, far: 30 });
    sun.shadow.bias = -0.0004;
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0xcfe8ff, 0.35);
    fill.position.set(-4, 6, 8);
    this.scene.add(fill);
  }

  _room() {
    const room = new THREE.Group();
    this.scene.add(room);

    // thick diorama base slab
    const slab = rbox(11.4, 0.6, 9.4, PAL.slab, 0.12);
    slab.position.y = -0.31;
    room.add(slab);

    // plank floor via striped canvas texture
    const floorTex = canvasTexture(512, 512, (c) => {
      c.fillStyle = '#c9955f'; c.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 8; i++) {
        c.fillStyle = i % 2 ? '#bf8a55' : '#c9955f';
        c.fillRect(0, i * 64, 512, 64);
        c.fillStyle = 'rgba(120,70,30,0.35)';
        c.fillRect(0, i * 64, 512, 3);
      }
    });
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(2, 2);
    const floor = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.1, 8.8), mat(0xffffff, { map: floorTex }));
    floor.position.y = -0.05 + 0.04;
    floor.receiveShadow = true;
    room.add(floor);

    // sidewalk apron by the door (right side)
    const apron = rbox(2.6, 0.12, 4.6, 0xd8cbb6, 0.05);
    apron.position.set(6.2, -0.06, 1.6);
    apron.receiveShadow = true;
    room.add(apron);

    const wallH = 3.6, wallT = 0.34;
    const mBack = mat(PAL.wallBack), mSide = mat(PAL.wallSide);

    // back wall (z = -4.4) built around a window opening x:[1.1,3.3] y:[1.25,2.75]
    const seg = (w, h, x, y, m) => {
      const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, wallT, 2, 0.05), m);
      b.position.set(x, y, -4.4);
      b.castShadow = true; b.receiveShadow = true;
      room.add(b);
    };
    seg(6.5, wallH, -2.15, wallH / 2, mBack);            // left of window
    seg(2.1, wallH, 4.35, wallH / 2, mBack);             // right of window
    seg(2.2, wallH - 2.75, 2.2, 2.75 + (wallH - 2.75) / 2, mBack); // above window
    seg(2.2, 1.25, 2.2, 1.25 / 2, mBack);                // below window (sill wall)

    // window: sky + frame + sill
    const sky = canvasTexture(256, 256, (c) => {
      const g = c.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#8fd0ff'); g.addColorStop(1, '#d8f1ff');
      c.fillStyle = g; c.fillRect(0, 0, 256, 256);
      c.fillStyle = '#ffe58a'; c.beginPath(); c.arc(190, 60, 28, 0, 7); c.fill();
      c.fillStyle = '#ffffffcc';
      [[40, 80, 60, 22], [120, 120, 80, 24]].forEach(([x, y, w, h]) => {
        c.beginPath(); c.roundRect(x, y, w, h, 12); c.fill();
      });
    });
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5), new THREE.MeshBasicMaterial({ map: sky }));
    win.position.set(2.2, 2.0, -4.35);
    room.add(win);
    const frameM = mat(0xffffff);
    [[2.2, 0.1, 2.0 - 0.75], [2.2, 0.1, 2.0 + 0.75]].forEach(([w, h, y]) => {
      const f = new THREE.Mesh(new RoundedBoxGeometry(w + 0.15, h, 0.12, 2, 0.03), frameM);
      f.position.set(2.2, y, -4.2); room.add(f);
    });
    [[2.2 - 1.1, 0], [2.2 + 1.1, 0], [2.2, 0]].forEach(([x], i) => {
      const f = new THREE.Mesh(new RoundedBoxGeometry(i === 2 ? 0.08 : 0.1, 1.6, 0.12, 2, 0.03), frameM);
      f.position.set(x, 2.0, -4.2); room.add(f);
    });
    const sill = rbox(2.5, 0.09, 0.3, 0xffffff, 0.03);
    sill.position.set(2.2, 1.22, -4.15);
    room.add(sill);

    // side wall (x = -5.4)
    const side = new THREE.Mesh(new RoundedBoxGeometry(wallT, wallH, 8.8, 2, 0.05), mSide);
    side.position.set(-5.4, wallH / 2, 0);
    side.castShadow = true; side.receiveShadow = true;
    room.add(side);

    // mint wainscot strips
    const wcB = rbox(10.9, 0.55, 0.06, PAL.wainscot, 0.03);
    wcB.position.set(-0.05, 0.55, -4.2);
    room.add(wcB);
    const wcS = rbox(0.06, 0.55, 8.8, PAL.wainscot, 0.03);
    wcS.position.set(-5.2, 0.55, 0);
    room.add(wcS);

    // menu board on the side wall
    this.menuBoardTex = canvasTexture(512, 640, (c, w, h) => this._drawMenuBoard(c, w, h, []));
    const board = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.1), new THREE.MeshBasicMaterial({ map: this.menuBoardTex }));
    board.rotation.y = Math.PI / 2;
    board.position.set(-5.2, 2.15, -1.6);
    room.add(board);

    // framed picture (coffee cup doodle) on back wall over the counter
    const art = canvasTexture(256, 256, (c) => {
      c.fillStyle = '#fff3dd'; c.fillRect(0, 0, 256, 256);
      c.strokeStyle = '#a9744f'; c.lineWidth = 10;
      c.beginPath(); c.roundRect(58, 92, 110, 92, 16); c.stroke();
      c.beginPath(); c.arc(180, 132, 26, -1.3, 1.3); c.stroke();
      c.beginPath(); c.moveTo(88, 78); c.quadraticCurveTo(96, 58, 88, 44); c.stroke();
      c.beginPath(); c.moveTo(122, 78); c.quadraticCurveTo(130, 58, 122, 44); c.stroke();
    });
    const frame = rbox(0.95, 0.95, 0.07, PAL.woodDark, 0.02);
    frame.position.set(-3.6, 2.45, -4.2);
    room.add(frame);
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({ map: art }));
    pic.position.set(-3.6, 2.45, -4.16);
    room.add(pic);

    // door frame + mat on the right edge
    const doorM = mat(PAL.woodDark);
    const dp = new THREE.Group();
    [[-0.55, 0], [0.55, 0]].forEach(([dx]) => {
      const post = new THREE.Mesh(new RoundedBoxGeometry(0.14, 2.6, 0.14, 2, 0.04), doorM);
      post.position.set(dx, 1.3, 0); post.castShadow = true;
      dp.add(post);
    });
    const lintel = new THREE.Mesh(new RoundedBoxGeometry(1.35, 0.16, 0.16, 2, 0.04), doorM);
    lintel.position.y = 2.66;
    dp.add(lintel);
    dp.position.set(5.05, 0, 2.4);
    dp.rotation.y = -Math.PI / 2;
    room.add(dp);
    // welcome sign hung above the door, angled toward the camera
    const doorSign = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 0.44),
      new THREE.MeshBasicMaterial({
        map: canvasTexture(320, 92, (c, w, h) => {
          c.fillStyle = '#e4574f'; c.beginPath(); c.roundRect(0, 0, w, h, 22); c.fill();
          c.strokeStyle = '#fff3dd'; c.lineWidth = 5; c.beginPath(); c.roundRect(7, 7, w - 14, h - 14, 16); c.stroke();
          c.fillStyle = '#fff'; c.font = `bold 46px ${HEB_FONT}`;
          c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText('ברוכים הבאים!', w / 2, h / 2 + 3);
        }),
        transparent: true, side: THREE.DoubleSide,
      })
    );
    doorSign.scale.setScalar(0.82);
    doorSign.position.set(5.05, 3.1, 2.4);
    doorSign.rotation.y = 0.85;
    room.add(doorSign);
    const matr = cyl(0.55, 0.55, 0.04, 0xd96d55, 24);
    matr.scale.z = 0.7;
    matr.position.set(4.6, 0.03, 2.4);
    room.add(matr);
  }

  _drawMenuBoard(c, w, h, items) {
    c.fillStyle = '#3d3a35'; c.beginPath(); c.roundRect(0, 0, w, h, 26); c.fill();
    c.strokeStyle = '#9c6b45'; c.lineWidth = 14; c.beginPath(); c.roundRect(8, 8, w - 16, h - 16, 20); c.stroke();
    c.fillStyle = '#fff3dd'; c.textAlign = 'center'; c.direction = 'rtl';
    c.font = `bold 58px ${HEB_FONT}`;
    c.fillText('☕ התפריט ☕', w / 2, 86);
    c.strokeStyle = '#fff3dd55'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(60, 112); c.lineTo(w - 60, 112); c.stroke();
    c.font = `36px ${HEB_FONT}`;
    if (!items.length) {
      c.fillStyle = '#fff3dd99';
      c.fillText('בקרוב...', w / 2, 200);
    }
    items.slice(0, 8).forEach((it, i) => {
      const y = 170 + i * 58;
      c.textAlign = 'right'; c.fillStyle = '#fff3dd';
      c.fillText(`${it.emoji} ${it.name}`, w - 48, y);
      c.textAlign = 'left'; c.fillStyle = '#ffd79a';
      c.fillText(`₪${it.price}`, 48, y);
    });
  }

  updateMenuBoard(items) {
    const c = this.menuBoardTex.image.getContext('2d');
    c.clearRect(0, 0, 512, 640);
    this._drawMenuBoard(c, 512, 640, items);
    this.menuBoardTex.needsUpdate = true;
  }

  // ---------- furniture ----------
  _furniture() {
    const g = new THREE.Group();
    this.scene.add(g);

    // counter run along the back wall
    const base = rbox(5.2, 0.92, 1.05, PAL.counter, 0.07);
    base.position.set(-2.1, 0.46, -2.45);
    g.add(base);
    const front = rbox(5.2, 0.6, 0.08, PAL.counterFront, 0.03);
    front.position.set(-2.1, 0.45, -1.9);
    g.add(front);
    const top = rbox(5.55, 0.1, 1.3, PAL.counterTop, 0.04);
    top.position.set(-2.1, 0.97, -2.45);
    g.add(top);
    this.counterTopY = 1.02;

    // register near the queue head
    const reg = new THREE.Group();
    const regBody = rbox(0.42, 0.3, 0.34, 0x5c6470, 0.05);
    regBody.position.y = 0.15;
    reg.add(regBody);
    const screen = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.24, 0.04, 2, 0.02), mat(0x2b303b, { emissive: 0x8fffcf, emissiveIntensity: 0.35 }));
    screen.position.set(0, 0.38, 0.02);
    screen.rotation.x = -0.35;
    reg.add(screen);
    reg.position.set(-0.4, this.counterTopY, -2.3);
    g.add(reg);

    // shelf on side wall with coffee bags & jars
    const shelf = rbox(0.28, 0.08, 2.4, PAL.wood, 0.03);
    shelf.position.set(-5.05, 2.6, 1.6);
    g.add(shelf);
    for (let i = 0; i < 3; i++) {
      const bag = rbox(0.26, 0.4, 0.3, [0x8c5a3c, 0xe4574f, 0x54c6a9][i], 0.07);
      bag.position.set(-5.05, 2.85, 0.8 + i * 0.65);
      bag.rotation.y = 0.15 * (i - 1);
      g.add(bag);
      const tie = sph(0.09, PAL.cream);
      tie.position.set(-5.05, 3.07, 0.8 + i * 0.65);
      tie.scale.y = 0.55;
      g.add(tie);
    }

    // two café tables + stools, front-left
    this.tables = [];
    [[-3.6, 1.5], [-1.9, 3.1]].forEach(([x, z], ti) => {
      const t = new THREE.Group();
      const leg = cyl(0.07, 0.1, 0.72, PAL.metalDark, 12);
      leg.position.y = 0.36;
      t.add(leg);
      const foot = cyl(0.3, 0.34, 0.05, PAL.metalDark, 16);
      foot.position.y = 0.03;
      t.add(foot);
      const tt = cyl(0.62, 0.62, 0.08, ti ? PAL.mint : PAL.counterTop, 24);
      tt.position.y = 0.78;
      t.add(tt);
      t.position.set(x, 0, z);
      g.add(t);
      const seats = [];
      [[0.95, 0.35], [-0.6, 0.85]].forEach(([dx, dz]) => {
        const st = new THREE.Group();
        const sl = cyl(0.06, 0.08, 0.42, PAL.wood, 10);
        sl.position.y = 0.21;
        st.add(sl);
        const sc = cyl(0.24, 0.24, 0.08, PAL.red, 16);
        sc.position.y = 0.46;
        st.add(sc);
        st.position.set(x + dx, 0, z + dz);
        g.add(st);
        seats.push({ x: x + dx, z: z + dz, taken: false, table: { x, z } });
      });
      this.tables.push({ x, z, y: 0.82, seats, node: t });
    });
    this.seatList = this.tables.flatMap((t) => t.seats);
  }

  // Espresso machine, rebuilt per level (bigger & shinier as it grows)
  setMachineLevel(level) {
    if (this.machineNode) this.scene.remove(this.machineNode);
    const lv = Math.max(1, level);
    const g = new THREE.Group();
    const W = 0.9 + lv * 0.28;
    const bodyCol = [0xcabfae, 0xe4574f, 0x3d3a4a][Math.min(lv - 1, 2)];
    const body = rbox(W, 0.62, 0.62, bodyCol, 0.08);
    body.position.y = 0.5;
    g.add(body);
    const topTank = rbox(W * 0.92, 0.16, 0.5, PAL.chrome, 0.05, { metalness: 0.6, roughness: 0.35 });
    topTank.position.y = 0.88;
    g.add(topTank);
    // colored accent stripe so the machine reads as A Machine
    const stripe = rbox(W + 0.02, 0.14, 0.63, lv >= 2 ? 0xffd76b : PAL.red, 0.04);
    stripe.position.set(0, 0.68, 0);
    g.add(stripe);
    // drip tray shelf sticking out the front
    const tray = rbox(W * 0.9, 0.05, 0.3, PAL.metalDark, 0.02, { metalness: 0.5, roughness: 0.4 });
    tray.position.set(0, 0.05, 0.42);
    g.add(tray);
    const slots = [1, 1, 2, 3][Math.min(lv, 3)];
    for (let i = 0; i < slots; i++) {
      const x = (i - (slots - 1) / 2) * (W / Math.max(slots, 1)) * 0.72;
      const grp = cyl(0.1, 0.12, 0.2, 0x3a3f4a, 14);
      grp.position.set(x, 0.29, 0.36);
      g.add(grp);
      const handle = rbox(0.07, 0.07, 0.26, PAL.woodDark, 0.02);
      handle.position.set(x, 0.29, 0.52);
      g.add(handle);
      const cup = cyl(0.085, 0.065, 0.13, PAL.cream, 14);
      cup.position.set(x, 0.14, 0.36);
      g.add(cup);
    }
    // steam gauge + wand for character
    const gauge = cyl(0.09, 0.09, 0.03, PAL.cream, 14);
    gauge.rotation.x = Math.PI / 2;
    gauge.position.set(-W / 2 + 0.16, 0.52, 0.32);
    g.add(gauge);
    const wand = cyl(0.025, 0.025, 0.4, PAL.chrome, 8, { metalness: 0.7, roughness: 0.3 });
    wand.position.set(W / 2 + 0.06, 0.42, 0.18);
    wand.rotation.z = 0.5;
    g.add(wand);
    if (lv >= 3) {
      const eagle = sph(0.09, 0xffd76b, { metalness: 0.5, roughness: 0.4 });
      eagle.position.y = 1.02;
      g.add(eagle);
    }
    g.position.set(-3.35, this.counterTopY || 1.02, -2.62);
    this.scene.add(g);
    this.machineNode = g;
    this.machinePos = new THREE.Vector3(-3.35, 1.65, -2.3);
  }

  // Pastry display case, rebuilt per level, filled with real Kenney pastries
  setCaseLevel(level) {
    if (this.caseNode) this.scene.remove(this.caseNode);
    const g = new THREE.Group();
    if (level >= 1) {
      const base = rbox(1.7, 0.9, 1.0, PAL.wood, 0.06);
      base.position.y = 0.45;
      g.add(base);
      const glass = new THREE.Mesh(
        new RoundedBoxGeometry(1.6, 0.75, 0.9, 2, 0.06),
        new THREE.MeshStandardMaterial({ color: PAL.glass, transparent: true, opacity: 0.22, roughness: 0.15 })
      );
      glass.position.y = 1.28;
      g.add(glass);
      const shelfM = rbox(1.55, 0.05, 0.85, PAL.counterTop, 0.02);
      shelfM.position.y = 0.93;
      g.add(shelfM);
      const goods = [
        ['croissant', 1], ['donut-sprinkles', 1],
        ['cupcake', 2], ['cake', 2],
        ['waffle', 3],
      ].filter(([, lvl]) => level >= lvl);
      goods.forEach(([key], i) => {
        const it = this.itemNode(key, key === 'cake' ? 0.4 : 0.28);
        const col = i % 3, row = Math.floor(i / 3);
        it.position.set(-0.52 + col * 0.52, 0.97, -0.2 + row * 0.42);
        it.rotation.y = Math.random() * Math.PI;
        g.add(it);
      });
      if (level >= 3) {
        // signature-waffle sign hangs on the wall above the case
        const crown = new THREE.Mesh(
          new THREE.PlaneGeometry(1.3, 0.4),
          new THREE.MeshBasicMaterial({
            map: canvasTexture(300, 92, (c, w, h) => {
              c.fillStyle = '#ffd76b'; c.beginPath(); c.roundRect(0, 0, w, h, 22); c.fill();
              c.strokeStyle = '#6f4e37'; c.lineWidth = 6; c.beginPath(); c.roundRect(5, 5, w - 10, h - 10, 18); c.stroke();
              c.fillStyle = '#6f4e37'; c.font = `bold 44px ${HEB_FONT}`;
              c.textAlign = 'center'; c.textBaseline = 'middle';
              c.fillText('🧇 הוופל האגדי', w / 2, h / 2 + 2);
            }),
            transparent: true,
          })
        );
        crown.position.set(0, 2.5, -1.68);
        g.add(crown);
      }
    }
    g.position.set(1.6, 0, -2.5);
    this.scene.add(g);
    this.caseNode = g;
    this.casePos = new THREE.Vector3(1.6, 1.6, -2.2);
  }

  // ---------- characters ----------
  _peepNode({ body = 0xff9a76, hat = 'none', skin }) {
    const g = new THREE.Group();
    const s = skin ?? SKINS[Math.floor(Math.random() * SKINS.length)];
    const bod = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.34, 6, 14), mat(body));
    bod.position.y = 0.48;
    bod.castShadow = true;
    g.add(bod);
    const head = sph(0.2, s);
    head.position.y = 1.02;
    g.add(head);
    // little face
    const eyeM = new THREE.MeshBasicMaterial({ color: 0x2b2b2b });
    [-0.075, 0.075].forEach((dx) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.023, 8, 8), eyeM);
      eye.position.set(dx, 1.06, 0.18);
      g.add(eye);
    });
    const blushM = new THREE.MeshBasicMaterial({ color: 0xff9a90, transparent: true, opacity: 0.55 });
    [-0.13, 0.13].forEach((dx) => {
      const b = new THREE.Mesh(new THREE.CircleGeometry(0.03, 10), blushM);
      b.position.set(dx, 1.0, 0.185);
      g.add(b);
    });
    // hats & hair
    const hatCol = 0x4a4a55;
    if (hat === 'beanie') {
      const h = sph(0.2, 0xc9553e); h.scale.y = 0.62; h.position.y = 1.14; g.add(h);
      const pom = sph(0.06, PAL.cream); pom.position.y = 1.3; g.add(pom);
    } else if (hat === 'bun') {
      const h = sph(0.2, 0xdedede); h.scale.y = 0.55; h.position.y = 1.14; g.add(h);
      const bun = sph(0.09, 0xdedede); bun.position.set(0, 1.24, -0.1); g.add(bun);
    } else if (hat === 'messybun') {
      const h = sph(0.2, 0x6f4e37); h.scale.y = 0.55; h.position.y = 1.14; g.add(h);
      const bun = sph(0.1, 0x6f4e37); bun.position.set(0.06, 1.27, -0.06); g.add(bun);
    } else if (hat === 'cap') {
      const h = sph(0.21, PAL.pink); h.scale.y = 0.5; h.position.y = 1.15; g.add(h);
      const brim = cyl(0.14, 0.14, 0.03, PAL.pink, 14);
      brim.position.set(0, 1.12, 0.2); g.add(brim);
    } else if (hat === 'headphones') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 20, Math.PI), mat(hatCol));
      band.position.y = 1.05; band.rotation.z = 0; g.add(band);
      [-0.2, 0.2].forEach((dx) => {
        const pad = cyl(0.07, 0.07, 0.05, hatCol, 10);
        pad.rotation.z = Math.PI / 2;
        pad.position.set(dx, 1.02, 0); g.add(pad);
      });
    } else if (hat === 'sunhat') {
      const h = cyl(0.16, 0.18, 0.12, 0xf2d98c, 14); h.position.y = 1.2; g.add(h);
      const brim = cyl(0.3, 0.32, 0.03, 0xf2d98c, 18); brim.position.y = 1.14; g.add(brim);
    } else if (hat === 'fedora') {
      const h = cyl(0.13, 0.15, 0.14, 0x2e2b38, 14); h.position.y = 1.21; g.add(h);
      const brim = cyl(0.26, 0.28, 0.03, 0x2e2b38, 18); brim.position.y = 1.13; g.add(brim);
    }
    // invisible pick target (fat, easy to tap)
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.5, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 0.7;
    g.add(hit);
    g.userData.hit = hit;
    return g;
  }

  createPeep(opts = {}) {
    const node = this._peepNode(opts);
    node.position.copy(opts.at || new THREE.Vector3(8, 0, 2.4));
    this.scene.add(node);
    const peep = {
      node, speed: opts.speed || 2.6,
      target: null, onArrive: null,
      bobT: Math.random() * 10, walking: false,
      shakeT: 0, jumpT: 0, gone: false,
      userData: opts.userData || {},
    };
    this.peeps.push(peep);
    return peep;
  }

  walkTo(peep, pos, cb) {
    peep.target = pos.clone ? pos.clone() : new THREE.Vector3(pos.x, 0, pos.z);
    peep.target.y = 0;
    peep.onArrive = cb || null;
    peep.walking = true;
  }

  removePeep(peep) {
    peep.gone = true;
    this.scene.remove(peep.node);
    const i = this.peeps.indexOf(peep);
    if (i >= 0) this.peeps.splice(i, 1);
  }

  shake(peep) { peep.shakeT = 0.6; }
  jump(peep) { peep.jumpT = 0.5; }

  headPos(peep) {
    this._pv.copy(peep.node.position);
    this._pv.y += 1.55;
    return this._pv;
  }

  // barista behind the counter (+ optional hired staff)
  _barista() {
    this.barista = this.createPeep({ body: 0x6f4e37, hat: 'none', skin: PAL.skin1, at: new THREE.Vector3(-1.2, 0, -3.3) });
    const apron = rbox(0.34, 0.4, 0.06, PAL.cream, 0.03);
    apron.position.set(0, 0.5, 0.2);
    this.barista.node.add(apron);
    this.barista.node.rotation.y = 0;  // faces +z (the room)
  }

  setStaff({ tom = false, cat = false } = {}) {
    if (tom && !this.tomNode) {
      const p = this.createPeep({ body: 0x54c6a9, hat: 'beanie', at: new THREE.Vector3(-3.0, 0, -3.3) });
      const apron = rbox(0.34, 0.4, 0.06, 0x3d3a4a, 0.03);
      apron.position.set(0, 0.5, 0.2);
      p.node.add(apron);
      this.tomNode = p;
    }
    if (cat && !this.catNode) {
      const g = new THREE.Group();
      const body = sph(0.16, 0xe8a13c); body.scale.set(1, 0.85, 1.25); body.position.y = 0.13; g.add(body);
      const head = sph(0.13, 0xe8a13c); head.position.set(0, 0.3, 0.14); g.add(head);
      [-0.07, 0.07].forEach((dx) => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.09, 8), mat(0xe8a13c));
        ear.position.set(dx, 0.42, 0.12); g.add(ear);
      });
      const eyeM = new THREE.MeshBasicMaterial({ color: 0x2b2b2b });
      [-0.05, 0.05].forEach((dx) => {
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), eyeM);
        e.position.set(dx, 0.32, 0.26); g.add(e);
      });
      this.catTail = cyl(0.025, 0.04, 0.3, 0xe8a13c, 8);
      this.catTail.position.set(0, 0.2, -0.2);
      this.catTail.rotation.x = 0.9;
      g.add(this.catTail);
      g.position.set(0.35, this.counterTopY, -2.55);
      g.rotation.y = 0.5;
      g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      this.scene.add(g);
      this.catNode = g;
    }
  }

  // ---------- queue / seats geometry ----------
  _spots() {
    this.queueSpots = [];
    for (let i = 0; i < 6; i++) {
      this.queueSpots.push(new THREE.Vector3(-0.85 + i * 1.18, 0, -1.15 + i * 0.74));
    }
    this.doorPos = new THREE.Vector3(5.5, 0, 2.4);
    this.spawnPos = new THREE.Vector3(7.4, 0, 2.4);
  }

  freeSeat() {
    const open = this.seatList.filter((s) => !s.taken);
    if (!open.length) return null;
    return open[Math.floor(Math.random() * open.length)];
  }

  placeCupOnTable(seat, itemKey) {
    const it = this.itemNode(itemKey || 'cup-coffee', 0.24);
    it.position.set(seat.table.x + (Math.random() - 0.5) * 0.4, 0.82, seat.table.z + (Math.random() - 0.5) * 0.4);
    this.scene.add(it);
    return it;
  }

  // ---------- decor ----------
  addDecor(id) {
    if (this.decorNodes[id]) return;
    const g = new THREE.Group();
    switch (id) {
      case 'plant': {
        const pot = this.itemNode('planter', 0.75);
        if (!this.models.planter) { pot.clear(); const p = cyl(0.28, 0.2, 0.4, 0xc9553e, 14); p.position.y = 0.2; pot.add(p); }
        g.add(pot);
        [[0, 0.75, 0, 0.3], [-0.18, 0.62, 0.1, 0.22], [0.16, 0.66, -0.08, 0.24], [0.02, 0.95, 0.05, 0.2]].forEach(([x, y, z, r]) => {
          const leaf = sph(r, PAL.leaf); leaf.position.set(x, y, z); g.add(leaf);
        });
        g.position.set(-4.6, 0, 3.4);
        break;
      }
      case 'rug': {
        const rug = cyl(1.5, 1.5, 0.04, 0xe08a4e, 28);
        rug.receiveShadow = true;
        const ring = cyl(1.1, 1.1, 0.045, 0xc9553e, 28);
        const dot = cyl(0.45, 0.45, 0.05, PAL.cream, 20);
        g.add(rug, ring, dot);
        g.position.set(0.4, 0.06, 0.9);
        g.scale.z = 0.8;
        break;
      }
      case 'waffleclock': {
        const w = this.itemNode('waffle', 1.0);
        w.rotation.x = Math.PI / 2;
        w.position.set(0, 0, 0.1);
        g.add(w);
        const hands = new THREE.Group();
        const h1 = rbox(0.05, 0.34, 0.03, 0x2b2b2b, 0.01); h1.position.y = 0.15;
        const h2 = rbox(0.04, 0.24, 0.03, 0xc9553e, 0.01); h2.position.y = 0.1; h2.rotation.z = 1.9;
        hands.add(h1, h2);
        hands.position.z = 0.16;
        g.add(hands);
        this.clockHands = hands;
        g.position.set(0.45, 2.6, -4.18);
        break;
      }
      case 'lights': {
        const pts = [];
        for (let i = 0; i <= 14; i++) {
          const t = i / 14;
          const x = -5 + t * 10;
          const y = 3.3 - Math.sin(t * Math.PI) * 0.55;
          pts.push(new THREE.Vector3(x, y, -4.05));
        }
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({ color: 0x6d5b44 })
        );
        g.add(line);
        this.bulbs = [];
        pts.forEach((p, i) => {
          if (i % 2 === 0) return;
          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10),
            new THREE.MeshBasicMaterial({ color: [0xffd76b, 0xff8fb1, 0x99d9b5, 0xa3d9ff][i % 4] }));
          bulb.position.copy(p).add(new THREE.Vector3(0, -0.09, 0));
          g.add(bulb);
          this.bulbs.push(bulb);
        });
        break;
      }
      case 'gramophone': {
        const box = rbox(0.5, 0.3, 0.5, PAL.woodDark, 0.05);
        box.position.y = 0.15;
        g.add(box);
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.55, 18, 1, true), mat(0xffd76b, { side: THREE.DoubleSide, metalness: 0.4, roughness: 0.5 }));
        horn.rotation.z = -1.1;
        horn.position.set(0.18, 0.62, 0);
        g.add(horn);
        const disc = cyl(0.18, 0.18, 0.02, 0x2b2b2b, 20);
        disc.position.set(-0.08, 0.32, 0);
        g.add(disc);
        g.position.set(-4.9, 0.92, 3.0);
        const stand = rbox(0.7, 0.92, 0.7, PAL.wood, 0.05);
        stand.position.set(-4.9, 0.46, 3.0);
        this.scene.add(stand);
        this.decorNodes['gramophone-stand'] = stand;
        this.gramophonePos = new THREE.Vector3(-4.9, 1.6, 3.0);
        break;
      }
      case 'parasol': {
        const pl = this.itemNode('parasol', 2.6);
        if (!this.models.parasol) {
          pl.clear();
          const pole = cyl(0.04, 0.04, 2.2, PAL.metalDark, 8); pole.position.y = 1.1; pl.add(pole);
          const top = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.5, 10), mat(PAL.red)); top.position.y = 2.2; pl.add(top);
        }
        g.add(pl);
        const table = cyl(0.5, 0.5, 0.06, PAL.cream, 18);
        table.position.y = 0.75;
        const tleg = cyl(0.05, 0.08, 0.75, PAL.metalDark, 10);
        tleg.position.y = 0.37;
        g.add(table, tleg);
        const cup = this.itemNode('cup-coffee', 0.2);
        cup.position.y = 0.78;
        g.add(cup);
        g.position.set(6.15, 0, 1.4);
        break;
      }
      case 'neon': {
        const plaque = rbox(2.0, 1.0, 0.08, 0x2e2b38, 0.08);
        plaque.position.set(-1.7, 2.7, -4.19);
        g.add(plaque);
        const tex = canvasTexture(512, 256, (c, w, h) => {
          c.font = `bold 150px ${HEB_FONT}`;
          c.textAlign = 'center'; c.textBaseline = 'middle';
          c.shadowColor = '#ff5fa2'; c.shadowBlur = 45;
          c.strokeStyle = '#ffb8d9'; c.lineWidth = 10;
          c.strokeText('קפה', w / 2, h / 2);
          c.shadowBlur = 0;
          c.fillStyle = '#fff0f7';
          c.fillText('קפה', w / 2, h / 2);
        });
        this.neonMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.95), this.neonMat);
        sign.position.set(-1.7, 2.7, -4.13);
        g.add(sign);
        break;
      }
    }
    this.scene.add(g);
    this.decorNodes[id] = g;
  }

  // ---------- effects ----------
  _steamTex() {
    if (!this.__steamTex) {
      this.__steamTex = canvasTexture(64, 64, (c) => {
        const g = c.createRadialGradient(32, 32, 4, 32, 32, 30);
        g.addColorStop(0, 'rgba(255,255,255,0.9)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.fillRect(0, 0, 64, 64);
      });
    }
    return this.__steamTex;
  }

  puffSteam(origin) {
    for (let i = 0; i < 3; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this._steamTex(), transparent: true, opacity: 0.85, depthWrite: false }));
      sp.position.copy(origin).add(new THREE.Vector3((Math.random() - 0.5) * 0.3, Math.random() * 0.1, (Math.random() - 0.5) * 0.2));
      const s = 0.2 + Math.random() * 0.2;
      sp.scale.set(s, s, 1);
      this.scene.add(sp);
      this.steam.push({ sp, vy: 0.5 + Math.random() * 0.4, life: 1.2, t: 0, sway: Math.random() * 6 });
    }
  }

  puffNote(origin) {
    if (!this.__noteTex) {
      this.__noteTex = canvasTexture(64, 64, (c) => {
        c.font = 'bold 48px serif';
        c.fillStyle = '#6f4e37';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('♪', 32, 34);
      });
    }
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.__noteTex, transparent: true, depthWrite: false }));
    sp.position.copy(origin);
    sp.scale.set(0.3, 0.3, 1);
    this.scene.add(sp);
    this.notes.push({ sp, t: 0, life: 1.6, x: origin.x });
  }

  // Fly a served item from a station to the customer, then poof.
  flyServe(itemKey, fromStation, peep, done) {
    const from = fromStation === 'case' ? this.casePos : this.machinePos;
    const it = this.itemNode(itemKey, 0.3);
    it.position.copy(from);
    this.scene.add(it);
    this.flyers.push({ it, from: from.clone(), peep, t: 0, dur: 0.6, done });
  }

  // ---------- picking / projection ----------
  pick(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * 2 - 1;
    const y = -((clientY - r.top) / r.height) * 2 + 1;
    this.raycaster.setFromCamera({ x, y }, this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    for (const h of hits) {
      let o = h.object;
      while (o) {
        const peep = this.peeps.find((p) => p.node === o);
        if (peep) return { type: 'peep', peep };
        if (this.machineNode === o) return { type: 'machine' };
        if (this.decorNodes.waffleclock === o) return { type: 'waffleclock' };
        o = o.parent;
      }
    }
    return null;
  }

  toScreen(v3) {
    const v = v3.clone().project(this.camera);
    const r = this.canvas.getBoundingClientRect();
    return {
      x: (v.x * 0.5 + 0.5) * r.width + r.left,
      y: (-v.y * 0.5 + 0.5) * r.height + r.top,
      visible: v.z < 1,
    };
  }

  // ---------- frame update ----------
  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    this.camera.aspect = aspect;
    // pull back on narrow screens so the room still fits, and aim a
    // touch lower so portrait doesn't leave a big empty apron below
    const k = THREE.MathUtils.clamp(1.15 / Math.max(aspect, 0.01), 1, 2.05);
    this.camera.position.set(8.6 * k, 7.4 * k, 9.8 * k);
    const target = this.camTarget.clone();
    if (aspect < 0.8) { target.y += 1.1; target.z += 0.3; }
    this.camera.lookAt(target);
    this.camera.updateProjectionMatrix();
  }

  update() {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = this.clock.elapsedTime;

    // peeps: walking + bobbing + emotes
    for (const p of this.peeps) {
      p.bobT += dt * (p.walking ? 11 : 3.2);
      const bob = p.walking ? Math.abs(Math.sin(p.bobT)) * 0.09 : Math.sin(p.bobT) * 0.02;
      if (p.walking && p.target) {
        const d = new THREE.Vector3().subVectors(p.target, p.node.position);
        d.y = 0;
        const dist = d.length();
        if (dist < 0.06) {
          p.walking = false;
          p.node.position.x = p.target.x;
          p.node.position.z = p.target.z;
          const cb = p.onArrive; p.onArrive = null;
          cb && cb();
        } else {
          d.normalize();
          p.node.position.addScaledVector(d, Math.min(p.speed * dt, dist));
          const ang = Math.atan2(d.x, d.z);
          p.node.rotation.y += (ang - p.node.rotation.y) * Math.min(1, dt * 10);
        }
      } else if (!p.walking && p.faceTarget) {
        p.node.rotation.y += (p.faceTarget - p.node.rotation.y) * Math.min(1, dt * 6);
      }
      let y = bob;
      if (p.jumpT > 0) { p.jumpT -= dt; y += Math.sin((1 - p.jumpT / 0.5) * Math.PI) * 0.35; }
      p.node.position.y = y;
      if (p.shakeT > 0) {
        p.shakeT -= dt;
        p.node.rotation.z = Math.sin(t * 55) * 0.09 * (p.shakeT / 0.6);
      } else {
        p.node.rotation.z = 0;
      }
    }

    // machine steam while brewing
    if (this.brewingCount > 0 && Math.random() < dt * 8) this.puffSteam(this.machinePos);

    // gramophone notes
    if (this.decorNodes.gramophone && Math.random() < dt * 0.8) this.puffNote(this.gramophonePos);

    // steam particles
    for (let i = this.steam.length - 1; i >= 0; i--) {
      const s = this.steam[i];
      s.t += dt;
      s.sp.position.y += s.vy * dt;
      s.sp.position.x += Math.sin(t * 3 + s.sway) * dt * 0.15;
      s.sp.material.opacity = Math.max(0, 0.85 * (1 - s.t / s.life));
      s.sp.scale.multiplyScalar(1 + dt * 0.8);
      if (s.t >= s.life) { this.scene.remove(s.sp); this.steam.splice(i, 1); }
    }
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const n = this.notes[i];
      n.t += dt;
      n.sp.position.y += dt * 0.55;
      n.sp.position.x = n.x + Math.sin(n.t * 4) * 0.15;
      n.sp.material.opacity = Math.max(0, 1 - n.t / n.life);
      if (n.t >= n.life) { this.scene.remove(n.sp); this.notes.splice(i, 1); }
    }

    // flying served items (little arc)
    for (let i = this.flyers.length - 1; i >= 0; i--) {
      const f = this.flyers[i];
      f.t += dt;
      const k = Math.min(1, f.t / f.dur);
      const target = f.peep.node.position.clone().setY(1.1);
      f.it.position.lerpVectors(f.from, target, k);
      f.it.position.y += Math.sin(k * Math.PI) * 0.9;
      f.it.rotation.y += dt * 6;
      if (k >= 1) {
        this.scene.remove(f.it);
        this.flyers.splice(i, 1);
        f.done && f.done();
      }
    }

    // ambient decor animation
    if (this.clockHands) this.clockHands.rotation.z -= dt * 0.5;
    if (this.neonMat) this.neonMat.opacity = 0.75 + Math.sin(t * 2.2) * 0.15 + (Math.sin(t * 13) > 0.96 ? -0.3 : 0);
    if (this.bulbs) this.bulbs.forEach((b, i) => { b.material.color.offsetHSL(0, 0, 0); b.scale.setScalar(1 + Math.sin(t * 3 + i) * 0.12); });
    if (this.catTail) this.catTail.rotation.x = 0.9 + Math.sin(t * 2.5) * 0.25;
    if (this.catNode) this.catNode.position.y = this.counterTopY + Math.abs(Math.sin(t * 1.4)) * 0.02;

    this.renderer.render(this.scene, this.camera);
    return dt;
  }
}
