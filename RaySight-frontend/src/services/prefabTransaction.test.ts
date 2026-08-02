import { describe, expect, it } from 'vitest';
import {
  preparePrefabTransaction,
  type PrefabEdge,
  type PrefabIdFactory,
  type PrefabNode,
} from './prefabTransaction';

const deterministicIds: PrefabIdFactory = (kind, _originalId, index) => `${kind}-${index + 1}`;

type MutablePrefab = {
  nodes: PrefabNode[];
  edges: PrefabEdge[];
};

function validPrefab(): MutablePrefab {
  return {
    nodes: [
      {
        id: 'input',
        type: 'algorithmNode',
        position: { x: -20, y: 40 },
        data: { label: 'Input', config: { values: [1, 2, 3] } },
        selected: false,
      },
      {
        id: 'model',
        type: 'algorithmNode',
        position: { x: 180, y: -10 },
        data: { label: 'Model' },
      },
    ],
    edges: [
      {
        id: 'input-model',
        source: 'input',
        target: 'model',
        sourceHandle: 'output-data',
        targetHandle: 'training-data',
        animated: true,
        data: { label: 'training set' },
      },
    ],
  };
}

describe('preparePrefabTransaction', () => {
  it('rejects edges whose endpoints do not exist', () => {
    const prefab = validPrefab();
    prefab.edges[0] = { ...prefab.edges[0], target: 'missing-node' };

    const result = preparePrefabTransaction(prefab, deterministicIds);

    expect(result).toEqual({
      ok: false,
      error: {
        code: 'UNKNOWN_EDGE_ENDPOINT',
        path: 'edges[0].target',
        message: 'Edge target references unknown node "missing-node".',
      },
    });
  });

  it.each([
    {
      label: 'node',
      mutate(prefab: MutablePrefab) {
        prefab.nodes[1] = { ...prefab.nodes[1], id: prefab.nodes[0].id };
      },
      code: 'DUPLICATE_NODE_ID',
    },
    {
      label: 'edge',
      mutate(prefab: MutablePrefab) {
        prefab.edges.push({ id: prefab.edges[0].id, source: 'model', target: 'input' });
      },
      code: 'DUPLICATE_EDGE_ID',
    },
  ])('rejects duplicate $label IDs', ({ mutate, code }) => {
    const prefab = validPrefab();
    mutate(prefab);

    const result = preparePrefabTransaction(prefab, deterministicIds);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(code);
    }
  });

  it('rejects cyclic node data', () => {
    const prefab = validPrefab();
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    prefab.nodes[0] = { ...prefab.nodes[0], data: cyclic };

    const result = preparePrefabTransaction(prefab, deterministicIds);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_NODE_DATA');
      expect(result.error.message).toMatch(/cyclic/i);
    }
  });

  it.each([
    ['bigint', { value: BigInt(1) }],
    ['function', { value: () => 'not JSON' }],
    ['non-finite number', { value: Number.POSITIVE_INFINITY }],
  ])('rejects unserializable %s node data', (_label, data) => {
    const prefab = validPrefab();
    prefab.nodes[0] = { ...prefab.nodes[0], data };

    const result = preparePrefabTransaction(prefab, deterministicIds);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_NODE_DATA');
    }
  });

  it('preserves valid handle IDs and all other edge fields', () => {
    const result = preparePrefabTransaction(validPrefab(), deterministicIds);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.transaction.edges[0]).toMatchObject({
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        sourceHandle: 'output-data',
        targetHandle: 'training-data',
        animated: true,
        data: { label: 'training set' },
      });
    }
  });

  it.each([
    ['sourceHandle', ''],
    ['targetHandle', 42],
  ] as const)('rejects an invalid %s', (field, value) => {
    const prefab = validPrefab();
    prefab.edges[0] = { ...prefab.edges[0], [field]: value } as unknown as PrefabEdge;

    const result = preparePrefabTransaction(prefab, deterministicIds);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_EDGE_HANDLE');
      expect(result.error.path).toBe(`edges[0].${field}`);
    }
  });

  it('normalizes positions and remaps node IDs, edge IDs, and endpoints deterministically', () => {
    const calls: Array<[string, string, number]> = [];
    const factory: PrefabIdFactory = (kind, originalId, index) => {
      calls.push([kind, originalId, index]);
      return `copy-${kind}-${index}`;
    };

    const result = preparePrefabTransaction(validPrefab(), factory);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.transaction.nodes.map(({ id, position }) => ({ id, position }))).toEqual([
        { id: 'copy-node-0', position: { x: 0, y: 50 } },
        { id: 'copy-node-1', position: { x: 200, y: 0 } },
      ]);
      expect(result.transaction.edges[0]).toMatchObject({
        id: 'copy-edge-0',
        source: 'copy-node-0',
        target: 'copy-node-1',
      });
      expect(result.transaction.bounds).toEqual({ x: 0, y: 0, width: 200, height: 50 });
      expect(calls).toEqual([
        ['node', 'input', 0],
        ['node', 'model', 1],
        ['edge', 'input-model', 0],
      ]);
    }
  });

  it('deep-clones the prefab and never mutates its input', () => {
    const prefab = validPrefab();
    const before = structuredClone(prefab);

    const result = preparePrefabTransaction(prefab, deterministicIds);

    expect(result.ok).toBe(true);
    expect(prefab).toEqual(before);
    if (result.ok) {
      expect(result.transaction.nodes[0]).not.toBe(prefab.nodes[0]);
      expect(result.transaction.nodes[0].position).not.toBe(prefab.nodes[0].position);
      expect(result.transaction.nodes[0].data).not.toBe(prefab.nodes[0].data);
      expect(result.transaction.edges[0]).not.toBe(prefab.edges[0]);

      const outputData = result.transaction.nodes[0].data as { config: { values: number[] } };
      outputData.config.values.push(99);
      expect((prefab.nodes[0].data as { config: { values: number[] } }).config.values).toEqual([1, 2, 3]);
    }
  });

  it('rejects duplicate IDs returned by the factory', () => {
    const result = preparePrefabTransaction(validPrefab(), (kind) => `${kind}-same`);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('DUPLICATE_GENERATED_ID');
      expect(result.error.path).toBe('nodes[1].id');
    }
  });
});
