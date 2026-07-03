import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cancelMLJob, createMLJob, evaluatePipeline, explainPipeline, getMLJob, getMLJobArtifacts } from './api';

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

  it('exposes ML job helpers with the backend contract', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { jobId: 'job-1', status: 'succeeded' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'job-1', status: 'succeeded' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 'job-1', status: 'succeeded' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { jobId: 'job-1', leaderboard: [], metrics: {}, memoryTemplate: { title: 't', content: 'c' }, mojoAvailable: false } }),
      });
    vi.stubGlobal('fetch', fetchMock);

    await expect(createMLJob({ nodes: [], edges: [], mode: 'fallback' })).resolves.toEqual({ jobId: 'job-1', status: 'succeeded' });
    await expect(getMLJob('job-1')).resolves.toEqual({ id: 'job-1', status: 'succeeded' });
    await expect(cancelMLJob('job-1')).resolves.toEqual({ id: 'job-1', status: 'succeeded' });
    await expect(getMLJobArtifacts('job-1')).resolves.toEqual({
      jobId: 'job-1',
      leaderboard: [],
      metrics: {},
      memoryTemplate: { title: 't', content: 'c' },
      mojoAvailable: false,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/ml/jobs', expect.objectContaining({ method: 'POST', credentials: 'include' }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/ml/jobs/job-1', expect.objectContaining({ method: 'GET', credentials: 'include' }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/ml/jobs/job-1/cancel', expect.objectContaining({ method: 'POST', credentials: 'include' }));
    expect(fetchMock).toHaveBeenNthCalledWith(4, '/api/ml/jobs/job-1/artifacts', expect.objectContaining({ method: 'GET', credentials: 'include' }));
  });
});
