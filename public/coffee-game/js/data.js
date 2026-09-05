// ============================================================
// תפוס את הפול! — game content, v2.
// Characters are non-verbal: personality lives in looks, emoji
// emotes and body language. The only Hebrew here is short UI text.
// ============================================================

// Prep stations the player taps during the mini-game.
// icon shown in the order card; station id matches scene glow targets.
export const STATIONS = {
  grind: { id: 'grind', icon: '⚙️', name: 'מטחנה' },
  brew:  { id: 'brew',  icon: '☕', name: 'מכונה' },
  milk:  { id: 'milk',  icon: '🥛', name: 'חלב' },
  ice:   { id: 'ice',   icon: '🧊', name: 'קרח' },
  case:  { id: 'case',  icon: '🥐', name: 'ויטרינה' },
};

// Menu: drinks are tap-sequences (steps), pastries are a timing tap
// on the display case (minigame: 'timing'). par = seconds for a
// perfect run at machine level 0 (levels shorten it).
export const MENU = {
  espresso:  { id: 'espresso',  name: 'אספרסו',     emoji: '☕', price: 8,  station: 'machine', minigame: 'steps',  steps: ['grind', 'brew'],         par: 4.0, glb: 'cup-coffee' },
  tea:       { id: 'tea',       name: 'תה',         emoji: '🍵', price: 6,  station: 'machine', minigame: 'steps',  steps: ['brew'],                  par: 2.5, glb: 'cup-tea' },
  latte:     { id: 'latte',     name: 'הפוך',       emoji: '🥛', price: 12, station: 'machine', minigame: 'steps',  steps: ['grind', 'brew', 'milk'], par: 5.5, glb: 'mug' },
  frappe:    { id: 'frappe',    name: 'פראפה',      emoji: '🥤', price: 14, station: 'machine', minigame: 'steps',  steps: ['ice', 'brew', 'milk'],   par: 5.5, glb: 'frappe' },
  croissant: { id: 'croissant', name: 'קרואסון',    emoji: '🥐', price: 10, station: 'case',    minigame: 'timing', par: 0,   glb: 'croissant' },
  donut:     { id: 'donut',     name: 'דונאט',      emoji: '🍩', price: 9,  station: 'case',    minigame: 'timing', par: 0,   glb: 'donut-sprinkles' },
  cupcake:   { id: 'cupcake',   name: 'קאפקייק',    emoji: '🧁', price: 12, station: 'case',    minigame: 'timing', par: 0,   glb: 'cupcake' },
  cake:      { id: 'cake',      name: 'עוגה',       emoji: '🍰', price: 16, station: 'case',    minigame: 'timing', par: 0,   glb: 'cake' },
  waffle:    { id: 'waffle',    name: 'הוופל',      emoji: '🧇', price: 20, station: 'case',    minigame: 'timing', par: 0,   glb: 'waffle' },
};

export function unlockedMenu(state) {
  const out = ['espresso', 'tea'];
  if (state.upgrades.machine >= 1) out.push('latte');
  if (state.upgrades.machine >= 2) out.push('frappe');
  if (state.upgrades.case >= 1) out.push('croissant', 'donut');
  if (state.upgrades.case >= 2) out.push('cupcake', 'cake');
  if (state.upgrades.case >= 3) out.push('waffle');
  return out;
}

// ---------------------------------------------------------------
// Personas — non-verbal regulars. Personality = look + emotes.
// emotes: shown above the head instead of dialogue.
// ---------------------------------------------------------------
export const PERSONAS = [
  {
    id: 'hipster', name: 'ניר', minDay: 1, rarity: 1,
    body: 0xd9a441, hat: 'beanie', patience: 26, tipMult: 1.6,
    prefers: ['espresso', 'latte', 'frappe'],
    emotes: { greet: '🧔', happy: '🤌', angry: '🙄' },
  },
  {
    id: 'grandma', name: 'פנינה', minDay: 1, rarity: 1,
    body: 0xb59ce0, hat: 'bun', patience: 70, tipMult: 0.7,
    prefers: ['tea', 'cake', 'croissant'],
    emotes: { greet: '🧶', happy: '💝', angry: '😤' },
  },
  {
    id: 'student', name: 'דניאל', minDay: 1, rarity: 1,
    body: 0x6fb6ff, hat: 'headphones', patience: 35, tipMult: 1.0,
    prefers: ['espresso', 'donut'],
    emotes: { greet: '📊', happy: '🤓', angry: '📉' },
  },
  {
    id: 'influencer', name: 'שירה', minDay: 2, rarity: 0.8,
    body: 0xff8fb1, hat: 'cap', patience: 20, tipMult: 0, repBonus: 0.25,
    prefers: ['frappe', 'cupcake', 'waffle'],
    emotes: { greet: '🤳', happy: '📸', angry: '👎' },
  },
  {
    id: 'tourist', name: 'יורגן', minDay: 3, rarity: 0.8,
    body: 0x54c6a9, hat: 'sunhat', patience: 45, tipMult: 1.3,
    prefers: ['cake', 'waffle', 'espresso'],
    emotes: { greet: '🗺️', happy: '📷', angry: '⁉️' },
  },
  {
    id: 'twinmom', name: 'רוני', minDay: 4, rarity: 0.8,
    body: 0xff9a76, hat: 'messybun', patience: 15, tipMult: 1.9, doubleOrder: true,
    emotes: { greet: '👶👶', happy: '🦸', angry: '😭' },
    prefers: ['donut', 'croissant', 'espresso'],
  },
  {
    id: 'hitech', name: 'עופר', minDay: 5, rarity: 0.8,
    body: 0x8b93a7, hat: 'none', patience: 30, tipMult: 1.4,
    prefers: ['espresso', 'latte'],
    emotes: { greet: '💻', happy: '👍', angry: '📅' },
  },
  {
    id: 'critic', name: 'המבקר', minDay: 6, rarity: 0.35,
    body: 0x3d3a4a, hat: 'fedora', patience: 40, tipMult: 2.5, repBonus: 0.5, repPenalty: 0.5,
    prefers: [],
    emotes: { greet: '📝', happy: '🌟', angry: '🗞️' },
  },
];

// ---------------------------------------------------------------
// Upgrades / staff / decor — short natural Hebrew, no fluff.
// ---------------------------------------------------------------
export const UPGRADES = {
  machine: {
    name: 'מכונת אספרסו', emoji: '⚙️',
    levels: [
      { desc: 'מכונה ביתית פשוטה', cost: 0 },
      { desc: 'מכונה מקצועית — פותחת הפוך, הכנה מהירה יותר', cost: 60 },
      { desc: 'מכונה כפולה — פותחת פראפה, מהירה עוד יותר', cost: 220 },
      { desc: 'מכונת־על — הכנה בזק', cost: 520 },
    ],
    // par-time multiplier per level (lower = easier perfects)
    parMult: [1, 0.85, 0.7, 0.55],
  },
  case: {
    name: 'ויטרינת מאפים', emoji: '🥐',
    levels: [
      { desc: 'אין ויטרינה עדיין', cost: 0 },
      { desc: 'ויטרינה קטנה — קרואסון ודונאט', cost: 40 },
      { desc: 'ויטרינה גדולה — קאפקייק ועוגה', cost: 120 },
      { desc: 'ויטרינת הדגל — הוופל האגדי', cost: 300 },
    ],
    // timing-bar green-zone width per level (fraction of bar)
    zone: [0.18, 0.22, 0.26, 0.32],
  },
};

export const STAFF = [
  {
    id: 'tom', name: 'תום הבריסטה', emoji: '🧑‍🍳', cost: 150, interval: 8,
    desc: 'מכין הזמנות לבד כל 8 שניות',
  },
  {
    id: 'cat', name: 'קפוצ׳ינו החתול', emoji: '🐈', cost: 400, interval: 6, ambience: 1,
    desc: 'חתול בריסטה. מכין כל 6 שניות, ‎+1 אווירה',
  },
];

export const DECOR = [
  { id: 'plant',      name: 'עציץ',          emoji: '🪴', cost: 30,  ambience: 1 },
  { id: 'rug',        name: 'שטיח',          emoji: '🟠', cost: 50,  ambience: 1 },
  { id: 'waffleclock', name: 'שעון וופל',    emoji: '🧇', cost: 80,  ambience: 1 },
  { id: 'lights',     name: 'שרשרת נורות',   emoji: '💡', cost: 90,  ambience: 1 },
  { id: 'gramophone', name: 'פטיפון',        emoji: '🎶', cost: 120, ambience: 2 },
  { id: 'parasol',    name: 'שמשייה בחוץ',   emoji: '⛱️', cost: 150, ambience: 1 },
  { id: 'neon',       name: 'שלט ניאון',     emoji: '🔆', cost: 200, ambience: 2 },
];

// Short, functional tutorial hints (shown once each, day 1 only).
export const HINTS = [
  'לוחצים על לקוח כדי לקחת הזמנה ☝️',
  'לוחצים על התחנות המוארות לפי הסדר שבכרטיס ⚙️',
  'מאפים: לוחצים כשהמחוג בירוק 🎯',
];

// Day length in seconds and spawn pacing.
export const DAY_LENGTH = 90;
export function spawnIntervalFor(day, rep) {
  const ramp = Math.min(day - 1, 8) * 0.45 + (rep / 5) * 2;
  return Math.max(3.2, 8.5 - ramp);
}
