import { useState, useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { X, Plus, ZoomIn, ZoomOut } from 'lucide-react'

interface MindMapCanvasProps {
  onViewChange: (view: 'study' | 'mindmap' | '3d') => void
}

// Custom node styles for Xmind-like appearance
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    data: { label: 'מתמטיקה' },
    position: { x: 400, y: 200 },
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: '2px solid rgba(255,255,255,0.3)',
      borderRadius: '20px',
      padding: '20px 30px',
      fontSize: '18px',
      fontWeight: 'bold',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
    },
  },
  {
    id: '2',
    data: { label: 'סטטיסטיקה' },
    position: { x: 200, y: 350 },
    style: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '2px solid #667eea',
      borderRadius: '16px',
      padding: '15px 25px',
      fontSize: '16px',
      fontWeight: '600',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: '3',
    data: { label: 'גיאומטריה' },
    position: { x: 400, y: 350 },
    style: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '2px solid #667eea',
      borderRadius: '16px',
      padding: '15px 25px',
      fontSize: '16px',
      fontWeight: '600',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: '4',
    data: { label: 'אלגברה' },
    position: { x: 600, y: 350 },
    style: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '2px solid #667eea',
      borderRadius: '16px',
      padding: '15px 25px',
      fontSize: '16px',
      fontWeight: '600',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: '5',
    data: { label: 'ממוצע' },
    position: { x: 100, y: 500 },
    style: {
      background: 'rgba(236, 253, 245, 0.95)',
      border: '2px solid #10b981',
      borderRadius: '12px',
      padding: '10px 20px',
      fontSize: '14px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
    },
  },
  {
    id: '6',
    data: { label: 'חציון' },
    position: { x: 250, y: 500 },
    style: {
      background: 'rgba(236, 253, 245, 0.95)',
      border: '2px solid #10b981',
      borderRadius: '12px',
      padding: '10px 20px',
      fontSize: '14px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
    },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#667eea', strokeWidth: 2 } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#667eea', strokeWidth: 2 } },
  { id: 'e1-4', source: '1', target: '4', animated: true, style: { stroke: '#667eea', strokeWidth: 2 } },
  { id: 'e2-5', source: '2', target: '5', style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e2-6', source: '2', target: '6', style: { stroke: '#10b981', strokeWidth: 2 } },
]

const MindMapCanvas = ({ onViewChange }: MindMapCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="w-full h-full relative">
      {/* Top Bar */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
        <div className="backdrop-blur-2xl bg-white/90 border border-white/50 rounded-2xl px-6 py-3 shadow-2xl flex items-center gap-4">
          <button
            onClick={() => onViewChange('study')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-800">מפת מושגים - מתמטיקה</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
              <ZoomIn size={18} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
              <ZoomOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      {isPanelOpen && (
        <div className="absolute left-6 top-24 bottom-6 w-80 z-10 pointer-events-auto">
          <div className="h-full backdrop-blur-2xl bg-white/90 border border-white/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col" dir="rtl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">פאנל עריכה</h3>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">הוסף מושג חדש</h4>
                <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg flex items-center justify-center gap-2">
                  <Plus size={18} />
                  הוסף נושא
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">צבעים מומלצים</h4>
                <div className="grid grid-cols-4 gap-2">
                  {['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57', '#ff6b6b', '#ee5a6f'].map(color => (
                    <button
                      key={color}
                      className="w-full h-10 rounded-lg border-2 border-white shadow-md transition-transform hover:scale-110"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">טיפים</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• גרור מושגים כדי לארגן אותם</p>
                  <p>• לחץ לחיצה כפולה לעריכה</p>
                  <p>• גלגל העכבר למרחק/קירוב</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show panel button when closed */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="absolute left-6 top-24 z-10 p-3 backdrop-blur-xl bg-white/90 border border-white/50 rounded-xl shadow-xl hover:bg-white transition-all"
        >
          <Plus size={20} />
        </button>
      )}

      {/* React Flow Canvas */}
      <div className="w-full h-full" dir="ltr">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          style={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          }}
        >
          <Background 
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(0,0,0,0.05)"
          />
          <Controls 
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          />
          <MiniMap 
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
            nodeColor={(node) => {
              if (node.id === '1') return '#667eea'
              if (node.id <= '4') return '#a78bfa'
              return '#10b981'
            }}
          />
        </ReactFlow>
      </div>
    </div>
  )
}

export default MindMapCanvas
