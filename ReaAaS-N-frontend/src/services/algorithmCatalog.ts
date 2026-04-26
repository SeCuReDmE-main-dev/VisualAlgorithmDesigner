export type H2OAlgorithmCategory = 'supervised' | 'unsupervised' | 'automl';
export type H2OParamType = 'integer' | 'float' | 'boolean' | 'enum';
export type H2OInputPort = 'data' | 'validation' | 'model';
export type H2OOutputPort = 'model' | 'prediction' | 'metrics';

export interface H2OParam {
  key: string;
  label: string;
  type: H2OParamType;
  default: number | boolean | string;
  min?: number;
  max?: number;
  options?: string[];
  description: string;
}

export interface H2OAlgorithm {
  id: string;
  type: string;
  label: string;
  category: H2OAlgorithmCategory;
  description: string;
  inputPorts: H2OInputPort[];
  outputPorts: H2OOutputPort[];
  params: H2OParam[];
}

export const ALGORITHM_CATALOG: H2OAlgorithm[] = [
  {
    id: 'gbm',
    type: 'h2oAlgorithm',
    label: 'GBM',
    category: 'supervised',
    description: 'Gradient Boosting Machine for tabular classification and regression pipelines.',
    inputPorts: ['data', 'validation'],
    outputPorts: ['model', 'prediction', 'metrics'],
    params: [
      { key: 'ntrees', label: 'Trees', type: 'integer', default: 50, min: 1, max: 10_000, description: 'Number of trees built by the boosted ensemble.' },
      { key: 'max_depth', label: 'Max depth', type: 'integer', default: 5, min: 1, max: 100, description: 'Maximum depth allowed for each tree.' },
      { key: 'learn_rate', label: 'Learn rate', type: 'float', default: 0.1, min: 0, max: 1, description: 'Shrinkage applied after each boosting step.' },
      { key: 'sample_rate', label: 'Sample rate', type: 'float', default: 1, min: 0, max: 1, description: 'Row sampling rate per tree.' },
      { key: 'col_sample_rate', label: 'Column sample rate', type: 'float', default: 1, min: 0, max: 1, description: 'Column sampling rate per split.' },
    ],
  },
  {
    id: 'glm',
    type: 'h2oAlgorithm',
    label: 'GLM',
    category: 'supervised',
    description: 'Generalized Linear Model for interpretable regression and classification.',
    inputPorts: ['data', 'validation'],
    outputPorts: ['model', 'prediction', 'metrics'],
    params: [
      { key: 'family', label: 'Family', type: 'enum', default: 'auto', options: ['auto', 'gaussian', 'binomial', 'multinomial', 'poisson', 'gamma'], description: 'Distribution family for the response variable.' },
      { key: 'alpha', label: 'Alpha', type: 'float', default: 0.5, min: 0, max: 1, description: 'Elastic net mixing parameter.' },
      { key: 'lambda', label: 'Lambda', type: 'float', default: 0, min: 0, max: 1, description: 'Regularization strength.' },
      { key: 'solver', label: 'Solver', type: 'enum', default: 'AUTO', options: ['AUTO', 'IRLSM', 'L_BFGS', 'COORDINATE_DESCENT'], description: 'Optimization algorithm used for fitting.' },
      { key: 'standardize', label: 'Standardize', type: 'boolean', default: true, description: 'Standardize numeric columns before training.' },
    ],
  },
  {
    id: 'random_forest',
    type: 'h2oAlgorithm',
    label: 'Random Forest',
    category: 'supervised',
    description: 'Distributed Random Forest ensemble for robust tabular predictions.',
    inputPorts: ['data', 'validation'],
    outputPorts: ['model', 'prediction', 'metrics'],
    params: [
      { key: 'ntrees', label: 'Trees', type: 'integer', default: 50, min: 1, max: 10_000, description: 'Number of trees in the forest.' },
      { key: 'max_depth', label: 'Max depth', type: 'integer', default: 20, min: 1, max: 100, description: 'Maximum depth for each decision tree.' },
      { key: 'mtries', label: 'Mtries', type: 'integer', default: -1, min: -1, max: 10_000, description: 'Columns randomly selected at each split; -1 lets H2O choose.' },
      { key: 'sample_rate', label: 'Sample rate', type: 'float', default: 0.632, min: 0, max: 1, description: 'Row sampling rate for tree construction.' },
    ],
  },
  {
    id: 'deep_learning',
    type: 'h2oAlgorithm',
    label: 'Deep Learning',
    category: 'supervised',
    description: 'Feed-forward neural network for classification, regression, and representation learning.',
    inputPorts: ['data', 'validation'],
    outputPorts: ['model', 'prediction', 'metrics'],
    params: [
      { key: 'hidden', label: 'Hidden layers', type: 'enum', default: '200,200', options: ['50', '100,100', '200,200', '500,500'], description: 'Hidden layer widths.' },
      { key: 'epochs', label: 'Epochs', type: 'float', default: 10, min: 0, max: 1_000, description: 'Training passes over the dataset.' },
      { key: 'rate', label: 'Learning rate', type: 'float', default: 0.005, min: 0, max: 1, description: 'Base learning rate for network training.' },
      { key: 'activation', label: 'Activation', type: 'enum', default: 'Rectifier', options: ['Tanh', 'TanhWithDropout', 'Rectifier', 'RectifierWithDropout', 'Maxout', 'MaxoutWithDropout'], description: 'Neuron activation function.' },
    ],
  },
  {
    id: 'k_means',
    type: 'h2oAlgorithm',
    label: 'K-Means',
    category: 'unsupervised',
    description: 'Clustering algorithm that groups rows by nearest centroid.',
    inputPorts: ['data'],
    outputPorts: ['model', 'metrics'],
    params: [
      { key: 'k', label: 'Clusters', type: 'integer', default: 3, min: 1, max: 10_000, description: 'Number of clusters to create.' },
      { key: 'init', label: 'Initialization', type: 'enum', default: 'Furthest', options: ['Random', 'PlusPlus', 'Furthest', 'User'], description: 'Centroid initialization strategy.' },
      { key: 'max_iterations', label: 'Max iterations', type: 'integer', default: 10, min: 1, max: 1_000, description: 'Maximum training iterations.' },
      { key: 'seed', label: 'Seed', type: 'integer', default: -1, min: -1, max: 2_147_483_647, description: 'Random seed; -1 lets H2O choose.' },
    ],
  },
  {
    id: 'automl',
    type: 'h2oAlgorithm',
    label: 'AutoML',
    category: 'automl',
    description: 'Automated model search and leaderboard generation across H2O algorithms.',
    inputPorts: ['data', 'validation'],
    outputPorts: ['model', 'prediction', 'metrics'],
    params: [
      { key: 'max_models', label: 'Max models', type: 'integer', default: 20, min: 1, max: 10_000, description: 'Maximum number of models to train.' },
      { key: 'max_runtime_secs', label: 'Max runtime seconds', type: 'integer', default: 0, min: 0, max: 604_800, description: 'Runtime budget; 0 means no explicit limit.' },
      { key: 'exclude_algos', label: 'Exclude algorithms', type: 'enum', default: 'none', options: ['none', 'DRF', 'GLM', 'GBM', 'DeepLearning', 'StackedEnsemble'], description: 'Algorithm families excluded from the AutoML run.' },
      { key: 'sort_metric', label: 'Sort metric', type: 'enum', default: 'AUTO', options: ['AUTO', 'AUC', 'logloss', 'RMSE', 'MAE', 'deviance'], description: 'Metric used to sort the leaderboard.' },
    ],
  },
];

export function searchAlgorithms(query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return ALGORITHM_CATALOG;
  }

  return ALGORITHM_CATALOG.filter((algorithm) => {
    const searchableText = [
      algorithm.id,
      algorithm.label,
      algorithm.category,
      algorithm.description,
      ...algorithm.params.map((param) => `${param.key} ${param.label}`),
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

export function getAlgorithmById(id: string) {
  return ALGORITHM_CATALOG.find((algorithm) => algorithm.id === id);
}

export function getDefaultParams(algorithmId: string) {
  const algorithm = getAlgorithmById(algorithmId);

  if (!algorithm) {
    return {};
  }

  return Object.fromEntries(algorithm.params.map((param) => [param.key, param.default]));
}
