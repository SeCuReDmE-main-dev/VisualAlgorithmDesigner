import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  useReactFlow,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import SpatialCanvas from '../SpatialCanvas';
import { AlgorithmNodeData } from './AlgorithmNode';
import CanvasContextMenu from './CanvasContextMenu';
import CanvasEmptyState from './CanvasEmptyState';
import '../../styles/canvas.css';
import '../../styles/edges.css';
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
  const { dragPayload, pointerPosition, isPointerDragging, movePointerDrag, clearDrag } = useDnD();
  const { screenToFlowPosition } = useReactFlow();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{ open: boolean; x: number; y: number }>({ open: false, x: 0, y: 0 });
  const [dropActive, setDropActive] = useState(false);
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

  const addDragPayloadAt = useCallback(
    (position: { x: number; y: number }) => {
      if (dragPayload?.isPrefab) {
        addPrefabAt(position);
      } else if (dragPayload?.algorithmId) {
        addAlgorithmAt(dragPayload.algorithmId, position, {
          label: dragPayload.label,
          category: dragPayload.category,
          coherenceScore: dragPayload.coherenceScore,
        });
      }
    },
    [addAlgorithmAt, addPrefabAt, dragPayload],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

      addDragPayloadAt(position);

      clearDrag();
    },
    [addDragPayloadAt, clearDrag, screenToFlowPosition],
  );

  useEffect(() => {
    if (!isPointerDragging || !dragPayload) {
      setDropActive(false);
      return undefined;
    }

    const isInsideCanvas = (x: number, y: number) => {
      const bounds = rootRef.current?.getBoundingClientRect();
      return Boolean(bounds && x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom);
    };

    const handlePointerMove = (event: PointerEvent) => {
      movePointerDrag({ x: event.clientX, y: event.clientY });
      setDropActive(isInsideCanvas(event.clientX, event.clientY));
    };

    const handlePointerUp = (event: PointerEvent) => {
      const insideCanvas = isInsideCanvas(event.clientX, event.clientY);
      if (insideCanvas) {
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        addDragPayloadAt(position);
      }

      setDropActive(false);
      clearDrag();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropActive(false);
        clearDrag();
      }
    };

    if (pointerPosition) {
      setDropActive(isInsideCanvas(pointerPosition.x, pointerPosition.y));
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [addDragPayloadAt, clearDrag, dragPayload, isPointerDragging, movePointerDrag, pointerPosition, screenToFlowPosition]);

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
      ref={rootRef}
      onDrop={handleDrop}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        setContextMenu({ open: true, x: event.clientX, y: event.clientY });
      }}
      className={`alg-canvas-root${dropActive ? ' alg-canvas-root--drop-active' : ''}`}
    >
      {dropActive && (
        <div className="vad-drop-target">
          <span>Release to place</span>
        </div>
      )}
      <SpatialCanvas
        nodes={reactFlowNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectedNodeChange}
        fitView
      >
        {nodes.length === 0 && <CanvasEmptyState />}
      </SpatialCanvas>
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
