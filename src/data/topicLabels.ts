// Shared Hebrew labels for topic ids. Extracted from StudyHub.tsx so other
// components (e.g. PersonalPlanWizard) can render Hebrew names without risking
// a circular import back through StudyHub. The quiz-bank `concept` field is
// English; this maps each topic id to its Hebrew display name.
export const HEBREW_LABELS: Record<string, string> = {
  // Original 10 (have quiz banks in quiz-bank.json)
  'mean':                  'ממוצע',
  'median':                'חציון',
  'std-dev':               'שונות וסטיית תקן',
  'probability':           'הסתברות',
  'regression':            'רגרסיה ליניארית',
  'correlation':           'מתאם (סקירה)',
  'binomial':              'התפלגות בינומית',
  'hypothesis-testing':    'התפלגות נורמלית',
  'sampling':              'דגימה',
  'confidence-intervals':  'רווחי סמך',
  // 11 new lesson topics added 2026-05-04 to match the 30111 syllabus
  'intro':                 'הקדמה לסטטיסטיקה',
  'variable-types':        'סוגי משתנים וסולמות',
  'data-presentation':     'הצגת נתונים',
  'distribution-shapes':   'צורות התפלגות',
  'weighted-combined':     'ממוצע משוקלל ושונות מצורפת',
  'observation-changes':   'הוספה והחסרה של תצפיות',
  'linear-transformations': 'טרנספורמציות ליניאריות',
  'percentiles':           'אחוזונים ומיקום יחסי',
  'combinatorics':         'קומבינטוריקה',
  'discrete-rv':           'משתנה מקרי בדיד',
  'pearson':               'מתאם פירסון',
  'spearman':              'מתאם ספירמן',
  'cramer':                'מתאם קרמר',
}
