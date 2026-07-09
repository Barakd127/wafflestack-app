// Stat-A course hierarchy: course root -> super-group -> group -> (optional sub-group) -> topicId:label.
// Broad-to-specific ancestry chains are derived by walking COURSE_TREE below.

export type AncestryEntry = { topicId: string; label: string; chain: string[] };

type TreeNode = { [key: string]: TreeNode | string };

const ROOT_LABEL = 'סטטיסטיקה';
const ROOT_COLOR = '#312e81';

// The raw hierarchy, keyed broad -> specific. Leaf values (strings) are
// "topicId: hebrewLabel" pairs; everything else is a nested group/sub-group
// keyed by its own Hebrew label.
const COURSE_TREE: TreeNode = {
  'סטטיסטיקה תיאורית': {
    'מדדים סטטיסטיים תמציתיים': {
      'מדדי מרכז': {
        mean: 'ממוצע',
        median: 'חציון',
        'distribution-shapes': 'צורות התפלגות',
      },
      'מדדי פיזור': {
        'std-dev': 'שונות וסטיית תקן',
        percentiles: 'אחוזונים',
      },
      'חישובי הרחבה': {
        'weighted-combined': 'ממוצע משוקלל ומשולב',
        'observation-changes': 'השפעת תצפיות',
        'linear-transformations': 'טרנספורמציות ליניאריות',
      },
    },
    'יסודות והצגת נתונים': {
      intro: 'מבוא לסטטיסטיקה',
      'variable-types': 'סוגי משתנים',
      'data-presentation': 'הצגת נתונים',
    },
    'מתאם ורגרסיה': {
      correlation: 'מתאם',
      pearson: 'מתאם פירסון',
      spearman: 'מתאם ספירמן',
      cramer: 'מקדם קרמר',
      regression: 'רגרסיה ליניארית',
    },
  },
  'סטטיסטיקה היסקית': {
    הסתברות: {
      probability: 'הסתברות',
      combinatorics: 'קומבינטוריקה',
    },
    'משתנים מקריים': {
      'discrete-rv': 'משתנה מקרי בדיד',
      binomial: 'התפלגות בינומית',
    },
    'דגימה והסקה': {
      sampling: 'דגימה ושגיאת תקן',
      'confidence-intervals': 'רווחי סמך',
      'hypothesis-testing': 'בדיקת השערות',
    },
  },
};

function isLeaf(value: TreeNode | string): value is string {
  return typeof value === 'string';
}

function walkTree(node: TreeNode, ancestors: string[], out: Record<string, string[]>): void {
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (isLeaf(value)) {
      // key = topicId, value = the topic's own Hebrew label.
      out[key] = [...ancestors, value];
    } else {
      walkTree(value, [...ancestors, key], out);
    }
  }
}

function buildAncestry(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  walkTree(COURSE_TREE, [], out);
  return out;
}

export const TOPIC_ANCESTRY: Record<string, string[]> = buildAncestry();

export function ancestryOf(topicId: string): string[] {
  return TOPIC_ANCESTRY[topicId] ?? [];
}

export { ROOT_LABEL, ROOT_COLOR, COURSE_TREE };
