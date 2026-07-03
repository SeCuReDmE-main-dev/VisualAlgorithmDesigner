import { useMemo } from 'react';
import type { Edge, Node } from '@xyflow/react';

export type PipelineStatus = 'empty' | 'single-node' | 'disconnected' | 'ready';

export function usePipelineStatus(nodes: Node[], edges: Edge[]): PipelineStatus {
  return useMemo(() => {
    if (nodes.length === 0) {
      return 'empty';
    }

    if (nodes.length === 1) {
      return 'single-node';
    }

    const connectedIds = new Set<string>();

    edges.forEach((edge) => {
      connectedIds.add(edge.source);
      connectedIds.add(edge.target);
    });

    const hasDisconnectedNode = nodes.some((node) => !connectedIds.has(node.id));

    return hasDisconnectedNode ? 'disconnected' : 'ready';
  }, [edges, nodes]);
}
