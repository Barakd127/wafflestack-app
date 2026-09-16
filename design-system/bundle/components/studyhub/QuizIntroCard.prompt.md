# QuizIntroCard

The centred quiz preview screen (`ws-quiz-intro`) shown before launching a practice quiz in the WaffleStack study hub — 📝 header ("תרגול: <topic>"), 4-up difficulty selector (הכל/קל/בינוני/מאתגר via `DifficultySelectorCard`), indigo pep-talk panel, and the start / read-theory / back action row. Extracted from `src/components/StudyHub.tsx` (`QuizIntroCard`).

```jsx
import { QuizIntroCard } from './QuizIntroCard.jsx';

<QuizIntroCard
  topicName="סטיית תקן"
  counts={{ all: 18, easy: 7, medium: 8, hard: 3 }}
  hasLesson={true}
  onStart={(difficulty) => console.log('התחל תרגול', difficulty)}
  onReadLesson={() => console.log('קרא תיאוריה')}
  onBack={() => console.log('חזרה')}
/>
```

## Seams

- `topicName` prop — [ds-extract] replaced `HEBREW_LABELS[topicId] || quizBankData.topics[topicId]?.concept` lookup.
- `counts` prop — [ds-extract] replaced the per-difficulty counts derived from `quizBankData.topics[topicId].questions`.
- `hasLesson` prop — [ds-extract] replaced the `LESSON_CONTENT` / `LESSON_CONTENT_STAT_B` / `LESSON_CONTENT_SQL` / `LESSON_CONTENT_ANOVA` `.some(t => t.id === topicId)` check.
- `onStart` / `onBack` / `onReadLesson` — the same callback props as the source (quiz-start + navigation seamed to the host).
- The selected-difficulty `useState` is kept as-is (self-contained interactivity from the real component).
