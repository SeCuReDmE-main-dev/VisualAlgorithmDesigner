import { describe, expect, it, beforeEach } from 'vitest';
import {
  PIPELINE_STORAGE_KEY,
  clearSavedPipeline,
  loadSavedPipeline,
  saveCurrentPipeline,
  type StoredPipelineEdge,
  type StoredPipelineNode,
} from './usePipelineSaver';

const nodes: StoredPipelineNode[] = [
  {
    id: 'node-1',
    type: 'learningAlgorithm',
    position: { x: 10, y: 20 },
    data: { algorithmId: 'classification', label: 'Classification', params: { threshold: 0.5 } },
  },
];

const edges: StoredPipelineEdge[] = [{ id: 'edge-1', source: 'node-1', target: 'node-2', animated: true }];

describe('usePipelineSaver helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads the versioned pipeline schema', () => {
    const saved = saveCurrentPipeline(nodes, edges);
    expect(saved.version).toBe(1);
    expect(loadSavedPipeline()).toMatchObject({ version: 1, nodes, edges });
  });

  it('returns null for invalid stored data and clears saved pipelines', () => {
    localStorage.setItem(PIPELINE_STORAGE_KEY, '{"version":2}');
    expect(loadSavedPipeline()).toBeNull();

    saveCurrentPipeline(nodes, edges);
    clearSavedPipeline();
    expect(loadSavedPipeline()).toBeNull();
  });
});
