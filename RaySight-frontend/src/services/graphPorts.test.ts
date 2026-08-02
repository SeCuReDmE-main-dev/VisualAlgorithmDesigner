import { describe, expect, it } from 'vitest';
import {
  arePortDataTypesCompatible,
  findNodePort,
  getNodePorts,
  type GraphEdgeLikeV1,
  type GraphNodeLikeV1,
  type PortDescriptorV1,
  validateProposedConnection,
  wouldCreateCycle,
} from './graphPorts';

function port(
  id: string,
  direction: PortDescriptorV1['direction'],
  dataType = 'dataset',
  cardinality: PortDescriptorV1['cardinality'] = 'many',
  loopCapable = false,
): PortDescriptorV1 {
  return { id, direction, dataType, cardinality, label: id, loopCapable };
}

function node(
  id: string,
  ports: readonly PortDescriptorV1[],
  loopCapable = false,
): GraphNodeLikeV1 {
  return { id, data: { ports, loopCapable } };
}

const source = node('source', [port('out', 'output')]);
const target = node('target', [port('in', 'input')]);

describe('graphPorts helpers', () => {
  it('returns only valid descriptors and resolves a unique directional port', () => {
    const graphNode: GraphNodeLikeV1 = {
      id: 'n1',
      data: {
        ports: [port('out', 'output'), { id: '', direction: 'input' }],
      },
    };

    expect(getNodePorts(graphNode)).toEqual([port('out', 'output')]);
    expect(findNodePort(graphNode, null, 'output')?.id).toBe('out');
    expect(findNodePort(graphNode, null, 'input')).toBeNull();
  });

  it('supports exact types and the explicit any wildcard', () => {
    expect(arePortDataTypesCompatible('dataset', 'dataset')).toBe(true);
    expect(arePortDataTypesCompatible('any', 'number')).toBe(true);
    expect(arePortDataTypesCompatible('number', 'any')).toBe(true);
    expect(arePortDataTypesCompatible('number', 'text')).toBe(false);
  });

  it('detects whether a proposed directed edge closes an existing path', () => {
    const edges: GraphEdgeLikeV1[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];

    expect(wouldCreateCycle({ source: 'c', target: 'a' }, edges)).toBe(true);
    expect(wouldCreateCycle({ source: 'a', target: 'c' }, edges)).toBe(false);
  });
});

describe('validateProposedConnection', () => {
  it('normalizes a valid connection and infers unique handles', () => {
    const result = validateProposedConnection(
      { source: 'source', target: 'target' },
      [source, target],
      [],
    );

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.connection).toEqual({
        source: 'source',
        target: 'target',
        sourceHandle: 'out',
        targetHandle: 'in',
      });
    }
  });

  it('rejects missing endpoints before graph lookup', () => {
    expect(validateProposedConnection({ source: null, target: 'target' }, [target], [])).toMatchObject({
      valid: false,
      code: 'missing-endpoint',
    });
  });

  it('rejects a self-connection', () => {
    expect(validateProposedConnection({ source: 'source', target: 'source' }, [source], [])).toMatchObject({
      valid: false,
      code: 'self-connection',
    });
  });

  it('rejects missing nodes', () => {
    expect(validateProposedConnection({ source: 'source', target: 'missing' }, [source], [])).toMatchObject({
      valid: false,
      code: 'node-not-found',
    });
  });

  it('rejects missing and ambiguous handles', () => {
    const ambiguousSource = node('source', [port('out-a', 'output'), port('out-b', 'output')]);
    expect(validateProposedConnection({ source: 'source', target: 'target' }, [ambiguousSource, target], [])).toMatchObject({
      valid: false,
      code: 'port-not-found',
    });
  });

  it('rejects reversed port directions', () => {
    const bidirectionalSource = node('source', [port('in', 'input'), port('out', 'output')]);
    const bidirectionalTarget = node('target', [port('in', 'input'), port('out', 'output')]);
    expect(validateProposedConnection({
      source: 'source',
      sourceHandle: 'in',
      target: 'target',
      targetHandle: 'out',
    }, [bidirectionalSource, bidirectionalTarget], [])).toMatchObject({
      valid: false,
      code: 'direction-mismatch',
    });
  });

  it('rejects incompatible data types', () => {
    const textTarget = node('target', [port('in', 'input', 'text')]);
    expect(validateProposedConnection({ source: 'source', target: 'target' }, [source, textTarget], [])).toMatchObject({
      valid: false,
      code: 'type-mismatch',
    });
  });

  it('accepts a wildcard data type', () => {
    const wildcardTarget = node('target', [port('in', 'input', 'any')]);
    expect(validateProposedConnection({ source: 'source', target: 'target' }, [source, wildcardTarget], [])).toMatchObject({
      valid: true,
      code: 'valid',
    });
  });

  it('rejects an exact duplicate handle pair, including legacy omitted handles', () => {
    expect(validateProposedConnection(
      { source: 'source', target: 'target', sourceHandle: 'out', targetHandle: 'in' },
      [source, target],
      [{ source: 'source', target: 'target' }],
    )).toMatchObject({ valid: false, code: 'duplicate' });
  });

  it('allows a different handle pair between the same nodes', () => {
    const multiSource = node('source', [port('out-a', 'output'), port('out-b', 'output')]);
    const multiTarget = node('target', [port('in-a', 'input'), port('in-b', 'input')]);
    expect(validateProposedConnection(
      { source: 'source', sourceHandle: 'out-b', target: 'target', targetHandle: 'in-b' },
      [multiSource, multiTarget],
      [{ source: 'source', sourceHandle: 'out-a', target: 'target', targetHandle: 'in-a' }],
    )).toMatchObject({ valid: true, code: 'valid' });
  });

  it('enforces source-port cardinality', () => {
    const limitedSource = node('source', [port('out', 'output', 'dataset', 1)]);
    const otherTarget = node('other-target', [port('in', 'input')]);
    expect(validateProposedConnection(
      { source: 'source', target: 'target' },
      [limitedSource, target, otherTarget],
      [{ source: 'source', target: 'other-target' }],
    )).toMatchObject({ valid: false, code: 'source-cardinality' });
  });

  it('enforces target-port cardinality', () => {
    const limitedTarget = node('target', [port('in', 'input', 'dataset', 1)]);
    const otherSource = node('other-source', [port('out', 'output')]);
    expect(validateProposedConnection(
      { source: 'source', target: 'target' },
      [source, limitedTarget, otherSource],
      [{ source: 'other-source', target: 'target' }],
    )).toMatchObject({ valid: false, code: 'target-cardinality' });
  });

  it('rejects an unguarded directed cycle', () => {
    const a = node('a', [port('in', 'input'), port('out', 'output')]);
    const b = node('b', [port('in', 'input'), port('out', 'output')]);
    const c = node('c', [port('in', 'input'), port('out', 'output')]);
    const edges: GraphEdgeLikeV1[] = [
      { source: 'a', sourceHandle: 'out', target: 'b', targetHandle: 'in' },
      { source: 'b', sourceHandle: 'out', target: 'c', targetHandle: 'in' },
    ];

    expect(validateProposedConnection({
      source: 'c', sourceHandle: 'out', target: 'a', targetHandle: 'in',
    }, [a, b, c], edges)).toMatchObject({ valid: false, code: 'cycle' });
  });

  it('allows a cycle when a proposed endpoint port is loop-capable', () => {
    const a = node('a', [port('in', 'input'), port('out', 'output')]);
    const b = node('b', [port('in', 'input'), port('out', 'output', 'dataset', 'many', true)]);
    const edges: GraphEdgeLikeV1[] = [
      { source: 'a', sourceHandle: 'out', target: 'b', targetHandle: 'in' },
    ];

    expect(validateProposedConnection({
      source: 'b', sourceHandle: 'out', target: 'a', targetHandle: 'in',
    }, [a, b], edges)).toMatchObject({ valid: true, code: 'valid' });
  });

  it('allows a cycle when every return path passes through a loop-capable node', () => {
    const a = node('a', [port('in', 'input'), port('out', 'output')]);
    const loop = node('loop', [port('in', 'input'), port('out', 'output')], true);
    const c = node('c', [port('in', 'input'), port('out', 'output')]);
    const edges: GraphEdgeLikeV1[] = [
      { source: 'a', sourceHandle: 'out', target: 'loop', targetHandle: 'in' },
      { source: 'loop', sourceHandle: 'out', target: 'c', targetHandle: 'in' },
    ];

    expect(validateProposedConnection({
      source: 'c', sourceHandle: 'out', target: 'a', targetHandle: 'in',
    }, [a, loop, c], edges)).toMatchObject({ valid: true, code: 'valid' });
  });

  it('rejects a cycle if an alternative return path bypasses loop capability', () => {
    const a = node('a', [port('in', 'input'), port('out', 'output')]);
    const guarded = node('guarded', [port('in', 'input'), port('out', 'output')], true);
    const plain = node('plain', [port('in', 'input'), port('out', 'output')]);
    const c = node('c', [port('in', 'input'), port('out', 'output')]);
    const edges: GraphEdgeLikeV1[] = [
      { source: 'a', sourceHandle: 'out', target: 'guarded', targetHandle: 'in' },
      { source: 'guarded', sourceHandle: 'out', target: 'c', targetHandle: 'in' },
      { source: 'a', sourceHandle: 'out', target: 'plain', targetHandle: 'in' },
      { source: 'plain', sourceHandle: 'out', target: 'c', targetHandle: 'in' },
    ];

    expect(validateProposedConnection({
      source: 'c', sourceHandle: 'out', target: 'a', targetHandle: 'in',
    }, [a, guarded, plain, c], edges)).toMatchObject({ valid: false, code: 'cycle' });
  });
});
