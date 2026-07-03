import { describe, expect, it } from 'vitest';
import { ALGORITHM_CATALOG, getAlgorithmById, getDefaultParams, searchAlgorithms } from './algorithmCatalog';

describe('algorithmCatalog', () => {
  it('contains the VAD learning starter algorithms', () => {
    expect(ALGORITHM_CATALOG.map((algorithm) => algorithm.id)).toEqual([
      'sorting',
      'search',
      'pathfinding',
      'recommendation',
      'classification',
      'clustering',
      'encryption',
      'compression',
      'scheduling',
      'neural_networks',
    ]);
  });

  it('searches by label, family, examples, and parameter text', () => {
    expect(searchAlgorithms('map')).toContain(getAlgorithmById('pathfinding'));
    expect(searchAlgorithms('privacy')).toContain(getAlgorithmById('encryption'));
    expect(searchAlgorithms('threshold')).toContain(getAlgorithmById('classification'));
  });

  it('returns default params for an algorithm', () => {
    expect(getDefaultParams('classification')).toMatchObject({
      threshold: 0.5,
      explain_label: true,
    });
  });

  it('keeps H2O references only as optional annex metadata', () => {
    expect(getAlgorithmById('classification')?.h2oAnnexRefs).toEqual(['gbm', 'glm', 'random_forest']);
    expect(getAlgorithmById('sorting')?.h2oAnnexRefs).toBeUndefined();
  });
});
