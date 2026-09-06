/**
 * BoardShell — the lesson/quiz board surface.
 *
 * There is one board now: the pane of glass in front of the knowledge city.
 * The whiteboard it replaced is no longer reachable, and the flag that used to
 * choose between them is gone with it — WhiteboardShell stays in the tree only
 * because GlassBoardShell takes its props type, and tree-shaking drops the
 * component itself since nothing renders it any more.
 */
import GlassBoardShell from './glass/GlassBoardShell'
import type { GlassBoardShellProps } from './glass/GlassBoardShell'

export default function BoardShell(props: GlassBoardShellProps) {
  return <GlassBoardShell {...props} />
}
