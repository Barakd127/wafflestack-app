// ============================================================
// game.js — state, customer lifecycle, economy, DOM UI.
// The 3D world is CafeScene (scene.js); content is data.js.
// ============================================================

import { CafeScene } from './scene.js';
import { sfx, setMuted, isMuted } from './audio.js';
import {
  MENU, PERSONAS, UPGRADES, STAFF, DECOR,
  REVIEWS, HINTS, STAR_THRESHOLD_LINES, unlockedMenu,
} from './data.js';

const SAVE_KEY = 'seize-habul-save-v1';
const $ = (sel) => document.querySelector(sel);

// ---------------- state ----------------
const state = {
  coins: 20,
  rep: 0,
  upgrades: { machine: 1, case: 0 },
  staff: { tom: false, cat: false },
  decor: [],
  stats: { served: 0, walkouts: 0, earned: 0 },
  hintsSeen: 0,
  muted: false,
};

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* private mode etc. */ }
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    Object.assign(state, s, {
      upgrades: { ...state.upgrades, ...s.upgrades },
      staff: { ...state.staff, ...s.staff },
      stats: { ...state.stats, ...s.stats },
    });
    return true;
  } catch (e) { return false; }
}
const hasSave = load();

function ambience() {
  let a = 0;
  for (const id of state.decor) {
    const d = DECOR.find((x) => x.id === id);
    if (d) a += d.ambience;
  }
  if (state.staff.cat) a += STAFF.find((s) => s.id === 'cat').ambience || 0;
  return a;
}

// ---------------- scene ----------------
const canvas = $('#scene');
const scene = new CafeScene(canvas);
window.addEventListener('resize', () => scene.resize());

// ---------------- customers ----------------
const customers = [];      // active customer objects
const brews = [];          // active brews: {cust, item, t, total, station}
let spawnT = 3;            // first customer comes fast
let baristaT = { tom: 0, cat: 0 };
let reviewT = 40;
let hintT = 4;
let running = false;

function spawnInterval() {
  const k = state.rep / 5;
  return (9 - 5.6 * k) * (0.75 + Math.random() * 0.5);
}

function pickPersona() {
  const pool = PERSONAS.filter((p) => state.rep >= p.minRep);
  const total = pool.reduce((s, p) => s + p.rarity, 0);
  let r = Math.random() * total;
  for (const p of pool) { r -= p.rarity; if (r <= 0) return p; }
  return pool[0];
}

function pickItem(persona) {
  const open = unlockedMenu(state);
  const prefs = persona.prefers.filter((id) => open.includes(id));
  const from = prefs.length ? prefs : open;
  return MENU[from[Math.floor(Math.random() * from.length)]];
}

function line(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function spawnCustomer() {
  if (customers.filter((c) => ['entering', 'queued', 'brewing'].includes(c.state)).length >= 6) return;
  const persona = pickPersona();
  const item = pickItem(persona);
  const qty = persona.doubleOrder ? 2 : 1;
  const peep = scene.createPeep({ body: persona.body, hat: persona.hat, at: scene.spawnPos });
  const patienceMax = persona.patience * (1 + ambience() * 0.05);
  const cust = {
    persona, item, qty, peep,
    state: 'entering',
    patience: patienceMax, patienceMax,
    bubble: makeBubble(persona, item, qty),
    saidLine: line(persona.order),
  };
  customers.push(cust);
  sfx.pop();
  const spot = queueSpot(queueIndex());
  scene.walkTo(peep, scene.doorPos, () => {
    scene.walkTo(peep, spot, () => {
      cust.state = 'queued';
      peep.faceTarget = Math.PI;   // face the counter
      speech(cust, cust.saidLine);
    });
  });
  cust.state = 'entering';
  layoutQueue();
}

function queueIndex() {
  return customers.filter((c) => ['entering', 'queued', 'brewing'].includes(c.state)).length - 1;
}

function queueSpot(i) {
  return scene.queueSpots[Math.max(0, Math.min(i, scene.queueSpots.length - 1))];
}

function layoutQueue() {
  const inQueue = customers.filter((c) => ['entering', 'queued', 'brewing'].includes(c.state));
  inQueue.forEach((c, i) => {
    if (c.state === 'entering') return;  // still walking in; spot assigned on arrive
    const spot = queueSpot(i);
    if (c.peep.node.position.distanceTo(spot) > 0.1) {
      scene.walkTo(c.peep, spot, () => { c.peep.faceTarget = Math.PI; });
    }
  });
}

// bubbles -------------------------------------------------------
const bubblesEl = $('#bubbles');

function makeBubble(persona, item, qty) {
  const el = document.createElement('button');
  el.className = 'bubble' + (persona.id === 'critic' ? ' critic' : '');
  el.innerHTML = `
    <span class="b-emoji">${item.emoji}${qty > 1 ? '<b class="b-qty">×2</b>' : ''}</span>
    <span class="b-ring"></span>
    <span class="b-name">${persona.name}</span>
    <span class="b-patience"><i></i></span>`;
  bubblesEl.appendChild(el);
  return el;
}

function speech(cust, text, ms = 3200) {
  const el = document.createElement('div');
  el.className = 'speech';
  el.textContent = text;
  bubblesEl.appendChild(el);
  cust.speechEl = el;
  setTimeout(() => { el.classList.add('bye'); setTimeout(() => el.remove(), 400); if (cust.speechEl === el) cust.speechEl = null; }, ms);
}

function positionBubbles() {
  const w = window.innerWidth;
  for (const c of customers) {
    const p = scene.toScreen(scene.headPos(c.peep));
    if (c.bubble) {
      c.bubble.style.transform = `translate(${p.x}px, ${p.y}px)`;
      c.bubble.classList.toggle('hidden', !p.visible || c.state === 'entering');
    }
    if (c.speechEl) {
      // keep speech inside the viewport (it centers on the head)
      const sx = Math.max(115, Math.min(w - 115, p.x));
      c.speechEl.style.transform = `translate(${sx}px, ${p.y - 58}px)`;
    }
  }
}

// orders --------------------------------------------------------
function freeSlots(station) {
  const max = station === 'case'
    ? (state.upgrades.case >= 1 ? 1 : 0)
    : UPGRADES.machine.slots[state.upgrades.machine];
  const used = brews.filter((b) => b.station === station).length;
  return max - used;
}

function tryTakeOrder(cust, byBarista = false) {
  if (!running || cust.state !== 'queued') return false;
  const station = cust.item.station;
  if (freeSlots(station) <= 0) {
    if (!byBarista) { sfx.error(); toast('כל התחנות תפוסות! רגע של חסד ☕'); }
    return false;
  }
  cust.state = 'brewing';
  const speed = station === 'machine'
    ? UPGRADES.machine.speed[state.upgrades.machine]
    : [1, 1, 1.35, 1.8][state.upgrades.case] || 1;
  const total = (cust.item.prep * (cust.qty > 1 ? 1.35 : 1)) / speed;
  brews.push({ cust, t: 0, total, station });
  scene.brewingCount++;
  sfx.order();
  if (station === 'machine') scene.puffSteam(scene.machinePos);
  cust.bubble.classList.add('brewing');
  return true;
}

function finishBrew(brew) {
  scene.brewingCount--;
  const cust = brew.cust;
  if (cust.state !== 'brewing') return;  // already stormed out
  scene.flyServe(cust.item.glb, brew.station, cust.peep, () => serveDone(cust));
  sfx.serve();
}

function serveDone(cust) {
  if (cust.gone) return;
  cust.state = 'served';
  const amb = ambience();
  const patienceFrac = Math.max(0.15, cust.patience / cust.patienceMax);
  const base = cust.item.price * cust.qty;
  const tip = Math.round(base * 0.5 * cust.persona.tipMult * patienceFrac * (1 + amb * 0.06));
  earn(base + tip, cust);
  addRep(0.06 + (cust.persona.repBonus || 0));
  state.stats.served++;
  scene.jump(cust.peep);
  speech(cust, line(cust.persona.happy));
  if (cust.persona.id === 'influencer') photoFlash();
  removeBubble(cust);
  layoutQueueSoon();
  // some customers sit and enjoy for a bit, others head straight out
  const seat = Math.random() < 0.55 ? scene.freeSeat() : null;
  if (seat) {
    seat.taken = true;
    scene.walkTo(cust.peep, { x: seat.x, z: seat.z }, () => {
      cust.peep.faceTarget = Math.atan2(seat.table.x - seat.x, seat.table.z - seat.z);
      cust.cup = scene.placeCupOnTable(seat, cust.item.glb);
      setTimeout(() => {
        seat.taken = false;
        if (cust.cup) { scene.scene.remove(cust.cup); cust.cup = null; }
        exitCafe(cust);
      }, 6000 + Math.random() * 8000);
    });
  } else {
    exitCafe(cust);
  }
}

function exitCafe(cust) {
  scene.walkTo(cust.peep, scene.doorPos, () => {
    scene.walkTo(cust.peep, scene.spawnPos, () => removeCustomer(cust));
  });
}

function stormOut(cust) {
  cust.state = 'angry';
  sfx.angry();
  scene.shake(cust.peep);
  speech(cust, line(cust.persona.angry), 3600);
  addRep(-(cust.persona.repPenalty ? cust.persona.repPenalty : 0.15));
  state.stats.walkouts++;
  removeBubble(cust);
  cust.peep.speed = 3.2;
  setTimeout(() => exitCafe(cust), 700);
  layoutQueueSoon();
}

function removeBubble(cust) {
  if (cust.bubble) { cust.bubble.remove(); cust.bubble = null; }
}

function removeCustomer(cust) {
  cust.gone = true;
  removeBubble(cust);
  if (cust.speechEl) { cust.speechEl.remove(); cust.speechEl = null; }
  scene.removePeep(cust.peep);
  const i = customers.indexOf(cust);
  if (i >= 0) customers.splice(i, 1);
}

let layoutT = null;
function layoutQueueSoon() {
  clearTimeout(layoutT);
  layoutT = setTimeout(layoutQueue, 350);
}

// economy -------------------------------------------------------
function earn(amount, cust) {
  state.coins += amount;
  state.stats.earned += amount;
  sfx.coin();
  const p = cust ? scene.toScreen(scene.headPos(cust.peep)) : { x: innerWidth / 2, y: innerHeight / 2 };
  const el = document.createElement('div');
  el.className = 'float-coin';
  el.textContent = `+₪${amount}`;
  el.style.left = p.x + 'px';
  el.style.top = p.y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
  refreshHud();
  save();
}

function addRep(d) {
  const before = Math.floor(state.rep);
  state.rep = Math.max(0, Math.min(5, state.rep + d));
  const after = Math.floor(state.rep);
  if (after > before) {
    sfx.star();
    toast(`⭐ ${STAR_THRESHOLD_LINES[after - 1] || 'כוכב חדש!'}`, 5200);
    confetti();
  }
  refreshHud();
}

// ---------------- HUD / panels ----------------
function refreshHud() {
  $('#coins').textContent = `₪${state.coins}`;
  $('#amb').textContent = `${ambience()}`;
  const starsEl = $('#stars');
  const full = Math.floor(state.rep);
  const half = state.rep - full >= 0.5;
  starsEl.innerHTML = Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < full ? 'full' : i === full && half ? 'half' : ''}">★</span>`
  ).join('');
}

function toast(text, ms = 3400) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  $('#toasts').appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 400); }, ms);
}

function confetti() {
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.textContent = ['☕', '🎉', '⭐', '🥐', '🧇'][i % 5];
    el.style.left = 20 + Math.random() * 60 + 'vw';
    el.style.animationDelay = Math.random() * 0.4 + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
}

function photoFlash() {
  const el = document.createElement('div');
  el.className = 'flash';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 500);
  toast('📸 שירה העלתה סטורי! המוניטין עולה!');
}

// shop panel ----------------------------------------------------
const shopEl = $('#shop');
let shopTab = 'upgrades';

function applyPurchaseEffects() {
  scene.setMachineLevel(state.upgrades.machine);
  scene.setCaseLevel(state.upgrades.case);
  scene.setStaff(state.staff);
  for (const id of state.decor) scene.addDecor(id);
  scene.updateMenuBoard(unlockedMenu(state).map((id) => MENU[id]));
  refreshHud();
}

function buyRow({ icon, name, desc, cost, owned, onBuy }) {
  const can = !owned && state.coins >= cost;
  return `
    <div class="row ${owned ? 'owned' : ''}">
      <span class="r-icon">${icon}</span>
      <span class="r-body"><b>${name}</b><small>${desc}</small></span>
      ${owned
        ? '<span class="r-owned">✓</span>'
        : `<button class="r-buy ${can ? '' : 'no'}" data-buy="${onBuy}">₪${cost}</button>`}
    </div>`;
}

function renderShop() {
  const tabs = [
    ['upgrades', '🛠️ שדרוגים'],
    ['staff', '🧑‍🍳 צוות'],
    ['decor', '🛋️ עיצוב'],
  ];
  let rows = '';
  if (shopTab === 'upgrades') {
    for (const key of ['machine', 'case']) {
      const u = UPGRADES[key];
      const lvl = state.upgrades[key];
      const next = u.levels[lvl + 1];
      rows += buyRow({
        icon: u.emoji,
        name: `${u.name} ${next ? `— שלב ${lvl + 1}` : ''}`,
        desc: next ? next.desc : u.levels[lvl].desc + ' (מקסימום!)',
        cost: next ? next.cost : 0,
        owned: !next,
        onBuy: `up:${key}`,
      });
    }
  } else if (shopTab === 'staff') {
    for (const s of STAFF) {
      rows += buyRow({
        icon: s.emoji, name: s.name, desc: s.desc, cost: s.cost,
        owned: state.staff[s.id], onBuy: `staff:${s.id}`,
      });
    }
  } else {
    for (const d of DECOR) {
      rows += buyRow({
        icon: d.emoji, name: `${d.name} · אווירה +${d.ambience}`, desc: d.desc, cost: d.cost,
        owned: state.decor.includes(d.id), onBuy: `decor:${d.id}`,
      });
    }
  }
  shopEl.innerHTML = `
    <div class="sheet-grip"></div>
    <nav class="tabs">${tabs.map(([id, label]) =>
      `<button class="tab ${shopTab === id ? 'on' : ''}" data-tab="${id}">${label}</button>`).join('')}
    </nav>
    <div class="rows">${rows}</div>`;
}

shopEl.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-tab]');
  if (tab) { shopTab = tab.dataset.tab; sfx.click(); renderShop(); return; }
  const buy = e.target.closest('[data-buy]');
  if (!buy) return;
  const [kind, id] = buy.dataset.buy.split(':');
  let cost = 0, ok = false;
  if (kind === 'up') {
    const next = UPGRADES[id].levels[state.upgrades[id] + 1];
    if (next && state.coins >= next.cost) { cost = next.cost; state.upgrades[id]++; ok = true; }
  } else if (kind === 'staff') {
    const s = STAFF.find((x) => x.id === id);
    if (!state.staff[id] && state.coins >= s.cost) { cost = s.cost; state.staff[id] = true; ok = true; if (id === 'cat') sfx.meow(); }
  } else if (kind === 'decor') {
    const d = DECOR.find((x) => x.id === id);
    if (!state.decor.includes(id) && state.coins >= d.cost) { cost = d.cost; state.decor.push(id); ok = true; }
  }
  if (!ok) { sfx.error(); return; }
  state.coins -= cost;
  sfx.buy();
  toast('נרכש! הבית־קפה משתדרג 🎉');
  applyPurchaseEffects();
  renderShop();
  save();
});

$('#btn-shop').addEventListener('click', () => {
  sfx.click();
  const open = shopEl.classList.toggle('open');
  if (open) renderShop();
});
$('#btn-mute').addEventListener('click', () => {
  state.muted = !state.muted;
  setMuted(state.muted);
  $('#btn-mute').textContent = state.muted ? '🔇' : '🔊';
  save();
});
$('#btn-reset').addEventListener('click', () => {
  if (confirm('לפתוח בית קפה חדש? כל ההתקדמות תימחק!')) {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }
});

// close shop when tapping the world
canvas.addEventListener('pointerdown', () => shopEl.classList.remove('open'));

// ---------------- input ----------------
function customerAt(peep) {
  return customers.find((c) => c.peep === peep);
}

function handleTap(x, y) {
  const hit = scene.pick(x, y);
  if (!hit) return;
  if (hit.type === 'peep') {
    const cust = customerAt(hit.peep);
    if (cust) tryTakeOrder(cust);
  } else if (hit.type === 'machine') {
    sfx.steam();
    scene.puffSteam(scene.machinePos);
    toast('פסססש! המכונה מוסרת ד״ש 💨');
  } else if (hit.type === 'waffleclock') {
    toast('🧇 שעון הוופל מאשר: תמיד שעת קפה.');
  }
}

canvas.addEventListener('click', (e) => handleTap(e.clientX, e.clientY));
bubblesEl.addEventListener('click', (e) => {
  const b = e.target.closest('.bubble');
  if (!b) return;
  const cust = customers.find((c) => c.bubble === b);
  if (cust) tryTakeOrder(cust);
});

// ---------------- main loop ----------------
function tick(dt) {
  if (!running) return;

  // spawn pacing
  spawnT -= dt;
  if (spawnT <= 0) { spawnCustomer(); spawnT = spawnInterval(); }

  // patience + brews
  const decay = 1 / (1 + ambience() * 0.05);
  for (const c of customers) {
    if (c.state === 'queued' || c.state === 'brewing') {
      c.patience -= dt * decay * (c.state === 'brewing' ? 0.55 : 1);
      const bar = c.bubble && c.bubble.querySelector('.b-patience i');
      if (bar) {
        const f = Math.max(0, c.patience / c.patienceMax);
        bar.style.width = (f * 100).toFixed(1) + '%';
        bar.style.background = f > 0.5 ? 'var(--mint)' : f > 0.25 ? '#ffd76b' : 'var(--red)';
      }
      if (c.patience <= 0) {
        const bi = brews.findIndex((b) => b.cust === c);
        if (bi >= 0) { brews.splice(bi, 1); scene.brewingCount--; }
        stormOut(c);
      }
    }
  }
  for (let i = brews.length - 1; i >= 0; i--) {
    const b = brews[i];
    b.t += dt;
    const ring = b.cust.bubble && b.cust.bubble.querySelector('.b-ring');
    if (ring) ring.style.setProperty('--p', Math.min(1, b.t / b.total));
    if (b.t >= b.total) { brews.splice(i, 1); finishBrew(b); }
  }

  // hired staff auto-serve
  for (const s of STAFF) {
    if (!state.staff[s.id]) continue;
    baristaT[s.id] -= dt;
    if (baristaT[s.id] <= 0) {
      const waiting = customers.filter((c) => c.state === 'queued')
        .sort((a, b) => a.patience - b.patience);
      if (waiting.length && tryTakeOrder(waiting[0], true)) {
        baristaT[s.id] = s.interval;
        if (s.id === 'cat' && Math.random() < 0.2) sfx.meow();
      } else {
        baristaT[s.id] = 1;
      }
    }
  }

  // ambient flavor
  reviewT -= dt;
  if (reviewT <= 0 && state.stats.served >= 3) {
    toast(line(REVIEWS), 4200);
    reviewT = 40 + Math.random() * 30;
  }
  hintT -= dt;
  if (hintT <= 0 && state.hintsSeen < HINTS.length) {
    toast('💡 ' + HINTS[state.hintsSeen], 5200);
    state.hintsSeen++;
    hintT = 14;
    save();
  }
}

function frame() {
  const dt = scene.update();
  tick(dt);
  positionBubbles();
  requestAnimationFrame(frame);
}

// ---------------- boot ----------------
async function boot() {
  refreshHud();
  $('#btn-mute').textContent = state.muted ? '🔇' : '🔊';
  setMuted(state.muted);

  await scene.loadAssets((f) => {
    $('#load-bar i').style.width = (f * 100).toFixed(0) + '%';
  });
  applyPurchaseEffects();
  $('#loading').classList.add('done');
  $('#title').classList.remove('hidden');
  $('#btn-start').textContent = hasSave && state.stats.served > 0 ? 'המשך משמרת ☕' : 'פתחו את הדלתות! ☕';
  scene.resize();
  requestAnimationFrame(frame);
}

$('#btn-start').addEventListener('click', () => {
  sfx.buy();
  $('#title').classList.add('hidden');
  running = true;
  spawnT = 1.2;
});

boot();

// debug handle for automated tests (not part of gameplay)
window.__game = { state, customers, brews, scene, spawnCustomer, tryTakeOrder };

