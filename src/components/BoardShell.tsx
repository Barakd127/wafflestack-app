/**
 * BoardShell — picks the lesson/quiz board surface.
 *
 * Glass flag ON  → GlassBoardShell (pane of glass in front of the knowledge city).
 * Glass flag OFF → WhiteboardShell, byte-identical to before (extra glass props
 *                  are simply not forwarded).
 */
import WhiteboardShell from './WhiteboardShell'
import GlassBoardShell from './glass/GlassBoardShell'
import type { GlassBoardShellProps } from './glass/GlassBoardShell'
import { useGlassBoard } from '../hooks/useGlassBoard'

export default function BoardShell(props: GlassBoardShellProps) {
  const [glass] = useGlassBoard()
  if (glass) return <GlassBoardShell {...props} />
  const { children, style, topRightSlot } = props
  return <WhiteboardShell style={style} topRightSlot={topRightSlot}>{children}</WhiteboardShell>
}
