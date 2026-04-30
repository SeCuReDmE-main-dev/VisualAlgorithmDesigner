import { memo, useEffect, useMemo, useRef } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AlgorithmNodeData } from './AlgorithmDesigner/AlgorithmNode';
import AlgorithmNode from './AlgorithmDesigner/AlgorithmNode';
import '../styles/canvas.css';

/**
 * SpatialCanvas — Cosmic-themed algorithm design space.
 *
 * Implements the DESIGN.md spatial computing interface:
 *   • Deep space background (#0D1117) with radial amber gradient
 *   • ReactFlow dot grid for spatial reference
 *   • Native cursors: grab (idle), grabbing (pan), crosshair (connect)
 *   • Glassmorphic controls & minimap
 *   • Glow/pulse effects from DESIGN.md tokens
 *
 * Composes with the existing AlgorithmCanvas internals via shared
 * nodeTypes, DnD context, and edge styling. Apply the `.spatial-canvas`
 * class to the root for cosmic theme activation.
 */

export interface SpatialCanvasProps {
  nodes: Node<AlgorithmNodeData>[];
  edges: Edge[];
  onNodesChange: (changes: Parameters<typeof import('@xyflow/react').applyNodeChanges>[0]) => void;
  onEdgesChange: (changes: Parameters<typeof import('@xyflow/react').applyEdgeChanges>[0]) => void;
  onConnect: (connection: Parameters<typeof import('@xyflow/react').addEdge>[0]) => void;
  onSelectionChange: (selectedNodeId: string | null) => void;
  /** Whether to show the glassmorphic minimap (default: true) */
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
}

const defaultNodeTypes = { algorithmNode: AlgorithmNode };

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
}: SpatialCanvasProps) {
  const { fitView: rfFitView } = useReactFlow();

  // Auto-fit on initial mount
  const didFitView = useRef(false);
  useEffect(() => {
    if (fitView && !didFitView.current && nodes.length > 0) {
      // Small delay so ReactFlow layout settles
      const timer = setTimeout(() => {
        rfFitView({ padding: 0.2, duration: 300 });
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
      data-testid="spatial-canvas"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={mergedNodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={({ nodes: selectedNodes }) =>
          onSelectionChange(selectedNodes[0]?.id ?? null)
        }
        fitView={fitView && !didFitView.current}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
        selectionKeyCode={null}
        panActivationKeyCode="Space"
        selectNodesOnDrag={false}
        connectionLineStyle={{
          stroke: 'rgba(255, 183, 77, 0.5)',
          strokeWidth: 2,
          strokeDasharray: '4 2',
        }}
        defaultEdgeOptions={{
          animated: true,
          style: {
            stroke: 'rgba(255, 255, 255, 0.12)',
            strokeWidth: 1.5,
          },
        }}
      >
        {/* Cosmic dot grid — spatial reference without visual clutter */}
        <Background
          color="var(--spatial-dot-color)"
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
        />

        {/* Glassmorphic controls */}
        {showControls && (
          <Controls
            position="bottom-right"
            showInteractive={false}
          />
        )}

        {/* Glassmorphic minimap */}
        {showMinimap && (
          <MiniMap
            nodeColor="var(--spatial-amber)"
            maskColor="rgba(13, 17, 23, 0.7)"
            style={{ background: 'var(--glass-bg)' }}
            pannable
            zoomable
          />
        )}

        {/* External children (empty state, context menu, etc.) */}
        {children}
      </ReactFlow>
    </div>
  );
}

export default memo(SpatialCanvas);
