import { useEffect, useRef } from 'react'

interface MindMapCanvasProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d') => void
}

const MindMapCanvas = ({ onViewChange }: MindMapCanvasProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data === 'close-mindmap') onViewChange('study')
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onViewChange])

  return (
    <div className="w-full h-full">
      <iframe
        ref={iframeRef}
        src="/xmind-replica.html"
        className="w-full h-full border-none"
        title="Mind Map"
        allow="fullscreen"
      />
    </div>
  )
}

export default MindMapCanvas