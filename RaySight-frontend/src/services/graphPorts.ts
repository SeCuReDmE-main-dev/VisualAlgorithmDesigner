/**
 * React-independent typed-port contract for VAD graph connections.
 *
 * The structural node, edge, and connection types intentionally match the
 * fields used by @xyflow/react without importing React Flow at runtime.
 */

export type PortDirectionV1 = 'input' | 'output';
export type PortCardinalityV1 = number | 'many';

export interface PortDescriptorV1 {
  id: string;
  direction: PortDirectionV1;
  dataType: string;
  cardinality: PortCardinalityV1;
  label: string;
  loopCapable: boolean;
}

export interface GraphNodeLikeV1 {
  id: string;
  data: Record<string, unknown>;
}

export interface GraphEdgeLikeV1 {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface ProposedConnectionV1 {
  source: string | null;
  target: string | null;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface NormalizedConnectionV1 {
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

export type ConnectionRejectionCodeV1 =
  | 'missing-endpoint'
  | 'self-connection'
  | 'node-not-found'
  | 'port-not-found'
  | 'direction-mismatch'
  | 'type-mismatch'
  | 'duplicate'
  | 'source-cardinality'
  | 'target-cardinality'
  | 'cycle';

export type ConnectionValidationResultV1 =
  | {
      valid: true;
      code: 'valid';
      connection: NormalizedConnectionV1;
      sourcePort: PortDescriptorV1;
      targetPort: PortDescriptorV1;
    }
  | {
      valid: false;
      code: ConnectionRejectionCodeV1;
      message: string;
    };

function isPortDescriptorV1(value: unknown): value is PortDescriptorV1 {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PortDescriptorV1>;
  const validCardinality = candidate.cardinality === 'many'
    || (typeof candidate.cardinality === 'number'
      && Number.isInteger(candidate.cardinality)
      && candidate.cardinality >= 1);

  return typeof candidate.id === 'string'
    && candidate.id.length > 0
    && (candidate.direction === 'input' || candidate.direction === 'output')
    && typeof candidate.dataType === 'string'
    && candidate.dataType.length > 0
    && validCardinality
    && typeof candidate.label === 'string'
    && typeof candidate.loopCapable === 'boolean';
}

export function getNodePorts(node: GraphNodeLikeV1): readonly PortDescriptorV1[] {
  const ports = node.data.ports;
  return Array.isArray(ports) ? ports.filter(isPortDescriptorV1) : [];
}

export function findNodePort(
  node: GraphNodeLikeV1,
  handleId: string | null | undefined,
  expectedDirection?: PortDirectionV1,
): PortDescriptorV1 | null {
  const ports = getNodePorts(node);

  if (handleId) {
    return ports.find((port) => port.id === handleId) ?? null;
  }

  if (!expectedDirection) {
    return null;
  }

  const directionalPorts = ports.filter((port) => port.direction === expectedDirection);
  return directionalPorts.length === 1 ? directionalPorts[0] : null;
}

export function arePortDataTypesCompatible(sourceType: string, targetType: string): boolean {
  return sourceType === targetType || sourceType === 'any' || targetType === 'any';
}

function findNode(nodes: readonly GraphNodeLikeV1[], nodeId: string): GraphNodeLikeV1 | null {
  return nodes.find((node) => node.id === nodeId) ?? null;
}

function resolveEdgePort(
  nodes: readonly GraphNodeLikeV1[],
  nodeId: string,
  handleId: string | null | undefined,
  direction: PortDirectionV1,
): PortDescriptorV1 | null {
  const node = findNode(nodes, nodeId);
  return node ? findNodePort(node, handleId, direction) : null;
}

function edgeUsesPort(
  edge: GraphEdgeLikeV1,
  nodes: readonly GraphNodeLikeV1[],
  nodeId: string,
  portId: string,
  direction: PortDirectionV1,
): boolean {
  if (direction === 'output') {
    return edge.source === nodeId
      && resolveEdgePort(nodes, edge.source, edge.sourceHandle, 'output')?.id === portId;
  }

  return edge.target === nodeId
    && resolveEdgePort(nodes, edge.target, edge.targetHandle, 'input')?.id === portId;
}

function isPortAtCapacity(port: PortDescriptorV1, connectionCount: number): boolean {
  return port.cardinality !== 'many' && connectionCount >= port.cardinality;
}

function isNodeLoopCapable(node: GraphNodeLikeV1): boolean {
  return node.data.loopCapable === true;
}

function edgeHasLoopCapability(edge: GraphEdgeLikeV1, nodes: readonly GraphNodeLikeV1[]): boolean {
  const sourceNode = findNode(nodes, edge.source);
  const targetNode = findNode(nodes, edge.target);

  if (!sourceNode || !targetNode) {
    return false;
  }

  return isNodeLoopCapable(sourceNode)
    || isNodeLoopCapable(targetNode)
    || findNodePort(sourceNode, edge.sourceHandle, 'output')?.loopCapable === true
    || findNodePort(targetNode, edge.targetHandle, 'input')?.loopCapable === true;
}

function hasDirectedPath(
  startNodeId: string,
  endNodeId: string,
  edges: readonly GraphEdgeLikeV1[],
  includeEdge: (edge: GraphEdgeLikeV1) => boolean,
): boolean {
  const pending = [startNodeId];
  const visited = new Set<string>();

  while (pending.length > 0) {
    const current = pending.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    if (current === endNodeId) {
      return true;
    }

    visited.add(current);
    edges.forEach((edge) => {
      if (edge.source === current && includeEdge(edge) && !visited.has(edge.target)) {
        pending.push(edge.target);
      }
    });
  }

  return false;
}

export function wouldCreateCycle(
  connection: Pick<NormalizedConnectionV1, 'source' | 'target'>,
  edges: readonly GraphEdgeLikeV1[],
): boolean {
  return hasDirectedPath(connection.target, connection.source, edges, () => true);
}

function createsCycleWithoutLoopCapability(
  connection: NormalizedConnectionV1,
  sourceNode: GraphNodeLikeV1,
  targetNode: GraphNodeLikeV1,
  sourcePort: PortDescriptorV1,
  targetPort: PortDescriptorV1,
  nodes: readonly GraphNodeLikeV1[],
  edges: readonly GraphEdgeLikeV1[],
): boolean {
  if (!wouldCreateCycle(connection, edges)) {
    return false;
  }

  if (isNodeLoopCapable(sourceNode)
    || isNodeLoopCapable(targetNode)
    || sourcePort.loopCapable
    || targetPort.loopCapable) {
    return false;
  }

  // A cycle is unsafe when at least one target-to-source path contains no
  // explicit loop-capable node or port. Removing loop-capable edges lets us
  // detect exactly those unguarded paths.
  return hasDirectedPath(
    connection.target,
    connection.source,
    edges,
    (edge) => !edgeHasLoopCapability(edge, nodes),
  );
}

export function validateProposedConnection(
  proposed: ProposedConnectionV1,
  nodes: readonly GraphNodeLikeV1[],
  edges: readonly GraphEdgeLikeV1[],
): ConnectionValidationResultV1 {
  if (!proposed.source || !proposed.target) {
    return { valid: false, code: 'missing-endpoint', message: 'A source and target node are required.' };
  }

  if (proposed.source === proposed.target) {
    return { valid: false, code: 'self-connection', message: 'A node cannot connect to itself.' };
  }

  const sourceNode = findNode(nodes, proposed.source);
  const targetNode = findNode(nodes, proposed.target);
  if (!sourceNode || !targetNode) {
    return { valid: false, code: 'node-not-found', message: 'The source or target node does not exist.' };
  }

  const sourcePort = findNodePort(sourceNode, proposed.sourceHandle, 'output');
  const targetPort = findNodePort(targetNode, proposed.targetHandle, 'input');
  if (!sourcePort || !targetPort) {
    return { valid: false, code: 'port-not-found', message: 'The source or target port does not exist or is ambiguous.' };
  }

  if (sourcePort.direction !== 'output' || targetPort.direction !== 'input') {
    return { valid: false, code: 'direction-mismatch', message: 'Connections must run from an output port to an input port.' };
  }

  if (!arePortDataTypesCompatible(sourcePort.dataType, targetPort.dataType)) {
    return {
      valid: false,
      code: 'type-mismatch',
      message: `Port type ${sourcePort.dataType} is not compatible with ${targetPort.dataType}.`,
    };
  }

  const connection: NormalizedConnectionV1 = {
    source: proposed.source,
    target: proposed.target,
    sourceHandle: sourcePort.id,
    targetHandle: targetPort.id,
  };

  const duplicate = edges.some((edge) => edge.source === connection.source
    && edge.target === connection.target
    && resolveEdgePort(nodes, edge.source, edge.sourceHandle, 'output')?.id === connection.sourceHandle
    && resolveEdgePort(nodes, edge.target, edge.targetHandle, 'input')?.id === connection.targetHandle);
  if (duplicate) {
    return { valid: false, code: 'duplicate', message: 'This exact pair of ports is already connected.' };
  }

  const sourceConnectionCount = edges.filter((edge) => edgeUsesPort(
    edge,
    nodes,
    sourceNode.id,
    sourcePort.id,
    'output',
  )).length;
  if (isPortAtCapacity(sourcePort, sourceConnectionCount)) {
    return { valid: false, code: 'source-cardinality', message: 'The source port has reached its connection limit.' };
  }

  const targetConnectionCount = edges.filter((edge) => edgeUsesPort(
    edge,
    nodes,
    targetNode.id,
    targetPort.id,
    'input',
  )).length;
  if (isPortAtCapacity(targetPort, targetConnectionCount)) {
    return { valid: false, code: 'target-cardinality', message: 'The target port has reached its connection limit.' };
  }

  if (createsCycleWithoutLoopCapability(
    connection,
    sourceNode,
    targetNode,
    sourcePort,
    targetPort,
    nodes,
    edges,
  )) {
    return { valid: false, code: 'cycle', message: 'This connection creates a cycle without an explicit loop-capable port or node.' };
  }

  return { valid: true, code: 'valid', connection, sourcePort, targetPort };
}
