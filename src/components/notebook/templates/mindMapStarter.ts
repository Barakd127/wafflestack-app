/**
 * Mind Map starter — a central node with 4 radial children.
 * Uses native tldraw geo shapes for ovals; the central node is a
 * note-container so the user can immediately type into it.
 */
import type { NotebookTemplate } from './types'

const CX = 480
const CY = 320

export const mindMapStarterTemplate: NotebookTemplate = {
  id: 'mind-map-starter',
  label: 'מפת חשיבה',
  description: 'נושא מרכזי + 4 ענפים',
  pageName: 'מפת חשיבה',
  paperStyle: 'dots',
  shapes: [
    {
      type: 'note-container',
      x: CX - 90,
      y: CY - 30,
      props: { w: 180, h: 60, text: 'הנושא המרכזי', fontSize: 20, tags: [] },
    },
    {
      type: 'note-container',
      x: CX - 90,
      y: CY - 220,
      props: { w: 180, h: 50, text: 'ענף 1', fontSize: 16, tags: [] },
    },
    {
      type: 'note-container',
      x: CX - 90,
      y: CY + 160,
      props: { w: 180, h: 50, text: 'ענף 2', fontSize: 16, tags: [] },
    },
    {
      type: 'note-container',
      x: CX - 320,
      y: CY - 30,
      props: { w: 180, h: 50, text: 'ענף 3', fontSize: 16, tags: [] },
    },
    {
      type: 'note-container',
      x: CX + 140,
      y: CY - 30,
      props: { w: 180, h: 50, text: 'ענף 4', fontSize: 16, tags: [] },
    },
  ],
}
