import { useMemo } from 'react';
import type { Edge, Node } from '@xyflow/react';

export interface DetectedLoop {
  id: string;
  nodeIds: string[];
  edgeIds: string[];
}

export interface LoopDetectionResult {
  hasLoop: boolean;
  loops: DetectedLoop[];
  loopingNodeIds: Set<string>;
  loopingEdgeIds: Set<string>;
}

function edgeKey(source: string, target: string) {
  return `${source}->${target}`;
}

function detectPipelineLoops(nodes: Pick<Node, 'id'>[], edges: Pick<Edge, 'id' | 'source' | 'target'>[]): LoopDetectionResult {
  const adjacency = new Map<string, string[]>();
  const edgeIdsByConnection = new Map<string, string[]>();

  nodes.forEach((node) => adjacency.set(node.id, []));
  edges.forEach((edge) => {
    adjacency.get(edge.source)?.push(edge.target);
    const key = edgeKey(edge.source, edge.target);
    edgeIdsByConnection.set(key, [...(edgeIdsByConnection.get(key) ?? []), edge.id]);
  });

  const loops = new Map<string, DetectedLoop>();
  const visited = new Set<string>();
  const activeStack = new Set<string>();
  const path: string[] = [];

  const visit = (nodeId: string) => {
    visited.add(nodeId);
    activeStack.add(nodeId);
    path.push(nodeId);

    for (const nextNodeId of adjacency.get(nodeId) ?? []) {
      if (!visited.has(nextNodeId)) {
        visit(nextNodeId);
        continue;
      }

      if (!activeStack.has(nextNodeId)) {
        continue;
      }

      const startIndex = path.indexOf(nextNodeId);
      const nodeIds = path.slice(startIndex);
      const edgeIds = nodeIds.flatMap((source, index) => {
        const target = nodeIds[(index + 1) % nodeIds.length];
        return edgeIdsByConnection.get(edgeKey(source, target)) ?? [];
      });
      const id = nodeIds.slice().sort().join('|');
      loops.set(id, { id, nodeIds, edgeIds });
    }

    path.pop();
    activeStack.delete(nodeId);
  };

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      visit(node.id);
    }
  });

  const loopList = [...loops.values()];
  return {
    hasLoop: loopList.length > 0,
    loops: loopList,
    loopingNodeIds: new Set(loopList.flatMap((loop) => loop.nodeIds)),
    loopingEdgeIds: new Set(loopList.flatMap((loop) => loop.edgeIds)),
  };
}

export function useLoopDetector(nodes: Node[], edges: Edge[]) {
  return useMemo(() => detectPipelineLoops(nodes, edges), [edges, nodes]);
}
