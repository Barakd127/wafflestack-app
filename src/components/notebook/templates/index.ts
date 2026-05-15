/**
 * Phase 2 starter template registry. Add new templates here so they show
 * up in the Templates dropdown automatically.
 */
import type { NotebookTemplate } from './types'
import { cornellNotesTemplate } from './cornellNotes'
import { mindMapStarterTemplate } from './mindMapStarter'
import { equationReferenceSheetTemplate } from './equationReferenceSheet'
import { dailyLogTemplate } from './dailyLog'
import { projectPlanTemplate } from './projectPlan'
import { quickSketchnotesTemplate } from './quickSketchnotes'

export const NOTEBOOK_TEMPLATES: NotebookTemplate[] = [
  cornellNotesTemplate,
  mindMapStarterTemplate,
  equationReferenceSheetTemplate,
  dailyLogTemplate,
  projectPlanTemplate,
  quickSketchnotesTemplate,
]
