/**
 * Cornell Notes template — three regions:
 *   • Cue column on the right (RTL canvas: right = leading side)
 *   • Notes area on the left
 *   • Summary band along the bottom
 *
 * Implemented as three note-containers + two thin geo dividers.
 */
import type { NotebookTemplate } from './types'

export const cornellNotesTemplate: NotebookTemplate = {
  id: 'cornell-notes',
  label: 'מחברת קורנל',
  description: 'שיטת קורנל — רמזים, הערות, סיכום',
  pageName: 'מחברת קורנל',
  paperStyle: 'ruled',
  shapes: [
    {
      type: 'note-container',
      x: 80,
      y: 80,
      props: {
        w: 220,
        h: 60,
        text: 'רמזים / מילות מפתח',
        fontSize: 16,
        tags: ['cornell-cue'],
      },
    },
    {
      type: 'note-container',
      x: 340,
      y: 80,
      props: {
        w: 460,
        h: 60,
        text: 'הערות מהשיעור',
        fontSize: 16,
        tags: ['cornell-notes'],
      },
    },
    {
      type: 'note-container',
      x: 80,
      y: 540,
      props: {
        w: 720,
        h: 80,
        text: 'סיכום',
        fontSize: 16,
        tags: ['cornell-summary'],
      },
    },
  ],
}
