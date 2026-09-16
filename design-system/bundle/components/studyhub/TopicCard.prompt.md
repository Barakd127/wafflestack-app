# TopicCard

One glass tile (`ws-topic-card`) of the topic-selector grid in the WaffleStack study hub — mastery star/book icon, Hebrew topic label + building line, optional gold personal-plan hint chip, stats row (סשנים / ציון הטוב / שאלות), mastery banner, and the 📚 תיאוריה / 📝 תרגול buttons. Extracted from `src/components/StudyHub.tsx` (`TopicSelector`'s `renderTopicCard`, converted from a render function to a component).

```jsx
import { TopicCard } from './TopicCard.jsx';

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, direction: 'rtl' }}>
  <TopicCard
    topic={{ id: 'std-dev', label: 'סטיית תקן', building: 'מדדי פיזור', questionCount: 18 }}
    progress={{ mastered: true, bestScore: 92, sessionsAttempted: 4 }}
    planHint="חיזוק לפני המבחן — התחילי כאן"
    onSelectTopic={(id, mode) => console.log(id, mode)}
  />
</div>
```

## Seams

- Render function → component — same props/markup; the `topic` argument became the `topic` prop.
- `progress` prop — [ds-extract] replaced `userProgress.topics[topic.id]` (progressStore lookup).
- `planHint` prop — [ds-extract] replaced `hintByTopic.get(topic.id)` (personal-plan map).
- `onSelectTopic` prop — the same callback the app threads down from `TopicSelector`; fired with `(topic.id, 'lesson' | 'quiz')`.
