import { useCallback, useEffect } from 'react';

export const PIPELINE_STORAGE_KEY = 'vad_pipeline';

export interface StoredPipelineNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: {
    algorithmId?: string;
    label?: string;
    params?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export interface StoredPipelineEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface StoredPipeline {
  version: 1;
  savedAt: number;
  nodes: StoredPipelineNode[];
  edges: StoredPipelineEdge[];
}

export function saveCurrentPipeline(nodes: StoredPipelineNode[], edges: StoredPipelineEdge[]) {
  const pipeline: StoredPipeline = {
    version: 1,
    savedAt: Date.now(),
    nodes,
    edges,
  };

  localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(pipeline));
  return pipeline;
}

export function loadSavedPipeline(): StoredPipeline | null {
  try {
    const rawPipeline = localStorage.getItem(PIPELINE_STORAGE_KEY);

    if (!rawPipeline) {
      return null;
    }

    const parsedPipeline = JSON.parse(rawPipeline) as Partial<StoredPipeline>;

    if (parsedPipeline.version !== 1 || !Array.isArray(parsedPipeline.nodes) || !Array.isArray(parsedPipeline.edges)) {
      return null;
    }

    return parsedPipeline as StoredPipeline;
  } catch {
    return null;
  }
}

export function clearSavedPipeline() {
  localStorage.removeItem(PIPELINE_STORAGE_KEY);
}

export function usePipelineSaver(nodes: StoredPipelineNode[], edges: StoredPipelineEdge[]) {
  useEffect(() => {
    if (nodes.length === 0) {
      return;
    }

    saveCurrentPipeline(nodes, edges);
  }, [edges, nodes]);

  return {
    save: useCallback(() => saveCurrentPipeline(nodes, edges), [edges, nodes]),
    load: loadSavedPipeline,
    clear: clearSavedPipeline,
  };
}
