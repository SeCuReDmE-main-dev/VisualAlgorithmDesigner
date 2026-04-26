import { useCallback, useMemo, useState } from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  EdgeChange,
  MiniMap,
  Node,
  NodeChange,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import AlgorithmNode, { AlgorithmNodeData } from './AlgorithmNode';
import CanvasContextMenu from './CanvasContextMenu';
import CanvasEmptyState from './CanvasEmptyState';
import { getAlgorithmById, getDefaultParams } from '../../services/algorithmCatalog';
import { useDnD } from '../../contexts/DnDContext';

interface AlgorithmCanvasProps {
  nodes: Node<AlgorithmNodeData>[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node<AlgorithmNodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onSelectedNodeChange: (nodeId: string | null) => void;
  onSaveRequested: () => void;
  onClearRequested: () => void;
}

const nodeTypes = { algorithmNode: AlgorithmNode };

function buildAlgorithmNode(algorithmId: string, position: { x: number; y: number }, override?: Partial<AlgorithmNodeData>): Node<AlgorithmNodeData> {
  const algorithm = getAlgorithmById(algorithmId);
  const id = `${algorithmId}-${uuidv4()}`;

  return {
    id,
    type: 'algorithmNode',
    position,
    data: {
      algorithmId,
      label: algorithm?.label ?? algorithmId,
      category: algorithm?.category ?? 'data',
      description: algorithm?.description,
      params: algorithm ? getDefaultParams(algorithmId) : {},
      ...override,
    },
  };
}

export default function AlgorithmCanvas({ nodes, edges, setNodes, setEdges, onSelectedNodeChange, onSaveRequested, onClearRequested }: AlgorithmCanvasProps) {
  const { dragPayload, clearDrag } = useDnD();
  const { screenToFlowPosition } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<{ open: boolean; x: number; y: number }>({ open: false, x: 0, y: 0 });
  const reactFlowNodes = useMemo(() => nodes, [nodes]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((current) => applyNodeChanges(changes, current) as Node<AlgorithmNodeData>[]), [setNodes]);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((current) => applyEdgeChanges(changes, current)), [setEdges]);
  const onConnect = useCallback(
    (connection: Parameters<typeof addEdge>[0]) => setEdges((current) => addEdge({ ...connection, animated: true }, current)),
    [setEdges],
  );

  const addAlgorithmAt = useCallback(
    (algorithmId: string, position: { x: number; y: number }, override?: Partial<AlgorithmNodeData>) => {
      setNodes((current) => current.concat(buildAlgorithmNode(algorithmId, position, override)));
    },
    [setNodes],
  );

  const addPrefabAt = useCallback(
    (position: { x: number; y: number }) => {
      if (!dragPayload?.prefabNodes) {
        return;
      }

      const idMap = new Map<string, string>();
      dragPayload.prefabNodes.forEach((node) => idMap.set(node.id, `${node.id}-${uuidv4()}`));

      const nextNodes: Node<AlgorithmNodeData>[] = dragPayload.prefabNodes.map((node, index) => {
        const nextId = idMap.get(node.id) ?? `${node.id}-${uuidv4()}`;
        const nodeData = node.data as AlgorithmNodeData;
        return {
          id: nextId,
          type: 'algorithmNode',
          position: {
            x: position.x + node.position.x,
            y: position.y + node.position.y,
          },
          className: 'vad-node-drop',
          style: { animationDelay: `${index * 80}ms` },
          data: {
            ...nodeData,
            coherenceScore: dragPayload.coherenceScore,
            isPrefab: true,
          },
        };
      });

      const nextEdges: Edge[] = (dragPayload.prefabEdges ?? []).map((edge) => ({
        ...edge,
        id: `${edge.id}-${uuidv4()}`,
        source: idMap.get(edge.source) ?? edge.source,
        target: idMap.get(edge.target) ?? edge.target,
        animated: true,
      }));

      setNodes((current) => current.concat(nextNodes));
      setEdges((current) => current.concat(nextEdges));
    },
    [dragPayload, setEdges, setNodes],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

      if (dragPayload?.isPrefab) {
        addPrefabAt(position);
      } else if (dragPayload?.algorithmId) {
        addAlgorithmAt(dragPayload.algorithmId, position, {
          label: dragPayload.label,
          category: dragPayload.category,
          coherenceScore: dragPayload.coherenceScore,
        });
      }

      clearDrag();
    },
    [addAlgorithmAt, addPrefabAt, clearDrag, dragPayload, screenToFlowPosition],
  );

  const handleContextAdd = useCallback(
    (algorithmId: string) => {
      const position = screenToFlowPosition({ x: contextMenu.x, y: contextMenu.y });
      addAlgorithmAt(algorithmId, position);
      setContextMenu((current) => ({ ...current, open: false }));
    },
    [addAlgorithmAt, contextMenu.x, contextMenu.y, screenToFlowPosition],
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        setContextMenu({ open: true, x: event.clientX, y: event.clientY });
      }}
      className="alg-canvas-root"
    >
      {nodes.length === 0 && <CanvasEmptyState />}
      <ReactFlow
        nodes={reactFlowNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={({ nodes: selectedNodes }) => onSelectedNodeChange(selectedNodes[0]?.id ?? null)}
        fitView
      >
        <Background color="var(--color-canvas-dot)" variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap nodeColor="var(--color-primary)" style={{ background: 'var(--color-minimap-bg)' }} />
      </ReactFlow>
      <CanvasContextMenu
        open={contextMenu.open}
        x={contextMenu.x}
        y={contextMenu.y}
        onAddAlgorithm={handleContextAdd}
        onSave={onSaveRequested}
        onClear={() => {
          onClearRequested();
          setContextMenu((current) => ({ ...current, open: false }));
        }}
        onClose={() => setContextMenu((current) => ({ ...current, open: false }))}
      />
    </div>
  );
}
