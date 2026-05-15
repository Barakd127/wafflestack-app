/**
 * Daily Log — a structured journaling page: date, top-3 priorities,
 * gratitude, and reflections.
 */
import type { NotebookTemplate } from './types'

const today = () => {
  const d = new Date()
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

export const dailyLogTemplate: NotebookTemplate = {
  id: 'daily-log',
  label: 'יומן יומי',
  description: 'משימות, הכרת תודה, רפלקציה',
  pageName: `יומן ${today()}`,
  paperStyle: 'ruled',
  shapes: [
    {
      type: 'note-container',
      x: 80,
      y: 60,
      props: {
        w: 720,
        h: 50,
        text: `יומן — ${today()}`,
        fontSize: 22,
        tags: ['daily'],
      },
    },
    {
      type: 'note-container',
      x: 80,
      y: 140,
      props: { w: 340, h: 200, text: '🎯 שלוש משימות מרכזיות:\n1.\n2.\n3.', fontSize: 16, tags: ['priorities'] },
    },
    {
      type: 'note-container',
      x: 460,
      y: 140,
      props: { w: 340, h: 200, text: '🙏 הכרת תודה:\n•\n•\n•', fontSize: 16, tags: ['gratitude'] },
    },
    {
      type: 'note-container',
      x: 80,
      y: 370,
      props: { w: 720, h: 220, text: '📝 רפלקציה / הערות היום', fontSize: 16, tags: ['reflection'] },
    },
  ],
}
