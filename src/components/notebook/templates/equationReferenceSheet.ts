/**
 * Equation Reference Sheet — pre-loaded with classic formulas as editable
 * EquationShape instances. Each formula is double-clickable to edit.
 */
import type { NotebookTemplate } from './types'

export const equationReferenceSheetTemplate: NotebookTemplate = {
  id: 'equation-reference-sheet',
  label: 'גיליון נוסחאות',
  description: 'נוסחאות יסוד — לחיצה כפולה לעריכה',
  pageName: 'גיליון נוסחאות',
  paperStyle: 'grid',
  shapes: [
    {
      type: 'note-container',
      x: 80,
      y: 60,
      props: { w: 600, h: 50, text: 'נוסחאות יסוד', fontSize: 22, tags: ['ref'] },
    },
    {
      type: 'equation',
      x: 80,
      y: 140,
      props: { w: 260, h: 60, latex: 'a^2 + b^2 = c^2', fontSize: 20 },
    },
    {
      type: 'equation',
      x: 80,
      y: 230,
      props: { w: 260, h: 60, latex: 'E = mc^2', fontSize: 20 },
    },
    {
      type: 'equation',
      x: 80,
      y: 320,
      props: {
        w: 320,
        h: 70,
        latex: '\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i',
        fontSize: 20,
      },
    },
    {
      type: 'equation',
      x: 420,
      y: 140,
      props: {
        w: 320,
        h: 80,
        latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
        fontSize: 20,
      },
    },
    {
      type: 'equation',
      x: 420,
      y: 250,
      props: {
        w: 280,
        h: 70,
        latex: '\\int_a^b f(x)\\,dx',
        fontSize: 20,
      },
    },
  ],
}
