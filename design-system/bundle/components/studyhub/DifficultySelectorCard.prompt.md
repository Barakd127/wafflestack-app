# DifficultySelectorCard

One clickable difficulty tile in the quiz-intro 4-up grid of the WaffleStack study hub — emoji icon, Hebrew label, question count; the selected tile fills with the difficulty color, lifts 2px and casts a colored shadow, disabled tiles fade to 0.4 opacity. Extracted from `src/components/StudyHub.tsx` (`DifficultySelectorCard`).

```jsx
import { DifficultySelectorCard } from './DifficultySelectorCard.jsx';

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, maxWidth: 470, direction: 'rtl' }}>
  <DifficultySelectorCard label="הכל" count={18} icon="🎯" color="#6366f1" bg="rgba(99,102,241,0.12)" selected onClick={() => {}} />
  <DifficultySelectorCard label="קל" count={7} icon="🌱" color="#10b981" bg="rgba(16,185,129,0.12)" selected={false} onClick={() => {}} />
  <DifficultySelectorCard label="בינוני" count={8} icon="⚡" color="#f59e0b" bg="rgba(245,158,11,0.12)" selected={false} onClick={() => {}} />
  <DifficultySelectorCard label="מאתגר" count={0} icon="🔥" color="#ef4444" bg="rgba(239,68,68,0.12)" selected={false} onClick={() => {}} disabled />
</div>
```

## Seams

- None — the source component is already pure props (label/count/icon/color/bg/selected/onClick/disabled); only TypeScript annotations were stripped.
