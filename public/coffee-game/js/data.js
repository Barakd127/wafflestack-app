// ============================================================
// תפוס את הפול! — game content (menu, personas, upgrades, decor)
// All player-facing text is Hebrew. Tone: Seize the Bean wacky.
// ============================================================

export const MENU = {
  espresso:  { id: 'espresso',  name: 'אספרסו',      emoji: '☕', price: 8,  prep: 6,   station: 'machine', glb: 'cup-coffee' },
  tea:       { id: 'tea',       name: 'תה צמחים',    emoji: '🍵', price: 6,  prep: 5,   station: 'machine', glb: 'cup-tea' },
  frappe:    { id: 'frappe',    name: 'פראפוצ׳ינו',  emoji: '🥤', price: 14, prep: 8,   station: 'machine', glb: 'frappe' },
  croissant: { id: 'croissant', name: 'קרואסון',     emoji: '🥐', price: 10, prep: 4,   station: 'case',    glb: 'croissant' },
  donut:     { id: 'donut',     name: 'דונאט',       emoji: '🍩', price: 9,  prep: 4,   station: 'case',    glb: 'donut-sprinkles' },
  cupcake:   { id: 'cupcake',   name: 'קאפקייק',     emoji: '🧁', price: 12, prep: 4,   station: 'case',    glb: 'cupcake' },
  cake:      { id: 'cake',      name: 'עוגת שכבות',  emoji: '🍰', price: 16, prep: 5,   station: 'case',    glb: 'cake' },
  waffle:    { id: 'waffle',    name: 'הוופל האגדי', emoji: '🧇', price: 20, prep: 6,   station: 'case',    glb: 'waffle' },
};

// Which menu items are available at a given upgrade state.
export function unlockedMenu(state) {
  const out = ['espresso', 'tea'];
  if (state.upgrades.machine >= 2) out.push('frappe');
  if (state.upgrades.case >= 1) out.push('croissant', 'donut');
  if (state.upgrades.case >= 2) out.push('cupcake', 'cake');
  if (state.upgrades.case >= 3) out.push('waffle');
  return out;
}

// ---------------------------------------------------------------
// Personas — the wacky regulars. minRep gates arrival (0..5 stars).
// patience in seconds, tipMult multiplies the base tip.
// prefers: menu ids they might order (filtered by what's unlocked).
// hat: accessory the 3D peep wears. repBonus: extra rep on success.
// ---------------------------------------------------------------
export const PERSONAS = [
  {
    id: 'hipster', name: 'ניר ההיפסטר', minRep: 0, rarity: 1,
    body: 0xd9a441, hat: 'beanie', patience: 26, tipMult: 1.6,
    prefers: ['espresso', 'frappe'],
    order: ['אספרסו. חד־זני. מאתיופיה. אל תמהר, אבל תזדרז.', 'משהו עם נוטות של פירות יער, ושיהיה אותנטי.'],
    happy: ['וואו. נוטות. של. פירות. יער. 🤌', 'זה כמעט ברמה של ברלין. כמעט.'],
    angry: ['זהו. אני חוזר לברלין.', 'הקפה הזה לא ראוי לפילטר שלי.'],
  },
  {
    id: 'grandma', name: 'סבתא פנינה', minRep: 0, rarity: 1,
    body: 0xb59ce0, hat: 'bun', patience: 70, tipMult: 0.7,
    prefers: ['tea', 'cake', 'croissant'],
    order: ['כוס תה, מתוק שלי. ואם יש עוגה — אז גם עוגה.', 'תה. בלי סוכר. עם שלוש כפיות סוכר.'],
    happy: ['איזה מתוק אתה. קח סוכריה מהתיק.', 'בדיוק כמו שסבא זכרונו לברכה היה מכין.'],
    angry: ['בזמני הקפה עלה גרוש והיה יותר טעים!', 'אני מספרת על זה בחוג ברידג׳.'],
  },
  {
    id: 'student', name: 'דניאל מהתואר בסטטיסטיקה', minRep: 0, rarity: 1,
    body: 0x6fb6ff, hat: 'headphones', patience: 35, tipMult: 1.0,
    prefers: ['espresso', 'donut'],
    order: ['אספרסו כפול. יש לי מבחן בהתפלגות נורמלית בעוד שעה 😱', 'קפאין. הדגימה שלי: כמה שיותר.'],
    happy: ['p קטן מ־0.05! מובהק שזה טעים!', 'סטיית התקן של הטעם הזה — אפסית. מושלם.'],
    angry: ['הסבלנות שלי שואפת לאפס באופן אסימפטוטי...', 'זה חריג. אתם החריג. אני מסיר אתכם מהמדגם.'],
  },
  {
    id: 'influencer', name: 'שירה האינפלואנסרית', minRep: 1, rarity: 0.8,
    body: 0xff8fb1, hat: 'cap', patience: 20, tipMult: 0, repBonus: 0.25,
    prefers: ['frappe', 'cupcake', 'waffle'],
    order: ['את הפראפה הכי פוטוגני שיש. זה לסטורי 🤳', 'משהו ורוד. לא משנה הטעם, רק שיצא טוב בתמונה.'],
    happy: ['מתייגת אתכם!! #קפה_חיים #נסתם_מהטעם', 'שברתם לי את האלגוריתם. בקטע טוב.'],
    angry: ['ביקורת. כוכב אחד. בלי פילטר.', 'הסטורי הבא: "מקומות שאסור להתקרב אליהם".'],
  },
  {
    id: 'tourist', name: 'יורגן התייר מברלין', minRep: 1.5, rarity: 0.8,
    body: 0x54c6a9, hat: 'sunhat', patience: 45, tipMult: 1.3,
    prefers: ['cake', 'waffle', 'espresso'],
    order: ['In Berlin ze coffee is... אה... וופל, ביטה?', 'איין אספרסו! (זה אומר אחד. למדתי בעברית!)'],
    happy: ['!Wunderbar וגם יותר זול מברלין!', 'אני שם את זה על גלויה. Danke!'],
    angry: ['!Zis queue is nicht in Ordnung', 'בברלין התור זז! ...טוב, לא, אבל בכל זאת!'],
  },
  {
    id: 'twinmom', name: 'רוני, אמא של התאומים', minRep: 2, rarity: 0.8,
    body: 0xff9a76, hat: 'messybun', patience: 15, tipMult: 1.9, doubleOrder: true,
    prefers: ['donut', 'croissant', 'espresso'],
    order: ['שני דונאטס. מהר. הם מתעוררים בעוד דקה.', 'קפה. גדול. אל תשאל שאלות.'],
    happy: ['הצלת אותי. שוב. אתה גיבור־על.', 'שקט... שומע? זה קול השקט. בזכותך.'],
    angry: ['עכשיו כולם בוכים. גם אני.', 'התאומים ערים. שיהיה לך בהצלחה. לכולנו.'],
  },
  {
    id: 'hitech', name: 'עופר מההייטק', minRep: 2.5, rarity: 0.8,
    body: 0x8b93a7, hat: 'none', patience: 30, tipMult: 1.4,
    prefers: ['espresso', 'frappe'],
    order: ['משהו עם קפאין. יש לי דיילי בעוד 4 דקות.', 'אספרסו, ותרשום את זה כ״פגישת עבודה״.'],
    happy: ['סגור. שולח לך החזר בביט עם אימוג׳י.', 'זה עבר את ה־code review של הטעם.'],
    angry: ['אני מעביר את הפגישה לסטארבקס.', 'ה־SLA שלכם נשבר. פותח טיקט.'],
  },
  {
    id: 'critic', name: 'המבקר המסתורי', minRep: 3.5, rarity: 0.35,
    body: 0x3d3a4a, hat: 'fedora', patience: 40, tipMult: 2.5, repBonus: 0.5, repPenalty: 0.5,
    prefers: [],  // orders anything — keeps you honest
    order: ['...רק תעשה את זה כמו שצריך.', '(רושם משהו בפנקס קטן ומסתכל עליך)'],
    happy: ['★★★★★ — ״מוסד. נקודה.״', '★★★★★ — ״הוופל בפינה שינה את חיי.״'],
    angry: ['★☆☆☆☆ — ״עדיף נס קפה בבית.״', '★☆☆☆☆ — ״הייתי. לא אחזור. גם אתם אל.״'],
  },
];

// ---------------------------------------------------------------
// Upgrades (מכונה, ויטרינה) + staff + decor. Costs are coins (₪).
// ---------------------------------------------------------------
export const UPGRADES = {
  machine: {
    name: 'מכונת האספרסו', emoji: '⚙️',
    levels: [
      { desc: 'מכונה ביתית חורקת. חליטה אחת בכל פעם.', cost: 0 },
      { desc: 'מכונה איטלקית נוצצת! חליטה מהירה יותר.', cost: 60 },
      { desc: 'מפלצת כרום כפולה: שתי חליטות במקביל + פראפוצ׳ינו!', cost: 220 },
      { desc: 'על־חלל: שלוש חליטות במקביל, מהירות מטורפת.', cost: 520 },
    ],
    // brew speed multiplier and parallel slots per level
    speed: [1, 1.45, 1.9, 2.6],
    slots: [1, 1, 2, 3],
  },
  case: {
    name: 'ויטרינת המאפים', emoji: '🥐',
    levels: [
      { desc: 'אין ויטרינה. רק ריח של חלומות.', cost: 0 },
      { desc: 'ויטרינה קטנה: קרואסונים ודונאטס!', cost: 40 },
      { desc: 'ויטרינה מפוארת: קאפקייקס ועוגות!', cost: 120 },
      { desc: 'ויטרינת הדגל: הוופל האגדי מצטרף לתפריט! 🧇', cost: 300 },
    ],
  },
};

export const STAFF = [
  {
    id: 'tom', name: 'תום הבריסטה', emoji: '🧑‍🍳', cost: 150, interval: 7,
    desc: 'לוקח הזמנות לבד כל 7 שניות. פעם עבד בברלין (יומיים).',
  },
  {
    id: 'cat', name: 'קפוצ׳ינו החתול', emoji: '🐈', cost: 400, interval: 5, ambience: 1,
    desc: 'בריסטה־חתול. מגיש כל 5 שניות, מפיל דברים בטעם. ‎+1 אווירה.',
  },
];

export const DECOR = [
  { id: 'plant',    name: 'עציץ מפלצתי',        emoji: '🪴', cost: 30,  ambience: 1, desc: 'מונסטרה שגדלה מהר מדי. אולי היא מקשיבה.' },
  { id: 'rug',      name: 'שטיח וינטג׳',         emoji: '🟠', cost: 50,  ambience: 1, desc: 'נמצא בשוק הפשפשים. מסתיר כתם מסתורי.' },
  { id: 'waffleclock', name: 'שעון הוופל',       emoji: '🧇', cost: 80,  ambience: 1, desc: 'שעון בצורת וופל. תמיד מראה שעת בין־ערביים של קפה.' },
  { id: 'lights',   name: 'שרשרת נורות',         emoji: '💡', cost: 90,  ambience: 1, desc: 'אווירת חצר ברלינאית, בלי הגשם.' },
  { id: 'gramophone', name: 'פטיפון סבתא',       emoji: '🎶', cost: 120, ambience: 2, desc: 'מנגן רק ג׳אז צרפתי וקצת חריקות.' },
  { id: 'parasol',  name: 'שמשייה ברלינאית',     emoji: '⛱️', cost: 150, ambience: 1, desc: 'ישיבת מדרכה! עכשיו אתם רשמית בית קפה אירופאי.' },
  { id: 'neon',     name: 'שלט ניאון ״קפה״',     emoji: '🔆', cost: 200, ambience: 2, desc: 'ורוד, מהבהב, ורואים אותו מהחלל (בערך).' },
];

// Wacky ambient reviews that float by as toasts while you play.
export const REVIEWS = [
  '★★★★★ ״הבריסטה חייך אליי. חוויה.״',
  '★★★★☆ ״הורדתי כוכב כי נגמר לי הקפה.״',
  '★★★★★ ״החתול חישב לי עודף. נכון.״',
  '★★★☆☆ ״טעים, אבל הוופל שפט אותי.״',
  '★★★★★ ״באתי לרבע שעה, נשארתי שלוש שנים.״',
  '★★★★★ ״הזמנתי תה. קיבלתי משפחה.״',
  '★★☆☆☆ ״העציץ נגע לי ברגל. 10/10 הייתי חוזר.״',
  '★★★★★ ״מקום מעולה ללמוד בו סטטיסטיקה. מובהק.״',
];

// Small tutorial hints, shown once each.
export const HINTS = [
  'לוחצים על לקוח כדי להתחיל להכין את ההזמנה שלו ☕',
  'לכל לקוח יש סבלנות. הפס מתחתיו מתרוקן — הזדרזו!',
  'מטבעות קונים שדרוגים בחנות שלמטה 🛠️',
  'עיצוב בית־הקפה מעלה אווירה — לקוחות סבלניים ונדיבים יותר 🛋️',
  'בריסטה שכיר לוקח הזמנות בשבילכם. אידיאלי לעצלנים אסטרטגיים.',
];

export const STAR_THRESHOLD_LINES = [
  'הכוכב הראשון! מישהו כתב עליכם בקבוצת הוואטסאפ של השכונה.',
  'שני כוכבים! היפסטרים מתחילים להגיע עם מחשבים ניידים.',
  'שלושה כוכבים! מדריך טיולים גרמני הוסיף אתכם למפה.',
  'ארבעה כוכבים! שמועה: המבקר המסתורי מסתובב באזור...',
  'חמישה כוכבים!! אתם רשמית המוסד של השכונה 🏆',
];
