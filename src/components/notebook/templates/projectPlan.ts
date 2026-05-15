/**
 * Project Plan — Goal / Tasks / Risks / Next steps layout.
 */
import type { NotebookTemplate } from './types'

export const projectPlanTemplate: NotebookTemplate = {
  id: 'project-plan',
  label: 'תוכנית פרויקט',
  description: 'מטרה, משימות, סיכונים, צעדים הבאים',
  pageName: 'תוכנית פרויקט',
  paperStyle: 'grid',
  shapes: [
    {
      type: 'note-container',
      x: 80,
      y: 60,
      props: { w: 720, h: 50, text: 'תוכנית פרויקט', fontSize: 22, tags: ['project'] },
    },
    {
      type: 'note-container',
      x: 80,
      y: 140,
      props: { w: 340, h: 120, text: '🎯 מטרה:', fontSize: 16, tags: ['goal'] },
    },
    {
      type: 'note-container',
      x: 460,
      y: 140,
      props: { w: 340, h: 120, text: '⚠️ סיכונים:', fontSize: 16, tags: ['risks'] },
    },
    {
      type: 'note-container',
      x: 80,
      y: 290,
      props: { w: 340, h: 200, text: '✅ משימות:\n[ ]\n[ ]\n[ ]', fontSize: 16, tags: ['tasks'] },
    },
    {
      type: 'note-container',
      x: 460,
      y: 290,
      props: { w: 340, h: 200, text: '➡️ צעדים הבאים:\n1.\n2.\n3.', fontSize: 16, tags: ['next'] },
    },
  ],
}
