import type { H2OAlgorithmCategory } from './algorithmCatalog';

export type SubpipelineCategory = 'classic' | 'ensembles' | 'validation' | 'preprocessing' | 'security';
export type MechanismCategory = 'data' | 'preprocessing' | 'training' | 'validation' | 'deployment';
export type LoopCategory = 'tuning' | 'monitoring' | 'retraining';

export interface CatalogNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    algorithmId: string;
    label: string;
    category: H2OAlgorithmCategory | MechanismCategory | LoopCategory;
    params?: Record<string, unknown>;
    description?: string;
  };
}

export interface CatalogEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface SubpipelineTemplate {
  id: string;
  label: string;
  category: SubpipelineCategory;
  description: string;
  nodes: CatalogNode[];
  edges: CatalogEdge[];
  coherenceScore: number;
  tags: string[];
  loopCompatible: boolean;
}

export interface MechanismTemplate {
  id: string;
  label: string;
  category: MechanismCategory;
  description: string;
  algorithmId: string;
  coherenceScore: number;
  tags: string[];
}

export interface LoopTemplate {
  id: string;
  label: string;
  category: LoopCategory;
  description: string;
  nodes: CatalogNode[];
  edges: CatalogEdge[];
  coherenceScore: number;
  tags: string[];
}

export const SUBPIPELINE_CATALOG: SubpipelineTemplate[] = [
  {
    id: 'ml-classic',
    label: 'ML Classique',
    category: 'classic',
    description: 'Train a baseline GLM, compare a GBM, then emit metrics.',
    coherenceScore: 94,
    tags: ['baseline', 'metrics', 'supervised'],
    loopCompatible: true,
    nodes: [
      { id: 'data-source', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'data_frame', label: 'Frame', category: 'data', description: 'Prepared H2OFrame input.' } },
      { id: 'glm-model', type: 'algorithmNode', position: { x: 260, y: -70 }, data: { algorithmId: 'glm', label: 'GLM', category: 'supervised', params: { family: 'auto', alpha: 0.5 } } },
      { id: 'gbm-model', type: 'algorithmNode', position: { x: 260, y: 90 }, data: { algorithmId: 'gbm', label: 'GBM', category: 'supervised', params: { ntrees: 50, max_depth: 5 } } },
    ],
    edges: [
      { id: 'data-glm', source: 'data-source', target: 'glm-model', animated: true },
      { id: 'data-gbm', source: 'data-source', target: 'gbm-model', animated: true },
    ],
  },
  {
    id: 'leaderboard-sprint',
    label: 'Leaderboard Sprint',
    category: 'ensembles',
    description: 'AutoML search followed by explicit GBM challenger.',
    coherenceScore: 91,
    tags: ['automl', 'comparison'],
    loopCompatible: true,
    nodes: [
      { id: 'frame', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'data_frame', label: 'Frame', category: 'data' } },
      { id: 'automl', type: 'algorithmNode', position: { x: 260, y: -50 }, data: { algorithmId: 'automl', label: 'AutoML', category: 'automl', params: { max_models: 20 } } },
      { id: 'gbm', type: 'algorithmNode', position: { x: 260, y: 110 }, data: { algorithmId: 'gbm', label: 'GBM Challenger', category: 'supervised', params: { ntrees: 100 } } },
    ],
    edges: [
      { id: 'frame-automl', source: 'frame', target: 'automl', animated: true },
      { id: 'frame-gbm', source: 'frame', target: 'gbm', animated: true },
    ],
  },
  {
    id: 'cluster-profile',
    label: 'Cluster Profile',
    category: 'classic',
    description: 'K-Means clustering with metrics-ready output.',
    coherenceScore: 88,
    tags: ['unsupervised', 'segments'],
    loopCompatible: false,
    nodes: [
      { id: 'frame', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'data_frame', label: 'Frame', category: 'data' } },
      { id: 'kmeans', type: 'algorithmNode', position: { x: 260, y: 0 }, data: { algorithmId: 'k_means', label: 'K-Means', category: 'unsupervised', params: { k: 3 } } },
    ],
    edges: [{ id: 'frame-kmeans', source: 'frame', target: 'kmeans', animated: true }],
  },
  {
    id: 'deep-learning-check',
    label: 'DL Sanity Check',
    category: 'validation',
    description: 'Neural model paired with GLM baseline for overfit checks.',
    coherenceScore: 89,
    tags: ['deep-learning', 'baseline'],
    loopCompatible: true,
    nodes: [
      { id: 'frame', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'data_frame', label: 'Frame', category: 'data' } },
      { id: 'dl', type: 'algorithmNode', position: { x: 260, y: -70 }, data: { algorithmId: 'deep_learning', label: 'Deep Learning', category: 'supervised', params: { epochs: 10 } } },
      { id: 'glm', type: 'algorithmNode', position: { x: 260, y: 90 }, data: { algorithmId: 'glm', label: 'GLM Baseline', category: 'supervised' } },
    ],
    edges: [
      { id: 'frame-dl', source: 'frame', target: 'dl', animated: true },
      { id: 'frame-glm', source: 'frame', target: 'glm', animated: true },
    ],
  },
  {
    id: 'forest-gbm-stack',
    label: 'Forest + GBM',
    category: 'ensembles',
    description: 'Tree ensemble comparison with shared validation frame.',
    coherenceScore: 92,
    tags: ['ensemble', 'trees'],
    loopCompatible: true,
    nodes: [
      { id: 'frame', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'data_frame', label: 'Frame', category: 'data' } },
      { id: 'forest', type: 'algorithmNode', position: { x: 260, y: -70 }, data: { algorithmId: 'random_forest', label: 'Random Forest', category: 'supervised' } },
      { id: 'gbm', type: 'algorithmNode', position: { x: 260, y: 90 }, data: { algorithmId: 'gbm', label: 'GBM', category: 'supervised' } },
    ],
    edges: [
      { id: 'frame-forest', source: 'frame', target: 'forest', animated: true },
      { id: 'frame-gbm', source: 'frame', target: 'gbm', animated: true },
    ],
  },
];

export const MECHANISM_CATALOG: MechanismTemplate[] = [
  { id: 'data-frame', label: 'H2OFrame', category: 'data', algorithmId: 'data_frame', description: 'Canonical tabular input for H2O pipelines.', coherenceScore: 90, tags: ['input'] },
  { id: 'split-frame', label: 'Train/Valid Split', category: 'data', algorithmId: 'split_frame', description: 'Partition rows for unbiased validation.', coherenceScore: 93, tags: ['validation'] },
  { id: 'target-column', label: 'Target Column', category: 'data', algorithmId: 'target_column', description: 'Declare the supervised learning response.', coherenceScore: 86, tags: ['schema'] },
  { id: 'feature-filter', label: 'Feature Filter', category: 'preprocessing', algorithmId: 'feature_filter', description: 'Remove leakage columns and unused identifiers.', coherenceScore: 88, tags: ['preprocess'] },
  { id: 'grid-search', label: 'Grid Search', category: 'training', algorithmId: 'grid_search', description: 'Explore parameter candidates for a model family.', coherenceScore: 91, tags: ['tuning'] },
  { id: 'cross-validation', label: 'Cross Validation', category: 'validation', algorithmId: 'cross_validation', description: 'Estimate generalization with repeated folds.', coherenceScore: 95, tags: ['folds'] },
  { id: 'leaderboard', label: 'Leaderboard', category: 'validation', algorithmId: 'leaderboard', description: 'Rank candidate models by metric.', coherenceScore: 92, tags: ['metrics'] },
  { id: 'threshold-tune', label: 'Threshold Tune', category: 'validation', algorithmId: 'threshold_tune', description: 'Select operational threshold for classifiers.', coherenceScore: 87, tags: ['classification'] },
  { id: 'export-model', label: 'Export Model', category: 'deployment', algorithmId: 'export_model', description: 'Persist the selected model artifact.', coherenceScore: 89, tags: ['deploy'] },
  { id: 'batch-predict', label: 'Batch Predict', category: 'deployment', algorithmId: 'batch_predict', description: 'Apply a trained model to scoring data.', coherenceScore: 90, tags: ['scoring'] },
];

export const LOOP_CATALOG: LoopTemplate[] = [
  {
    id: 'hyperparameter-loop',
    label: 'Tuning Loop',
    category: 'tuning',
    description: 'Iterate model parameters until validation improves.',
    coherenceScore: 93,
    tags: ['grid', 'metrics'],
    nodes: [
      { id: 'candidate', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'grid_search', label: 'Grid Search', category: 'training' } },
      { id: 'metric', type: 'algorithmNode', position: { x: 260, y: 0 }, data: { algorithmId: 'leaderboard', label: 'Metric Check', category: 'validation' } },
    ],
    edges: [{ id: 'candidate-metric', source: 'candidate', target: 'metric', animated: true }],
  },
  {
    id: 'drift-loop',
    label: 'Drift Loop',
    category: 'monitoring',
    description: 'Monitor scoring data and flag model drift.',
    coherenceScore: 89,
    tags: ['monitoring', 'drift'],
    nodes: [
      { id: 'predict', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'batch_predict', label: 'Batch Predict', category: 'deployment' } },
      { id: 'drift', type: 'algorithmNode', position: { x: 260, y: 0 }, data: { algorithmId: 'drift_check', label: 'Drift Check', category: 'monitoring' } },
    ],
    edges: [{ id: 'predict-drift', source: 'predict', target: 'drift', animated: true }],
  },
  {
    id: 'retrain-loop',
    label: 'Retrain Loop',
    category: 'retraining',
    description: 'Promote retraining when new labeled data arrives.',
    coherenceScore: 91,
    tags: ['feedback', 'promotion'],
    nodes: [
      { id: 'new-data', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'data_frame', label: 'New Labels', category: 'data' } },
      { id: 'automl', type: 'algorithmNode', position: { x: 260, y: 0 }, data: { algorithmId: 'automl', label: 'Retrain AutoML', category: 'automl' } },
    ],
    edges: [{ id: 'new-data-automl', source: 'new-data', target: 'automl', animated: true }],
  },
];

export const SECURITY_TEMPLATE_CATALOG: SubpipelineTemplate[] = [
  {
    id: 'integrity-tenebris',
    label: 'Integrity Tenebris',
    category: 'security',
    description: 'Defensive integrity chain with profile-aware evaluation and audit report output.',
    coherenceScore: 96,
    tags: ['security', 'integrity', 'efvp'],
    loopCompatible: true,
    nodes: [
      { id: 'input-trace', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'data_frame', label: 'Evidence Trace', category: 'data' } },
      { id: 'integrity-check', type: 'algorithmNode', position: { x: 260, y: -40 }, data: { algorithmId: 'integrity_check', label: 'Integrity Check', category: 'validation' } },
      { id: 'audit-report', type: 'algorithmNode', position: { x: 520, y: 0 }, data: { algorithmId: 'compliance_report', label: 'EFVP Report', category: 'deployment' } },
    ],
    edges: [
      { id: 'trace-integrity', source: 'input-trace', target: 'integrity-check', animated: true },
      { id: 'integrity-report', source: 'integrity-check', target: 'audit-report', animated: true },
    ],
  },
];
