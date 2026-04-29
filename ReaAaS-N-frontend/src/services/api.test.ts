import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { evaluatePipeline, explainPipeline } from './api';

describe('api pipeline helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('crypto', { randomUUID: () => 'session-123' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts explain requests with credentials included', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { explanation: 'ok' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(explainPipeline({ nodes: [], edges: [] })).resolves.toEqual({ explanation: 'ok' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/ai/explain-pipeline',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
  });

  it('posts evaluate requests and unwraps data responses', async () => {
    const evaluation = {
      explanation: 'ready',
      coherenceScore: 95,
      recommendation: 'valid',
      weakPoints: [],
      strongPoints: ['connected'],
      loopCompatible: false,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: evaluation }),
      }),
    );

    await expect(evaluatePipeline({ nodes: [], edges: [] })).resolves.toEqual(evaluation);
  });
});
