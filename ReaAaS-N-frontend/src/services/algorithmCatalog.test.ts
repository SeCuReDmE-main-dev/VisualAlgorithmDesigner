import { describe, expect, it } from 'vitest';
import { ALGORITHM_CATALOG, getAlgorithmById, getDefaultParams, searchAlgorithms } from './algorithmCatalog';

describe('algorithmCatalog', () => {
  it('contains the H2O Lot 1 algorithms', () => {
    expect(ALGORITHM_CATALOG.map((algorithm) => algorithm.id)).toEqual([
      'gbm',
      'glm',
      'random_forest',
      'deep_learning',
      'k_means',
      'automl',
    ]);
  });

  it('searches by label, category, and parameter text', () => {
    expect(searchAlgorithms('forest')).toEqual([getAlgorithmById('random_forest')]);
    expect(searchAlgorithms('unsupervised')).toEqual([getAlgorithmById('k_means')]);
    expect(searchAlgorithms('learn_rate')).toEqual([getAlgorithmById('gbm')]);
  });

  it('returns default params for an algorithm', () => {
    expect(getDefaultParams('gbm')).toMatchObject({
      ntrees: 50,
      max_depth: 5,
      learn_rate: 0.1,
    });
  });
});
