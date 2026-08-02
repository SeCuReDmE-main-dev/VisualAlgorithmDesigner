import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  useReactFlow,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import SpatialCanvas from '../SpatialCanvas';
import { AlgorithmNodeData } from './AlgorithmNode';
import CanvasContextMenu from './CanvasContextMenu';
import CanvasEmptyState from './CanvasEmptyState';
import '../../styles/canvas.css';
import '../../styles/edges.css';
import { getAlgorithmById, getDefaultParams, type LearningAlgorithm } from '../../services/algorithmCatalog';
import { useDnD, type DragPayload } from '../../contexts/DnDContext';
import { validateProposedConnection, type PortDescriptorV1 } from '../../services/graphPorts';
import { preparePrefabTransaction } from '../../services/prefabTransaction';
import type { GraphMutation } from '../../hooks/useGraphHistory';

interface AlgorithmCanvasProps {
  nodes: Node<AlgorithmNodeData>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange<Node<AlgorithmNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  commitGraphMutation: (mutation: GraphMutation<Node<AlgorithmNodeData>>) => void;
  onSelectedNodeChange: (nodeId: string | null) => void;
  onSaveRequested: () => void;
  onClearRequested: () => void;
}

const NODE_SIZE = { width: 220, height: 118 };
const NODE_GAP = 80;

const DATA_TYPE_BY_PORT: Record<string, string> = {
  items: 'data',
  'ordered-items': 'data',
  question: 'data',
  answer: 'data',
  data: 'data',
  group: 'data',
  graph: 'graph',
  path: 'graph',
  message: 'message',
  'protected-message': 'message',
  'shorter-message': 'message',
  task: 'task',
  plan: 'task',
  signal: 'scalar',
  score: 'scalar',
  prediction: 'scalar',
};

function buildPortDescriptors(algorithm: LearningAlgorithm | undefined): PortDescriptorV1[] {
  if (!algorithm) return [];
  const inputs: PortDescriptorV1[] = algorithm.inputPorts.map((port) => ({
    id: `in-${port}`,
    direction: 'input' as const,
    dataType: DATA_TYPE_BY_PORT[port] ?? 'any',
    cardinality: 1,
    label: port,
    loopCapable: false,
  }));
  const outputs: PortDescriptorV1[] = algorithm.outputPorts.map((port) => ({
    id: `out-${port}`,
    direction: 'output' as const,
    dataType: DATA_TYPE_BY_PORT[port] ?? 'any',
    cardinality: 'many' as const,
    label: port,
    loopCapable: false,
  }));
  return [...inputs, ...outputs];
}

export function buildAlgorithmNode(
  algorithmId: string,
  position: { x: number; y: number },
  override?: Partial<AlgorithmNodeData>,
): Node<AlgorithmNodeData> {
  const algorithm = getAlgorithmById(algorithmId);
  return {
    id: `${algorithmId}-${uuidv4()}`,
    type: 'algorithmNode',
    position,
    data: {
      algorithmId,
      label: algorithm?.label ?? algorithmId,
      category: algorithm?.category ?? 'data',
      description: algorithm?.description,
      plainPurpose: algorithm?.plainPurpose,
      realWorldExample: algorithm?.realWorldExample,
      historyNote: algorithm?.historyNote,
      whyItMatters: algorithm?.whyItMatters,
      difficulty: algorithm?.difficulty,
      params: algorithm ? getDefaultParams(algorithmId) : {},
      ports: buildPortDescriptors(algorithm),
      loopCapable: false,
      ...override,
    },
  };
}

function findOpenGridPosition(
  preferred: { x: number; y: number },
  existingNodes: readonly Node<AlgorithmNodeData>[],
) {
  const overlaps = (candidate: { x: number; y: number }) => existingNodes.some((node) => (
    Math.abs(node.position.x - candidate.x) < NODE_SIZE.width + NODE_GAP
    && Math.abs(node.position.y - candidate.y) < NODE_SIZE.height + NODE_GAP
  ));
  if (!overlaps(preferred)) return preferred;

  for (let ring = 1; ring <= 20; ring += 1) {
    const horizontal = NODE_SIZE.width + NODE_GAP;
    const vertical = NODE_SIZE.height + NODE_GAP;
    const candidates = [
      { x: preferred.x + ring * horizontal, y: preferred.y },
      { x: preferred.x - ring * horizontal, y: preferred.y },
      { x: preferred.x, y: preferred.y + ring * vertical },
      { x: preferred.x, y: preferred.y - ring * vertical },
    ];
    const open = candidates.find((candidate) => !overlaps(candidate));
    if (open) return open;
  }
  return preferred;
}

function ensureNodePorts(data: Record<string, unknown>, fallbackAlgorithmId: string): AlgorithmNodeData {
  const algorithmId = typeof data.algorithmId === 'string' ? data.algorithmId : fallbackAlgorithmId;
  const algorithm = getAlgorithmById(algorithmId);
  return {
    algorithmId,
    label: typeof data.label === 'string' ? data.label : (algorithm?.label ?? algorithmId),
    category: typeof data.category === 'string' ? data.category : (algorithm?.category ?? 'data'),
    ...data,
    ports: Array.isArray(data.ports) ? data.ports as PortDescriptorV1[] : buildPortDescriptors(algorithm),
  } as AlgorithmNodeData;
}

export default function AlgorithmCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  commitGraphMutation,
  onSelectedNodeChange,
  onSaveRequested,
  onClearRequested,
}: AlgorithmCanvasProps) {
  const { dndState, dropTarget, resetDrag, cancelReason } = useDnD();
  const { screenToFlowPosition } = useReactFlow();
  const processedSessions = useRef(new WeakSet<object>());
  const [contextMenu, setContextMenu] = useState<{ open: boolean; x: number; y: number }>({ open: false, x: 0, y: 0 });
  const [interactionMessage, setInteractionMessage] = useState('');
  const reactFlowNodes = useMemo(() => nodes, [nodes]);

  const validateConnection = useCallback(
    (connection: Connection | Edge) => validateProposedConnection(connection, nodes, edges),
    [edges, nodes],
  );
  const isValidConnection = useCallback(
    (connection: Connection | Edge) => validateConnection(connection).valid,
    [validateConnection],
  );
  const onConnect = useCallback((connection: Connection | Edge) => {
    const validation = validateConnection(connection);
    if (!validation.valid) {
      setInteractionMessage(validation.message);
      return;
    }
    commitGraphMutation((current) => ({
      ...current,
      edges: current.edges.concat({
        id: `edge-${uuidv4()}`,
        ...validation.connection,
        type: 'algorithmEdge',
        animated: true,
      }),
    }));
    setInteractionMessage('Connection added.');
  }, [commitGraphMutation, validateConnection]);

  const addAlgorithmAt = useCallback((
    algorithmId: string,
    position: { x: number; y: number },
    override?: Partial<AlgorithmNodeData>,
  ) => {
    commitGraphMutation((current) => {
      const node = buildAlgorithmNode(algorithmId, findOpenGridPosition(position, current.nodes), override);
      return { ...current, nodes: current.nodes.concat(node) };
    });
    return true;
  }, [commitGraphMutation]);

  const addPrefabAt = useCallback((payload: Readonly<DragPayload>, position: { x: number; y: number }) => {
    if (!payload.prefabNodes) {
      setInteractionMessage('This prefab has no nodes and was not added.');
      return false;
    }

    const prepared = preparePrefabTransaction(
      { nodes: payload.prefabNodes, edges: payload.prefabEdges ?? [] },
      (kind, originalId) => `${kind}-${originalId}-${uuidv4()}`,
    );
    if (!prepared.ok) {
      setInteractionMessage(`Prefab rejected: ${prepared.error.message}`);
      return false;
    }

    const nextNodes = prepared.transaction.nodes.map((node, index) => ({
      ...node,
      type: node.type || 'algorithmNode',
      position: { x: position.x + node.position.x, y: position.y + node.position.y },
      style: { ...((node.style as Record<string, unknown> | undefined) ?? {}), animationDelay: `${index * 80}ms` },
      data: {
        ...ensureNodePorts(node.data, payload.algorithmId),
        coherenceScore: payload.coherenceScore,
        isPrefab: true,
        loopCapable: payload.loopCapable === true,
      },
    })) as Node<AlgorithmNodeData>[];
    const nextEdges = prepared.transaction.edges.map((edge) => ({
      ...edge,
      type: typeof edge.type === 'string' ? edge.type : 'algorithmEdge',
      animated: edge.animated !== false,
    })) as Edge[];

    commitGraphMutation((current) => ({
      nodes: current.nodes.concat(nextNodes),
      edges: current.edges.concat(nextEdges),
    }));
    return true;
  }, [commitGraphMutation]);

  const addDragPayloadAt = useCallback((payload: Readonly<DragPayload>, screenPosition: { x: number; y: number }) => {
    const anchor = payload.isPrefab
      ? screenPosition
      : { x: screenPosition.x - NODE_SIZE.width / 2, y: screenPosition.y - NODE_SIZE.height / 2 };
    const position = screenToFlowPosition(anchor, { snapToGrid: true });

    if (payload.isPrefab) return addPrefabAt(payload, position);
    return addAlgorithmAt(payload.algorithmId, position, {
      label: payload.label,
      category: payload.category,
      coherenceScore: payload.coherenceScore,
      loopCapable: payload.loopCapable === true,
      ...(payload.nodeData as Partial<AlgorithmNodeData> | undefined),
    });
  }, [addAlgorithmAt, addPrefabAt, screenToFlowPosition]);

  useEffect(() => {
    if (dndState.phase !== 'committing') return;
    const session = dndState.session;
    if (processedSessions.current.has(session)) return;
    processedSessions.current.add(session);
    const inserted = addDragPayloadAt(session.payload, session.current);
    setInteractionMessage(inserted ? `${session.payload.label} placed on the canvas.` : 'Placement rejected.');
    resetDrag();
  }, [addDragPayloadAt, dndState, resetDrag]);

  const handleContextAdd = useCallback((algorithmId: string) => {
    const position = screenToFlowPosition({ x: contextMenu.x, y: contextMenu.y }, { snapToGrid: true });
    addAlgorithmAt(algorithmId, position);
    setContextMenu((current) => ({ ...current, open: false }));
  }, [addAlgorithmAt, contextMenu.x, contextMenu.y, screenToFlowPosition]);

  const dragging = dndState.phase === 'dragging';
  const targetValidity = dropTarget?.validity ?? 'unknown';
  const dropReason = targetValidity === 'valid'
    ? 'Release to place'
    : dropTarget?.reason ?? cancelReason ?? 'Move onto the canvas';

  return (
    <div
      data-testid="algorithm-canvas"
      data-dnd-phase={dndState.phase}
      data-dnd-cancel-reason={cancelReason ?? undefined}
      onContextMenu={(event) => {
        event.preventDefault();
        setContextMenu({ open: true, x: event.clientX, y: event.clientY });
      }}
      className={`alg-canvas-root${dragging ? ` alg-canvas-root--drop-${targetValidity}` : ''}`}
    >
      <div className="vad-sr-status" role="status" aria-live="polite">
        {interactionMessage}
      </div>
      {dragging && (
        <div className={`vad-drop-target vad-drop-target--${targetValidity}`} aria-hidden="true">
          <span>{dropReason}</span>
        </div>
      )}
      <SpatialCanvas
        nodes={reactFlowNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
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
