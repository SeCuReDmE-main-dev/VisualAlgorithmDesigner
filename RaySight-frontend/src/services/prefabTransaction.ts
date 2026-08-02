export type PrefabIdKind = 'node' | 'edge';

export type PrefabIdFactory = (kind: PrefabIdKind, originalId: string, index: number) => string;

export interface PrefabPosition {
  x: number;
  y: number;
}

export interface PrefabNode extends Record<string, unknown> {
  id: string;
  position: PrefabPosition;
  data: unknown;
}

export interface PrefabEdge extends Record<string, unknown> {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface PrefabInput<TNode extends PrefabNode = PrefabNode, TEdge extends PrefabEdge = PrefabEdge> {
  nodes: readonly TNode[];
  edges: readonly TEdge[];
}

export interface PrefabBounds {
  x: 0;
  y: 0;
  width: number;
  height: number;
}

export interface ReadyPrefabTransaction<TNode extends PrefabNode = PrefabNode, TEdge extends PrefabEdge = PrefabEdge> {
  nodes: TNode[];
  edges: TEdge[];
  bounds: PrefabBounds;
}

export type PrefabValidationErrorCode =
  | 'INVALID_PREFAB'
  | 'EMPTY_NODES'
  | 'INVALID_NODE'
  | 'INVALID_NODE_ID'
  | 'DUPLICATE_NODE_ID'
  | 'INVALID_NODE_POSITION'
  | 'INVALID_NODE_DATA'
  | 'INVALID_EDGE'
  | 'INVALID_EDGE_ID'
  | 'DUPLICATE_EDGE_ID'
  | 'INVALID_EDGE_ENDPOINT'
  | 'UNKNOWN_EDGE_ENDPOINT'
  | 'INVALID_EDGE_HANDLE'
  | 'ID_FACTORY_FAILED'
  | 'INVALID_GENERATED_ID'
  | 'DUPLICATE_GENERATED_ID'
  | 'CLONE_FAILED';

export interface PrefabValidationError {
  code: PrefabValidationErrorCode;
  path: string;
  message: string;
}

export type PrefabTransactionResult<TNode extends PrefabNode = PrefabNode, TEdge extends PrefabEdge = PrefabEdge> =
  | { ok: true; transaction: ReadyPrefabTransaction<TNode, TEdge> }
  | { ok: false; error: PrefabValidationError };

interface ValidatedPrefab<TNode extends PrefabNode, TEdge extends PrefabEdge> {
  nodes: readonly TNode[];
  edges: readonly TEdge[];
}

/**
 * Validates and prepares a prefab without mutating the source graph.
 *
 * Handle identifiers are node-local contract names, so they are validated and
 * preserved. Node and edge identifiers are the only identifiers allocated by
 * the injected factory; edge endpoints are rewritten through the node map.
 */
export function preparePrefabTransaction<TNode extends PrefabNode, TEdge extends PrefabEdge>(
  input: PrefabInput<TNode, TEdge>,
  idFactory: PrefabIdFactory,
): PrefabTransactionResult<TNode, TEdge> {
  const validation = validatePrefab(input);
  if (!validation.ok) {
    return validation;
  }

  const nodeIdMap = new Map<string, string>();
  const generatedNodeIds = new Set<string>();

  for (const [index, node] of validation.prefab.nodes.entries()) {
    const generated = createId(idFactory, 'node', node.id, index, `nodes[${index}].id`);
    if (!generated.ok) {
      return generated;
    }
    if (generatedNodeIds.has(generated.id)) {
      return failure(
        'DUPLICATE_GENERATED_ID',
        `nodes[${index}].id`,
        `The ID factory generated duplicate node ID "${generated.id}".`,
      );
    }
    generatedNodeIds.add(generated.id);
    nodeIdMap.set(node.id, generated.id);
  }

  const edgeIdMap = new Map<string, string>();
  const generatedEdgeIds = new Set<string>();

  for (const [index, edge] of validation.prefab.edges.entries()) {
    const generated = createId(idFactory, 'edge', edge.id, index, `edges[${index}].id`);
    if (!generated.ok) {
      return generated;
    }
    if (generatedEdgeIds.has(generated.id)) {
      return failure(
        'DUPLICATE_GENERATED_ID',
        `edges[${index}].id`,
        `The ID factory generated duplicate edge ID "${generated.id}".`,
      );
    }
    generatedEdgeIds.add(generated.id);
    edgeIdMap.set(edge.id, generated.id);
  }

  const inputBounds = calculateInputBounds(validation.prefab.nodes);

  try {
    const nodes = validation.prefab.nodes.map((node) => {
      const cloned = deepClone(node);
      return {
        ...cloned,
        id: nodeIdMap.get(node.id) as string,
        position: {
          x: node.position.x - inputBounds.minX,
          y: node.position.y - inputBounds.minY,
        },
      } as TNode;
    });

    const edges = validation.prefab.edges.map((edge) => {
      const cloned = deepClone(edge);
      return {
        ...cloned,
        id: edgeIdMap.get(edge.id) as string,
        source: nodeIdMap.get(edge.source) as string,
        target: nodeIdMap.get(edge.target) as string,
      } as TEdge;
    });

    return {
      ok: true,
      transaction: {
        nodes,
        edges,
        bounds: {
          x: 0,
          y: 0,
          width: inputBounds.maxX - inputBounds.minX,
          height: inputBounds.maxY - inputBounds.minY,
        },
      },
    };
  } catch (error) {
    return failure(
      'CLONE_FAILED',
      'prefab',
      `The prefab could not be cloned: ${error instanceof Error ? error.message : 'unknown clone error'}`,
    );
  }
}

function validatePrefab<TNode extends PrefabNode, TEdge extends PrefabEdge>(
  input: PrefabInput<TNode, TEdge>,
): { ok: true; prefab: ValidatedPrefab<TNode, TEdge> } | { ok: false; error: PrefabValidationError } {
  if (!isRecord(input) || !Array.isArray(input.nodes) || !Array.isArray(input.edges)) {
    return failure('INVALID_PREFAB', 'prefab', 'A prefab must contain node and edge arrays.');
  }
  if (input.nodes.length === 0) {
    return failure('EMPTY_NODES', 'nodes', 'A prefab must contain at least one node.');
  }

  const nodeIds = new Set<string>();

  for (const [index, candidate] of input.nodes.entries()) {
    const path = `nodes[${index}]`;
    if (!isRecord(candidate)) {
      return failure('INVALID_NODE', path, 'Each prefab node must be an object.');
    }
    if (!isNonEmptyString(candidate.id)) {
      return failure('INVALID_NODE_ID', `${path}.id`, 'Node IDs must be non-empty strings.');
    }
    if (nodeIds.has(candidate.id)) {
      return failure('DUPLICATE_NODE_ID', `${path}.id`, `Duplicate node ID "${candidate.id}".`);
    }
    nodeIds.add(candidate.id);

    if (
      !isRecord(candidate.position)
      || typeof candidate.position.x !== 'number'
      || !Number.isFinite(candidate.position.x)
      || typeof candidate.position.y !== 'number'
      || !Number.isFinite(candidate.position.y)
    ) {
      return failure('INVALID_NODE_POSITION', `${path}.position`, 'Node positions must contain finite x and y numbers.');
    }

    let dataValidation: { path: string; message: string } | null;
    try {
      dataValidation = validateJsonValue(candidate.data, `${path}.data`, new WeakSet<object>());
    } catch (error) {
      return failure(
        'INVALID_NODE_DATA',
        `${path}.data`,
        `Node data could not be inspected as JSON: ${error instanceof Error ? error.message : 'unknown validation error'}`,
      );
    }
    if (dataValidation) {
      return failure('INVALID_NODE_DATA', dataValidation.path, dataValidation.message);
    }
  }

  const edgeIds = new Set<string>();

  for (const [index, candidate] of input.edges.entries()) {
    const path = `edges[${index}]`;
    if (!isRecord(candidate)) {
      return failure('INVALID_EDGE', path, 'Each prefab edge must be an object.');
    }
    if (!isNonEmptyString(candidate.id)) {
      return failure('INVALID_EDGE_ID', `${path}.id`, 'Edge IDs must be non-empty strings.');
    }
    if (edgeIds.has(candidate.id)) {
      return failure('DUPLICATE_EDGE_ID', `${path}.id`, `Duplicate edge ID "${candidate.id}".`);
    }
    edgeIds.add(candidate.id);

    for (const endpoint of ['source', 'target'] as const) {
      const endpointValue = candidate[endpoint];
      if (!isNonEmptyString(endpointValue)) {
        return failure('INVALID_EDGE_ENDPOINT', `${path}.${endpoint}`, `Edge ${endpoint} must be a non-empty node ID.`);
      }
      if (!nodeIds.has(endpointValue)) {
        return failure('UNKNOWN_EDGE_ENDPOINT', `${path}.${endpoint}`, `Edge ${endpoint} references unknown node "${endpointValue}".`);
      }
    }

    for (const handle of ['sourceHandle', 'targetHandle'] as const) {
      if (candidate[handle] !== undefined && !isNonEmptyString(candidate[handle])) {
        return failure('INVALID_EDGE_HANDLE', `${path}.${handle}`, `${handle} must be a non-empty string when provided.`);
      }
    }
  }

  return { ok: true, prefab: input };
}

function createId(
  idFactory: PrefabIdFactory,
  kind: PrefabIdKind,
  originalId: string,
  index: number,
  path: string,
): { ok: true; id: string } | { ok: false; error: PrefabValidationError } {
  let id: string;
  try {
    id = idFactory(kind, originalId, index);
  } catch (error) {
    return failure(
      'ID_FACTORY_FAILED',
      path,
      `The ID factory failed for ${kind} "${originalId}": ${error instanceof Error ? error.message : 'unknown factory error'}`,
    );
  }
  if (!isNonEmptyString(id)) {
    return failure('INVALID_GENERATED_ID', path, `The ID factory must return a non-empty string for every ${kind}.`);
  }
  return { ok: true, id };
}

function calculateInputBounds(nodes: readonly PrefabNode[]) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const node of nodes) {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x);
    maxY = Math.max(maxY, node.position.y);
  }

  return { minX, minY, maxX, maxY };
}

function validateJsonValue(
  value: unknown,
  path: string,
  ancestors: WeakSet<object>,
): { path: string; message: string } | null {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? null : { path, message: 'JSON data cannot contain non-finite numbers.' };
  }
  if (typeof value !== 'object') {
    return { path, message: `JSON data cannot contain ${typeof value} values.` };
  }
  if (ancestors.has(value)) {
    return { path, message: 'JSON data cannot contain cyclic references.' };
  }

  const isArray = Array.isArray(value);
  const prototype = Object.getPrototypeOf(value);
  if (!isArray && prototype !== Object.prototype && prototype !== null) {
    return { path, message: 'JSON data must contain only arrays, plain objects, and JSON primitive values.' };
  }

  ancestors.add(value);
  const entries = isArray
    ? value.map((entry, index) => [`${index}`, entry] as const)
    : Object.entries(value);

  for (const [key, entry] of entries) {
    const childPath = isArray ? `${path}[${key}]` : `${path}.${key}`;
    const error = validateJsonValue(entry, childPath, ancestors);
    if (error) {
      ancestors.delete(value);
      return error;
    }
  }
  ancestors.delete(value);
  return null;
}

function deepClone<T>(value: T): T {
  return structuredClone(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function failure(
  code: PrefabValidationErrorCode,
  path: string,
  message: string,
): { ok: false; error: PrefabValidationError } {
  return { ok: false, error: { code, path, message } };
}
