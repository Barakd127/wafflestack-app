# CourseCard

One `ws-glass-card` tile of the "הקורסים שלי" course-gate grid in the WaffleStack study hub — sidebar-language icon chip (`--sh-sidebar-bg` + stroke-only `CourseIcon`), course label, description, and the "בקרוב" pin on inactive courses. Extracted from `src/components/StudyHub.tsx` (`CourseGate`'s `COURSES.map` tile; `COURSES` and `CourseIcon` copied verbatim).

```jsx
import { CourseCard, COURSES } from './CourseCard.jsx';

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22, maxWidth: 1200, direction: 'rtl' }}>
  {COURSES.map(c => (
    <CourseCard key={c.id} course={c} onSelect={(course) => console.log('נבחר קורס', course.label)} />
  ))}
</div>
```

`COURSES` is the REAL 5-entry array (סטטיסטיקה א' / סטטיסטיקה ב' / שיטות מחקר / ניתוח שונות ורגרסיה / SQL) with the verbatim gradients (`bg`), emoji `icon` fields, Hebrew descriptions and `active` flags.

## Seams

- `onSelect` prop — [ds-extract] replaced `pickCourse(c)` routing (coming-soon modal for inactive courses, `window.open(pageUrl)`, embedded `CoursePlayer`, and `onSelectActive(c.id)`); the tile markup is unchanged.
