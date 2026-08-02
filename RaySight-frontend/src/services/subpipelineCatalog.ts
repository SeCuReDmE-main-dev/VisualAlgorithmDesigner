import type { LearningAlgorithmFamily } from './algorithmCatalog';

export type SubpipelineCategory = 'starter' | 'decision' | 'network' | 'media' | 'safety';
export type MechanismCategory = 'data' | 'logic' | 'feedback' | 'output' | 'review';
export type LoopCategory = 'practice' | 'monitoring' | 'improvement';

export interface CatalogNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    algorithmId: string;
    label: string;
    category: LearningAlgorithmFamily | MechanismCategory | LoopCategory;
    params?: Record<string, unknown>;
    description?: string;
  };
}

export interface CatalogEdge extends Record<string, unknown> {
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
    id: 'homework-organizer',
    label: 'Homework Organizer',
    category: 'starter',
    description: 'Sort tasks, search for the next one, then schedule a plan.',
    coherenceScore: 94,
    tags: ['starter', 'school', 'planning'],
    loopCompatible: true,
    nodes: [
      { id: 'sort-tasks', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'sorting', label: 'Sort Tasks', category: 'sorting' } },
      { id: 'find-next', type: 'algorithmNode', position: { x: 260, y: -50 }, data: { algorithmId: 'search', label: 'Find Next Task', category: 'search' } },
      { id: 'make-plan', type: 'algorithmNode', position: { x: 520, y: 0 }, data: { algorithmId: 'scheduling', label: 'Build Study Plan', category: 'scheduling' } },
    ],
    edges: [
      { id: 'sort-find', source: 'sort-tasks', target: 'find-next', animated: true },
      { id: 'find-plan', source: 'find-next', target: 'make-plan', animated: true },
    ],
  },
  {
    id: 'game-map-route',
    label: 'Game Map Route',
    category: 'network',
    description: 'Search a map, find a path, then choose the next move.',
    coherenceScore: 92,
    tags: ['games', 'maps', 'pathfinding'],
    loopCompatible: true,
    nodes: [
      { id: 'search-map', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'search', label: 'Search Map', category: 'search' } },
      { id: 'path-route', type: 'algorithmNode', position: { x: 260, y: 0 }, data: { algorithmId: 'pathfinding', label: 'Find Route', category: 'graph' } },
      { id: 'recommend-move', type: 'algorithmNode', position: { x: 520, y: 0 }, data: { algorithmId: 'recommendation', label: 'Recommend Move', category: 'recommendation' } },
    ],
    edges: [
      { id: 'map-route', source: 'search-map', target: 'path-route', animated: true },
      { id: 'route-move', source: 'path-route', target: 'recommend-move', animated: true },
    ],
  },
  {
    id: 'playlist-recommender',
    label: 'Playlist Recommender',
    category: 'decision',
    description: 'Group similar songs, score options, and recommend the next track.',
    coherenceScore: 91,
    tags: ['music', 'groups', 'recommendation'],
    loopCompatible: true,
    nodes: [
      { id: 'group-songs', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'clustering', label: 'Group Songs', category: 'clustering' } },
      { id: 'score-songs', type: 'algorithmNode', position: { x: 260, y: 0 }, data: { algorithmId: 'classification', label: 'Score Mood', category: 'classification' } },
      { id: 'recommend-song', type: 'algorithmNode', position: { x: 520, y: 0 }, data: { algorithmId: 'recommendation', label: 'Recommend Track', category: 'recommendation' } },
    ],
    edges: [
      { id: 'group-score', source: 'group-songs', target: 'score-songs', animated: true },
      { id: 'score-recommend', source: 'score-songs', target: 'recommend-song', animated: true },
    ],
  },
  {
    id: 'privacy-message',
    label: 'Privacy Message',
    category: 'safety',
    description: 'Compress a message, protect it, then verify the output.',
    coherenceScore: 93,
    tags: ['privacy', 'security', 'message'],
    loopCompatible: false,
    nodes: [
      { id: 'compress-message', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'compression', label: 'Compress Message', category: 'compression' } },
      { id: 'encrypt-message', type: 'algorithmNode', position: { x: 260, y: 0 }, data: { algorithmId: 'encryption', label: 'Protect Message', category: 'security' } },
      { id: 'classify-risk', type: 'algorithmNode', position: { x: 520, y: 0 }, data: { algorithmId: 'classification', label: 'Check Risk', category: 'classification' } },
    ],
    edges: [
      { id: 'compress-encrypt', source: 'compress-message', target: 'encrypt-message', animated: true },
      { id: 'encrypt-check', source: 'encrypt-message', target: 'classify-risk', animated: true },
    ],
  },
  {
    id: 'image-understanding',
    label: 'Image Understanding',
    category: 'media',
    description: 'Turn signals into a neural prediction, then explain the label.',
    coherenceScore: 89,
    tags: ['neural', 'classification', 'explain'],
    loopCompatible: true,
    nodes: [
      { id: 'signal-model', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'neural_networks', label: 'Read Signal', category: 'neural' } },
      { id: 'classify-image', type: 'algorithmNode', position: { x: 260, y: 0 }, data: { algorithmId: 'classification', label: 'Choose Label', category: 'classification' } },
    ],
    edges: [{ id: 'signal-label', source: 'signal-model', target: 'classify-image', animated: true }],
  },
];

export const MECHANISM_CATALOG: MechanismTemplate[] = [
  { id: 'input-list', label: 'Input List', category: 'data', algorithmId: 'sorting', description: 'Start with items that need structure.', coherenceScore: 90, tags: ['input'] },
  { id: 'question-box', label: 'Question Box', category: 'logic', algorithmId: 'search', description: 'Ask what the pipeline should find.', coherenceScore: 91, tags: ['search'] },
  { id: 'map-network', label: 'Map Network', category: 'data', algorithmId: 'pathfinding', description: 'Represent places and connections.', coherenceScore: 92, tags: ['graph'] },
  { id: 'group-maker', label: 'Group Maker', category: 'logic', algorithmId: 'clustering', description: 'Discover groups in similar examples.', coherenceScore: 88, tags: ['groups'] },
  { id: 'score-check', label: 'Score Check', category: 'review', algorithmId: 'classification', description: 'Review why a label was selected.', coherenceScore: 89, tags: ['review'] },
  { id: 'privacy-step', label: 'Privacy Step', category: 'logic', algorithmId: 'encryption', description: 'Protect a message with a key idea.', coherenceScore: 93, tags: ['privacy'] },
  { id: 'shorten-step', label: 'Shorten Step', category: 'logic', algorithmId: 'compression', description: 'Find repeated patterns to shrink data.', coherenceScore: 90, tags: ['compression'] },
  { id: 'schedule-step', label: 'Schedule Step', category: 'output', algorithmId: 'scheduling', description: 'Turn decisions into an ordered plan.', coherenceScore: 92, tags: ['plan'] },
];

export const LOOP_CATALOG: LoopTemplate[] = [
  {
    id: 'practice-loop',
    label: 'Practice Loop',
    category: 'practice',
    description: 'Try an answer, explain the result, then improve it.',
    coherenceScore: 93,
    tags: ['practice', 'feedback'],
    nodes: [
      { id: 'try-classify', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'classification', label: 'Try Label', category: 'classification' } },
      { id: 'explain-choice', type: 'algorithmNode', position: { x: 260, y: 0 }, data: { algorithmId: 'search', label: 'Find Reason', category: 'search' } },
    ],
    edges: [{ id: 'label-reason', source: 'try-classify', target: 'explain-choice', animated: true }],
  },
  {
    id: 'fairness-loop',
    label: 'Fairness Loop',
    category: 'monitoring',
    description: 'Watch a decision pipeline for imbalance and review the label.',
    coherenceScore: 90,
    tags: ['review', 'fairness'],
    nodes: [
      { id: 'group-users', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'clustering', label: 'Group Examples', category: 'clustering' } },
      { id: 'check-label', type: 'algorithmNode', position: { x: 260, y: 0 }, data: { algorithmId: 'classification', label: 'Review Label', category: 'classification' } },
    ],
    edges: [{ id: 'group-check', source: 'group-users', target: 'check-label', animated: true }],
  },
  {
    id: 'recommendation-loop',
    label: 'Recommendation Loop',
    category: 'improvement',
    description: 'Recommend, observe feedback, and adjust the next suggestion.',
    coherenceScore: 91,
    tags: ['recommendation', 'feedback'],
    nodes: [
      { id: 'suggest', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'recommendation', label: 'Suggest', category: 'recommendation' } },
      { id: 'rescore', type: 'algorithmNode', position: { x: 260, y: 0 }, data: { algorithmId: 'classification', label: 'Read Feedback', category: 'classification' } },
    ],
    edges: [{ id: 'suggest-feedback', source: 'suggest', target: 'rescore', animated: true }],
  },
];

export const SECURITY_TEMPLATE_CATALOG: SubpipelineTemplate[] = [
  {
    id: 'student-safety-review',
    label: 'Student Safety Review',
    category: 'safety',
    description: 'Protect a message, classify risk, then prepare a teacher review.',
    coherenceScore: 96,
    tags: ['safety', 'privacy', 'teacher-review'],
    loopCompatible: true,
    nodes: [
      { id: 'protect-message', type: 'algorithmNode', position: { x: 0, y: 0 }, data: { algorithmId: 'encryption', label: 'Protect Message', category: 'security' } },
      { id: 'risk-label', type: 'algorithmNode', position: { x: 260, y: -40 }, data: { algorithmId: 'classification', label: 'Risk Label', category: 'classification' } },
      { id: 'plan-review', type: 'algorithmNode', position: { x: 520, y: 0 }, data: { algorithmId: 'scheduling', label: 'Teacher Review Plan', category: 'scheduling' } },
    ],
    edges: [
      { id: 'protect-risk', source: 'protect-message', target: 'risk-label', animated: true },
      { id: 'risk-review', source: 'risk-label', target: 'plan-review', animated: true },
    ],
  },
];
