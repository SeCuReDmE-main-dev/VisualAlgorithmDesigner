import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './SpatialCanvas.css';

interface SpatialCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
}

export default function SpatialCanvas({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange
}: SpatialCanvasProps) {
  const [nodes, setNodes, onNodesChangeState] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeState] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Notify parent of changes if needed
  React.useEffect(() => {
    if (onNodesChange) onNodesChange(nodes);
  }, [nodes, onNodesChange]);

  React.useEffect(() => {
    if (onEdgesChange) onEdgesChange(edges);
  }, [edges, onEdgesChange]);

  return (
    <div className="spatial-canvas-container" data-testid="spatial-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeState}
        onEdgesChange={onEdgesChangeState}
        onConnect={onConnect}
        fitView
        className="spatial-canvas-flow"
      >
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            return 'var(--color-node-supervised, #2D6A7A)';
          }}
          maskColor="var(--color-surface-alt, rgba(30, 31, 48, 0.7))"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="var(--color-canvas-dot, #ccc)" />
      </ReactFlow>
    </div>
  );
}
