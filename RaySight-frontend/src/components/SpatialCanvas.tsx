import { memo, useEffect, useMemo, useRef } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  EdgeChange,
  Connection,
  MiniMap,
  Node,
  NodeChange,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AlgorithmNodeData } from './AlgorithmDesigner/AlgorithmNode';
import AlgorithmNode from './AlgorithmDesigner/AlgorithmNode';
import AlgorithmEdge from './AlgorithmDesigner/AlgorithmEdge';
import '../styles/canvas.css';

export interface SpatialCanvasProps {
  nodes: Node<AlgorithmNodeData>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange<Node<AlgorithmNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onSelectionChange: (selectedNodeId: string | null) => void;
  /** Whether to show the minimap (default: true) */
  showMinimap?: boolean;
  /** Whether to show the controls overlay (default: true) */
  showControls?: boolean;
  /** Extra class name for the root wrapper */
  className?: string;
  /** Children rendered inside the flow (e.g., empty-state, context menu) */
  children?: React.ReactNode;
  /** Custom node types (merged with algorithmNode) */
  nodeTypes?: Record<string, React.ComponentType<unknown>>;
  /** Whether to call fitView on mount (default: true) */
  fitView?: boolean;
  isValidConnection?: (connection: Edge | Connection) => boolean;
}

const defaultNodeTypes = { algorithmNode: AlgorithmNode };
const defaultEdgeTypes = { algorithmEdge: AlgorithmEdge };

function SpatialCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectionChange,
  showMinimap = true,
  showControls = true,
  className,
  children,
  nodeTypes,
  fitView = true,
  isValidConnection,
}: SpatialCanvasProps) {
  const { fitView: rfFitView } = useReactFlow();

  // Auto-fit on initial mount
  const didFitView = useRef(false);
  useEffect(() => {
    if (fitView && !didFitView.current && nodes.length > 0) {
      // Small delay so ReactFlow layout settles
      const timer = setTimeout(() => {
        rfFitView({ padding: 0.2, duration: 300, maxZoom: 1 });
        didFitView.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [fitView, nodes.length, rfFitView]);

  const mergedNodeTypes = useMemo(
    () => ({ ...defaultNodeTypes, ...nodeTypes }),
    [nodeTypes],
  );

  return (
    <div
      className={`spatial-canvas${className ? ` ${className}` : ''}`}
      data-testid="algorithm-canvas-drop-surface"
      data-vad-drop-zone="canvas"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={mergedNodeTypes}
        edgeTypes={defaultEdgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectOnClick
        connectionRadius={40}
        isValidConnection={isValidConnection}
        onSelectionChange={({ nodes: selectedNodes }) =>
          onSelectionChange(selectedNodes[0]?.id ?? null)
        }
        fitView={fitView && !didFitView.current}
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
        selectionKeyCode={null}
        panActivationKeyCode="Space"
        selectNodesOnDrag
        snapToGrid
        snapGrid={[20, 20]}
        connectionLineStyle={{
          stroke: 'rgba(23, 105, 232, 0.55)',
          strokeWidth: 2,
          strokeDasharray: '4 2',
        }}
        defaultEdgeOptions={{
          type: 'algorithmEdge',
          animated: true,
          style: {
            stroke: 'rgba(23, 105, 232, 0.42)',
            strokeWidth: 1.8,
          },
        }}
      >
        <Background
          color="var(--spatial-dot-color)"
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
        />

        {showControls && (
          <div className="vad-canvas-controls" data-testid="canvas-controls" data-vad-drop-exclude="true">
            <Controls
              position="bottom-left"
              showInteractive={false}
            />
          </div>
        )}

        {showMinimap && (
          <MiniMap
            data-vad-drop-exclude="true"
            nodeColor="var(--color-primary)"
            maskColor="rgba(248, 251, 255, 0.72)"
            style={{ background: 'var(--canvas-control-bg)' }}
            pannable
            zoomable
          />
        )}

        {children}
      </ReactFlow>
    </div>
  );
}

export default memo(SpatialCanvas);
