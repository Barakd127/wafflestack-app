// ============================================================
// game.js v2 — day/shift structure, prep mini-games, non-verbal
// customers (emoji emotes + body language, zero dialogue).
// The 3D world is CafeScene (scene.js); content is data.js.
// ============================================================

import { CafeScene } from './scene.js';
import { sfx, setMuted } from './audio.js';
import {
  MENU, STATIONS, PERSONAS, UPGRADES, STAFF, DECOR, HINTS,
  DAY_LENGTH, unlockedMenu, spawnIntervalFor,
} from './data.js';

const SAVE_KEY = 'seize-habul-save-v2';
const $ = (sel) => document.querySelector(sel);

// ---------------- state ----------------
const state = {
  coins: 20,
  rep: 0,
  day: 1,
  upgrades: { machine: 0, case: 0 },
  staff: { tom: false, cat: false },
  decor: [],
  stats: { served: 0, walkouts: 0, earned: 0, perfects: 0 },
  hintsSeen: 0,
  muted: false,
};

// During a rush we defer writes: the last durable checkpoint is the
// morning of the current day, so a mid-rush refresh replays the day
// instead of losing it (or double-counting a half-day of earnings).
let saveDirty = false;
function save() {
  if (phase === 'rush') { saveDirty = true; return; }
  saveDirty = false;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* blocked */ }
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
scene.onContextLost = () => {
  toast('😵 תקלה גרפית — טוענים מחדש...', 2500);
  setTimeout(() => location.reload(), 1600);
};
const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------- run state ----------------
let phase = 'title';           // title | prep | rush | summary
let dayTime = 0;
let spawnT = 0;
const customers = [];
const brews = [];              // staff-prepared orders: {cust, t, total, staffId}
let activeOrder = null;        // the player's live mini-game
let baristaT = { tom: 4, cat: 2 };
const dayStats = { earned: 0, served: 0, walkouts: 0, perfects: 0, repStart: 0 };

// ---------------- customers ----------------
function pickPersona() {
  const pool = PERSONAS.filter((p) => state.day >= p.minDay);
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

function spawnCustomer() {
  if (customers.filter((c) => ['entering', 'queued', 'prepping'].includes(c.state)).length >= 6) return;
  const persona = pickPersona();
  const item = pickItem(persona);
  const qty = persona.doubleOrder ? 2 : 1;
  const peep = scene.createPeep({ body: persona.body, hat: persona.hat, charKey: `char-${persona.id}`, at: scene.spawnPos });
  const patienceMax = persona.patience * (1 + ambience() * 0.05);
  const cust = {
    persona, item, qty, peep,
    state: 'entering',
    patience: patienceMax, patienceMax,
    bubble: makeBubble(persona, item, qty),
    lastPatienceEmote: 0,
  };
  customers.push(cust);
  sfx.pop();
  scene.walkTo(peep, scene.doorPos, () => {
    const inQ = customers.filter((c) => ['entering', 'queued', 'prepping'].includes(c.state));
    const spot = queueSpot(Math.max(0, inQ.indexOf(cust)));
    scene.walkTo(peep, spot, () => {
      cust.state = 'queued';
      peep.faceTarget = Math.PI;
      emote(cust, cust.persona.emotes.greet);
      showHint(0);
      layoutQueue();
    });
  });
}

function queueSpot(i) {
  return scene.queueSpots[Math.max(0, Math.min(i, scene.queueSpots.length - 1))];
}

function layoutQueue() {
  const inQueue = customers.filter((c) => ['entering', 'queued', 'prepping'].includes(c.state));
  inQueue.forEach((c, i) => {
    if (c.state === 'entering') return;
    const spot = queueSpot(i);
    if (c.peep.node.position.distanceTo(spot) > 0.1) {
      scene.walkTo(c.peep, spot, () => { c.peep.faceTarget = Math.PI; });
    }
  });
}

let layoutT = null;
function layoutQueueSoon() {
  clearTimeout(layoutT);
  layoutT = setTimeout(layoutQueue, 350);
}

// ---------------- bubbles & emotes ----------------
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

// one-shot emoji that floats up from a customer's head
function emote(cust, char, big = false) {
  if (!char) return;
  const p = scene.toScreen(scene.headPos(cust.peep));
  const el = document.createElement('div');
  el.className = 'emote' + (big ? ' big' : '');
  el.textContent = char;
  el.style.left = p.x + 'px';
  el.style.top = (p.y - 46) + 'px';
  bubblesEl.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

function positionBubbles() {
  for (const c of customers) {
    if (!c.bubble) continue;
    const p = scene.toScreen(scene.headPos(c.peep));
    c.bubble.style.transform = `translate(${p.x}px, ${p.y}px)`;
    c.bubble.classList.toggle('hidden', !p.visible || c.state === 'entering');
  }
  // until the very first serve, a bouncing finger shows what to tap
  const pointer = $('#tap-pointer');
  const guideTarget = state.stats.served === 0 && phase === 'rush' && !activeOrder
    ? customers.find((c) => c.state === 'queued')
    : null;
  if (guideTarget) {
    const p = scene.toScreen(scene.headPos(guideTarget.peep));
    pointer.style.transform = `translate(${p.x}px, ${p.y - 92}px)`;
    pointer.hidden = false;
  } else {
    pointer.hidden = true;
  }
}

// ---------------- the prep mini-games ----------------
const orderCard = $('#order-card');

function machineParMult() { return UPGRADES.machine.parMult[state.upgrades.machine]; }
function caseZone() { return UPGRADES.case.zone[state.upgrades.case]; }

function startOrder(cust) {
  if (phase !== 'rush' || cust.state !== 'queued') return;
  if (activeOrder) {
    // one order at a time — nudge the card so the player sees why
    orderCard.classList.remove('nudge');
    void orderCard.offsetWidth;
    orderCard.classList.add('nudge');
    sfx.error();
    return;
  }
  const item = cust.item;
  cust.state = 'prepping';
  activeOrder = {
    cust, item,
    mode: item.minigame,
    stepIdx: 0,
    elapsed: 0,
    needle: 0,
    needleDir: 1,
  };
  sfx.order();
  if (item.minigame === 'steps') {
    scene.setStationGlow([item.steps[0]]);
    showHint(1);
  } else {
    scene.setStationGlow(['case']);
    showHint(2);
  }
  renderOrderCard();
  orderCard.classList.add('open');
}

function renderOrderCard() {
  if (!activeOrder) { orderCard.classList.remove('open'); return; }
  const { item, mode, stepIdx, cust } = activeOrder;
  if (mode === 'steps') {
    orderCard.innerHTML = `
      <div class="oc-title">${item.emoji} ${item.name} <small>· ${cust.persona.name}</small></div>
      <div class="oc-steps">${item.steps.map((s, i) => `
        <span class="oc-step ${i < stepIdx ? 'done' : i === stepIdx ? 'now' : ''}">${STATIONS[s].icon}</span>
        ${i < item.steps.length - 1 ? '<span class="oc-arrow">←</span>' : ''}`).join('')}
      </div>
      <div class="oc-help">לחצו על התחנה עם החץ הזהוב ⬇️</div>`;
  } else {
    orderCard.innerHTML = `
      <div class="oc-title">${item.emoji} ${item.name} <small>· ${cust.persona.name}</small></div>
      <div class="oc-timing"><div class="oc-zone" style="width:${caseZone() * 100}%"></div><i class="oc-needle"></i></div>
      <div class="oc-help">לחצו בכל מקום ברגע שהמחוג בירוק! 🎯</div>`;
  }
}

function tapStation(id) {
  if (!activeOrder || phase !== 'rush') return false;
  const ao = activeOrder;
  if (ao.mode === 'steps') {
    const wanted = ao.item.steps[ao.stepIdx];
    // a re-tap on the station just completed is enthusiasm, not a mistake
    if (ao.stepIdx > 0 && id === ao.item.steps[ao.stepIdx - 1]) return true;
    if (id === wanted) {
      sfx.click();
      if (id === 'brew') { sfx.steam(); scene.puffSteam(scene.machinePos); }
      ao.stepIdx++;
      if (ao.stepIdx >= ao.item.steps.length) {
        finishOrder(qualityFromTime(ao));
      } else {
        scene.setStationGlow([ao.item.steps[ao.stepIdx]]);
        renderOrderCard();
      }
    } else if (['grind', 'brew', 'milk', 'ice', 'case'].includes(id)) {
      ao.elapsed += 0.8;             // wrong tap costs time
      sfx.error();
      orderCard.classList.remove('nudge');
      void orderCard.offsetWidth;
      orderCard.classList.add('nudge');
    }
    return true;
  }
  // timing mode: any tap on the case stops the needle
  if (id === 'case') {
    const off = Math.abs(ao.needle - 0.5) * 2;   // 0 = bullseye, 1 = edge
    const zone = caseZone();
    finishOrder(off <= zone * 0.45 ? 'perfect' : off <= zone ? 'good' : 'ok');
    return true;
  }
  return false;
}

function qualityFromTime(ao) {
  const par = ao.item.par * machineParMult();
  if (ao.elapsed <= par) return 'perfect';
  if (ao.elapsed <= par * 1.9) return 'good';
  return 'ok';
}

function finishOrder(quality) {
  const ao = activeOrder;
  activeOrder = null;
  orderCard.classList.remove('open');
  scene.setStationGlow([]);
  serveCustomer(ao.cust, quality);
}

// staff prepare in the background at fixed 'good' quality
function staffTake(cust, staffId) {
  if (cust.state !== 'queued') return false;
  cust.state = 'prepping';
  const total = 4.5 * machineParMult() + 1.5;
  brews.push({ cust, t: 0, total, staffId });
  scene.brewingCount++;
  cust.bubble.classList.add('brewing');
  return true;
}

// ---------------- serving & leaving ----------------
const QUALITY = {
  perfect: { mult: 1.6, emote: '✨', repBonus: 0.03 },
  good:    { mult: 1.0, emote: '❤️', repBonus: 0 },
  ok:      { mult: 0.6, emote: '🙂', repBonus: 0 },
};

function serveCustomer(cust, quality) {
  if (cust.gone || cust.state !== 'prepping') return;
  cust.state = 'serving';
  scene.flyServe(cust.item.glb, cust.item.station === 'case' ? 'case' : 'machine', cust.peep, () => {
    if (cust.gone || cust.state !== 'serving') return;
    cust.state = 'served';
    const q = QUALITY[quality];
    const base = cust.item.price * cust.qty;
    const tip = Math.round(base * 0.5 * cust.persona.tipMult * q.mult * (1 + ambience() * 0.06));
    earn(base + tip, cust);
    addRep(0.05 + q.repBonus + (cust.persona.repBonus || 0));
    state.stats.served++;
    dayStats.served++;
    if (quality === 'perfect') {
      state.stats.perfects++;
      dayStats.perfects++;
      sfx.star();
      if (!reducedMotion) scene.shakeCamera(0.14);
      emote(cust, '✨', true);
    } else {
      emote(cust, q.emote, true);
    }
    sfx.serve();
    scene.spin(cust.peep);
    if (cust.persona.id === 'influencer') { photoFlash(); emote(cust, '📸', true); }
    emote(cust, cust.persona.emotes.happy);
    removeBubble(cust);
    layoutQueueSoon();
    const seat = Math.random() < 0.55 ? scene.freeSeat() : null;
    if (seat) {
      seat.taken = true;
      cust.seat = seat;
      scene.walkTo(cust.peep, { x: seat.x, z: seat.z }, () => {
        cust.peep.faceTarget = Math.atan2(seat.table.x - seat.x, seat.table.z - seat.z);
        cust.cup = scene.placeCupOnTable(seat, cust.item.glb);
        setTimeout(() => {
          if (cust.seat) { cust.seat.taken = false; cust.seat = null; }
          if (cust.cup) { scene.removeItem(cust.cup); cust.cup = null; }
          if (!cust.gone) exitCafe(cust);
        }, 6000 + Math.random() * 8000);
      });
    } else {
      exitCafe(cust);
    }
  });
}

function exitCafe(cust) {
  scene.walkTo(cust.peep, scene.doorPos, () => {
    scene.walkTo(cust.peep, scene.spawnPos, () => removeCustomer(cust));
  });
}

function stormOut(cust) {
  // cancel whatever was being prepared for them
  if (activeOrder && activeOrder.cust === cust) {
    activeOrder = null;
    orderCard.classList.remove('open');
    scene.setStationGlow([]);
  }
  const bi = brews.findIndex((b) => b.cust === cust);
  if (bi >= 0) { brews.splice(bi, 1); scene.brewingCount--; }
  cust.state = 'angry';
  sfx.angry();
  scene.stomp(cust.peep);
  emote(cust, '💢', true);
  emote(cust, cust.persona.emotes.angry);
  addRep(-(cust.persona.repPenalty ? cust.persona.repPenalty : 0.15));
  state.stats.walkouts++;
  dayStats.walkouts++;
  removeBubble(cust);
  cust.peep.speed = 3.4;
  setTimeout(() => { if (!cust.gone) exitCafe(cust); }, 700);
  layoutQueueSoon();
}

function removeBubble(cust) {
  if (cust.bubble) { cust.bubble.remove(); cust.bubble = null; }
}

function removeCustomer(cust) {
  cust.gone = true;
  if (cust.seat) { cust.seat.taken = false; cust.seat = null; }
  if (cust.cup) { scene.removeItem(cust.cup); cust.cup = null; }
  removeBubble(cust);
  scene.removePeep(cust.peep);
  const i = customers.indexOf(cust);
  if (i >= 0) customers.splice(i, 1);
}

// ---------------- economy / reputation ----------------
function earn(amount, cust) {
  state.coins += amount;
  state.stats.earned += amount;
  dayStats.earned += amount;
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
}

function addRep(d) {
  const before = Math.floor(state.rep);
  state.rep = Math.max(0, Math.min(5, state.rep + d));
  if (Math.floor(state.rep) > before) {
    sfx.star();
    toast('⭐ כוכב חדש!');
    confetti();
  }
  refreshHud();
}

// ---------------- HUD / overlays ----------------
function refreshHud() {
  $('#coins').textContent = `₪${state.coins}`;
  $('#amb').textContent = `${ambience()}`;
  $('#day-label').textContent = `יום ${state.day}`;
  const starsEl = $('#stars');
  const full = Math.floor(state.rep);
  const half = state.rep - full >= 0.5;
  starsEl.setAttribute('role', 'img');
  starsEl.setAttribute('aria-label', `מוניטין: ${state.rep.toFixed(1)} מתוך 5 כוכבים`);
  starsEl.innerHTML = Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < full ? 'full' : i === full && half ? 'half' : ''}" aria-hidden="true">★</span>`
  ).join('');
}

function toast(text, ms = 3000) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  $('#toasts').appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 400); }, ms);
}

function showHint(i) {
  if (state.hintsSeen & (1 << i)) return;
  state.hintsSeen |= 1 << i;
  toast('💡 ' + HINTS[i], 4600);
  save();
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
}

// ---------------- day flow ----------------
function enterPrep() {
  phase = 'prep';
  scene.setDayProgress(0);
  document.body.dataset.phase = 'prep';
  $('#btn-open-day').textContent = `☀️ פתחו את יום ${state.day}`;
  $('#prep-bar').classList.add('show');
  renderShop();
  shopEl.classList.add('open');
  refreshHud();
  save();
}

function startDay() {
  save();                       // morning checkpoint before the rush
  phase = 'rush';
  document.body.dataset.phase = 'rush';
  $('#prep-bar').classList.remove('show');
  shopEl.classList.remove('open');
  dayTime = DAY_LENGTH;
  spawnT = 1.2;
  Object.assign(dayStats, { earned: 0, served: 0, walkouts: 0, perfects: 0, repStart: state.rep });
  // reveal newly arriving regulars
  PERSONAS.filter((p) => p.minDay === state.day && state.day > 1).forEach((p) => {
    toast(`${p.emotes.greet} לקוח חדש בשכונה: ${p.name}`, 3600);
  });
  sfx.buy();
  refreshHud();
}

function endDay() {
  phase = 'summary';
  document.body.dataset.phase = 'summary';
  sfx.bell();
  if (activeOrder) { activeOrder = null; orderCard.classList.remove('open'); scene.setStationGlow([]); }
  const dRep = state.rep - dayStats.repStart;
  $('#summary-body').innerHTML = `
    <h2>סוף יום ${state.day} 🌆</h2>
    <div class="sum-grid">
      <div class="sum-cell"><b>₪${dayStats.earned}</b><small>הכנסות</small></div>
      <div class="sum-cell"><b>${dayStats.served}</b><small>הוגשו</small></div>
      <div class="sum-cell"><b>${dayStats.perfects} ✨</b><small>מושלמים</small></div>
      <div class="sum-cell"><b>${dayStats.walkouts}</b><small>עזבו בכעס</small></div>
    </div>
    <div class="sum-rep">${dRep >= 0 ? '‎+' : '‎−'}${Math.abs(dRep).toFixed(2)} ⭐ מוניטין</div>`;
  $('#summary').classList.add('show');
  state.day++;
  save();
}

$('#btn-next-day').addEventListener('click', () => {
  sfx.click();
  $('#summary').classList.remove('show');
  enterPrep();
});
$('#btn-open-day').addEventListener('click', () => startDay());

// ---------------- shop ----------------
const shopEl = $('#shop');
let shopTab = 'upgrades';

function applyPurchaseEffects() {
  // +1 so every paid machine tier changes the model on the counter
  scene.setMachineLevel(state.upgrades.machine + 1);
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
        name: `${u.name}${next ? '' : ' (מקסימום)'}`,
        desc: next ? next.desc : u.levels[lvl].desc,
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
        icon: d.emoji, name: d.name, desc: `אווירה ‎+${d.ambience}`, cost: d.cost,
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
  applyPurchaseEffects();
  renderShop();
  save();
});

$('#btn-shop').addEventListener('click', () => {
  sfx.click();
  const open = shopEl.classList.toggle('open');
  if (open) renderShop();
});

function reflectMute() {
  const btn = $('#btn-mute');
  btn.textContent = state.muted ? '🔇' : '🔊';
  btn.setAttribute('aria-label', state.muted ? 'ביטול השתקה' : 'השתקה');
}
$('#btn-mute').addEventListener('click', () => {
  state.muted = !state.muted;
  setMuted(state.muted);
  reflectMute();
  save();
});
// two-tap confirm (window.confirm is silently ignored in sandboxed iframes)
let resetArmT = null;
$('#btn-reset').addEventListener('click', () => {
  const btn = $('#btn-reset');
  if (!btn.dataset.armed) {
    btn.dataset.armed = '1';
    btn.textContent = '🗑️';
    btn.setAttribute('aria-label', 'לחצו שוב לאישור מחיקה');
    toast('בטוחים? לחיצה נוספת תמחק את ההתקדמות', 3000);
    resetArmT = setTimeout(() => {
      delete btn.dataset.armed;
      btn.textContent = '🔄';
      btn.setAttribute('aria-label', 'משחק חדש');
    }, 3000);
    return;
  }
  clearTimeout(resetArmT);
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* blocked */ }
  location.reload();
});

// ---------------- input ----------------
let tapClosedShop = false;
let tapStoppedNeedle = false;
canvas.addEventListener('pointerdown', () => {
  tapClosedShop = phase === 'rush' && shopEl.classList.contains('open');
  if (phase === 'rush') shopEl.classList.remove('open');
  // the timing needle stops on pointerDOWN (click fires ~100ms later,
  // which eats the perfect window on touch) — and anywhere counts:
  // the challenge is when, not where
  if (!tapClosedShop && activeOrder && activeOrder.mode === 'timing') {
    tapStation('case');
    tapStoppedNeedle = true;
  }
});
canvas.addEventListener('click', (e) => {
  if (tapClosedShop) { tapClosedShop = false; return; }
  if (tapStoppedNeedle) { tapStoppedNeedle = false; return; }
  handleTap(e.clientX, e.clientY);
});
// the order card itself is a control: stop the needle from it too
orderCard.addEventListener('pointerdown', () => {
  if (activeOrder && activeOrder.mode === 'timing') tapStation('case');
});
bubblesEl.addEventListener('click', (e) => {
  const b = e.target.closest('.bubble');
  if (!b) return;
  const cust = customers.find((c) => c.bubble === b);
  if (cust) startOrder(cust);
});

function handleTap(x, y) {
  const hit = scene.pick(x, y);
  if (!hit) return;
  if (hit.type === 'peep') {
    const cust = customers.find((c) => c.peep === hit.peep);
    if (cust) startOrder(cust);
  } else if (hit.type === 'station') {
    if (!tapStation(hit.station) && hit.station === 'brew') {
      sfx.steam();
      scene.puffSteam(scene.machinePos);
    }
  } else if (hit.type === 'waffleclock') {
    sfx.click();
  }
}

// ---------------- main loop ----------------
function tick(dt) {
  if (phase !== 'rush') return;

  // day clock
  dayTime -= dt;
  scene.setDayProgress(1 - Math.max(0, dayTime) / DAY_LENGTH);
  const timerEl = $('#day-timer i');
  if (timerEl) timerEl.style.width = `${(Math.max(0, dayTime) / DAY_LENGTH) * 100}%`;

  // spawning while the day runs — last arrivals stop ~15s before closing
  // so the shift doesn't overrun its own timer
  if (dayTime > 15) {
    spawnT -= dt;
    if (spawnT <= 0) {
      spawnCustomer();
      spawnT = spawnIntervalFor(state.day, state.rep) * (0.8 + Math.random() * 0.4);
    }
  } else if (dayTime <= 0 && !customers.length) {
    endDay();
    return;
  }

  // active-order clock + timing needle
  if (activeOrder) {
    activeOrder.elapsed += dt;
    if (activeOrder.mode === 'timing') {
      activeOrder.needle += activeOrder.needleDir * dt * 0.9;
      if (activeOrder.needle > 1) { activeOrder.needle = 1; activeOrder.needleDir = -1; }
      if (activeOrder.needle < 0) { activeOrder.needle = 0; activeOrder.needleDir = 1; }
      const n = orderCard.querySelector('.oc-needle');
      if (n) n.style.right = `${activeOrder.needle * 100}%`;
    }
  }

  // patience
  const decay = 1 / (1 + ambience() * 0.05);
  for (const c of customers) {
    if (c.state === 'queued' || c.state === 'prepping') {
      c.patience -= dt * decay * (c.state === 'prepping' ? 0.45 : 1);
      const f = Math.max(0, c.patience / c.patienceMax);
      const bar = c.bubble && c.bubble.querySelector('.b-patience i');
      if (bar) {
        bar.style.width = (f * 100).toFixed(1) + '%';
        bar.style.background = f > 0.5 ? 'var(--mint)' : f > 0.25 ? '#ffd76b' : 'var(--red)';
      }
      c.peep.fidget = f < 0.4;
      if (f < 0.25 && performance.now() - c.lastPatienceEmote > 3000) {
        c.lastPatienceEmote = performance.now();
        emote(c, '⏳');
      }
      if (c.patience <= 0) stormOut(c);
    }
  }

  // staff prep
  for (let i = brews.length - 1; i >= 0; i--) {
    const b = brews[i];
    b.t += dt;
    const ring = b.cust.bubble && b.cust.bubble.querySelector('.b-ring');
    if (ring) ring.style.setProperty('--p', Math.min(1, b.t / b.total));
    if (b.t >= b.total) {
      brews.splice(i, 1);
      scene.brewingCount--;
      serveCustomer(b.cust, 'good');
    }
  }
  for (const s of STAFF) {
    if (!state.staff[s.id]) continue;
    baristaT[s.id] -= dt;
    if (baristaT[s.id] <= 0) {
      if (brews.some((b) => b.staffId === s.id)) { baristaT[s.id] = 1; continue; }
      const waiting = customers.filter((c) => c.state === 'queued' && (!activeOrder || activeOrder.cust !== c))
        .sort((a, b) => a.patience - b.patience);
      const took = waiting.find((c) => staffTake(c, s.id));
      baristaT[s.id] = took ? s.interval : 1;
      if (took && s.id === 'cat' && Math.random() < 0.25) sfx.meow();
    }
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
  reflectMute();
  setMuted(state.muted);
  await scene.loadAssets((f) => {
    $('#load-bar i').style.width = (f * 100).toFixed(0) + '%';
  }, PERSONAS.map((p) => p.id).concat(['barista', 'tom']));
  scene.refreshBarista();
  applyPurchaseEffects();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      scene.redrawText();
      scene.updateMenuBoard(unlockedMenu(state).map((id) => MENU[id]));
    });
  }
  $('#loading').classList.add('done');
  $('#title').classList.remove('hidden');
  $('#btn-start').textContent = hasSave && state.day > 1 ? `המשך מיום ${state.day} ☕` : 'פתחו את הדלתות! ☕';
  scene.resize();
  requestAnimationFrame(frame);
}

$('#btn-start').addEventListener('click', () => {
  sfx.buy();
  $('#title').classList.add('hidden');
  enterPrep();
});

boot();

// debug handle for automated tests (not part of gameplay)
window.__game = {
  state, customers, brews, scene,
  spawnCustomer, startOrder, tapStation, startDay, endDay,
  get phase() { return phase; },
  get activeOrder() { return activeOrder; },
  setDayTime(t) { dayTime = t; },
};
