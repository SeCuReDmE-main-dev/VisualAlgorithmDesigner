import { renderHook } from '@testing-library/react';
import type { Edge, Node } from '@xyflow/react';
import { describe, expect, it } from 'vitest';
import { usePipelineStatus } from './usePipelineStatus';

const node = (id: string): Node => ({ id, position: { x: 0, y: 0 }, data: {} });
const edge = (source: string, target: string): Edge => ({ id: `${source}-${target}`, source, target });

describe('usePipelineStatus', () => {
  it.each([
    [[], [], 'empty'],
    [[node('a')], [], 'single-node'],
    [[node('a'), node('b')], [], 'disconnected'],
    [[node('a'), node('b')], [edge('a', 'b')], 'ready'],
  ] as const)('returns %s for pipeline shape', (nodes, edges, expected) => {
    const { result } = renderHook(() => usePipelineStatus(nodes, edges));
    expect(result.current).toBe(expected);
  });
});
