/**
 * Quick Sketchnotes — a loose grid of empty note-containers + a header
 * inviting the user to start sketching. Best paired with the highlighter
 * tool and the pen.
 */
import type { NotebookTemplate } from './types'

export const quickSketchnotesTemplate: NotebookTemplate = {
  id: 'quick-sketchnotes',
  label: 'סקיצות מהירות',
  description: 'תבנית פתוחה לרישום ויזואלי',
  pageName: 'סקיצות',
  paperStyle: 'dots',
  shapes: [
    {
      type: 'note-container',
      x: 80,
      y: 60,
      props: { w: 720, h: 50, text: '✏️ סקיצות מהירות', fontSize: 22, tags: ['sketch'] },
    },
    {
      type: 'note-container',
      x: 80,
      y: 140,
      props: { w: 220, h: 160, text: 'רעיון 1', fontSize: 14, tags: [] },
    },
    {
      type: 'note-container',
      x: 330,
      y: 140,
      props: { w: 220, h: 160, text: 'רעיון 2', fontSize: 14, tags: [] },
    },
    {
      type: 'note-container',
      x: 580,
      y: 140,
      props: { w: 220, h: 160, text: 'רעיון 3', fontSize: 14, tags: [] },
    },
    {
      type: 'note-container',
      x: 80,
      y: 330,
      props: { w: 470, h: 180, text: 'סקיצה גדולה', fontSize: 14, tags: [] },
    },
    {
      type: 'note-container',
      x: 580,
      y: 330,
      props: { w: 220, h: 180, text: 'הערות צד', fontSize: 14, tags: [] },
    },
  ],
}
