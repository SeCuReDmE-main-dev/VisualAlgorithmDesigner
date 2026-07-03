export type LearningAlgorithmFamily =
  | 'sorting'
  | 'search'
  | 'graph'
  | 'recommendation'
  | 'classification'
  | 'clustering'
  | 'security'
  | 'compression'
  | 'scheduling'
  | 'neural';

export type LearningParamType = 'integer' | 'float' | 'boolean' | 'enum';
export type LearningInputPort = 'items' | 'question' | 'graph' | 'data' | 'message' | 'task' | 'signal';
export type LearningOutputPort = 'ordered-items' | 'answer' | 'path' | 'score' | 'group' | 'protected-message' | 'shorter-message' | 'plan' | 'prediction';

export interface LearningParam {
  key: string;
  label: string;
  type: LearningParamType;
  default: number | boolean | string;
  min?: number;
  max?: number;
  options?: string[];
  description: string;
}

export interface LearningAlgorithm {
  id: string;
  type: 'learningAlgorithm';
  name: string;
  label: string;
  family: LearningAlgorithmFamily;
  category: LearningAlgorithmFamily;
  plainPurpose: string;
  realWorldExample: string;
  historyNote: string;
  inputs: LearningInputPort[];
  outputs: LearningOutputPort[];
  inputPorts: LearningInputPort[];
  outputPorts: LearningOutputPort[];
  difficulty: 'starter' | 'builder' | 'advanced';
  whyItMatters: string;
  sourceRefs: string[];
  h2oAnnexRefs?: string[];
  description: string;
  params: LearningParam[];
}

export const ALGORITHM_CATALOG: LearningAlgorithm[] = [
  {
    id: 'sorting',
    type: 'learningAlgorithm',
    name: 'Sorting',
    label: 'Sorting',
    family: 'sorting',
    category: 'sorting',
    plainPurpose: 'Put things in a useful order.',
    realWorldExample: 'Sort class scores from lowest to highest or arrange songs by release date.',
    historyNote: 'Sorting became a classic computer science problem because computers constantly need ordered data.',
    inputs: ['items'],
    outputs: ['ordered-items'],
    inputPorts: ['items'],
    outputPorts: ['ordered-items'],
    difficulty: 'starter',
    whyItMatters: 'Ordered data makes search, ranking, and comparison much easier to understand.',
    sourceRefs: ['computer-science/sorting'],
    description: 'Arrange a list so humans and programs can compare it quickly.',
    params: [
      { key: 'order', label: 'Order', type: 'enum', default: 'ascending', options: ['ascending', 'descending'], description: 'Choose whether values rise or fall.' },
      { key: 'stable', label: 'Keep ties stable', type: 'boolean', default: true, description: 'Keep equal items in their original order.' },
    ],
  },
  {
    id: 'search',
    type: 'learningAlgorithm',
    name: 'Search',
    label: 'Search',
    family: 'search',
    category: 'search',
    plainPurpose: 'Find one useful answer inside many possibilities.',
    realWorldExample: 'Find a contact in a phone or a video in a streaming app.',
    historyNote: 'Efficient search is one reason early databases and web indexes became powerful.',
    inputs: ['items', 'question'],
    outputs: ['answer'],
    inputPorts: ['items', 'question'],
    outputPorts: ['answer'],
    difficulty: 'starter',
    whyItMatters: 'Search shows why structure matters: organized data can answer faster.',
    sourceRefs: ['computer-science/search'],
    description: 'Look through data and return the best matching item.',
    params: [
      { key: 'strategy', label: 'Strategy', type: 'enum', default: 'binary', options: ['linear', 'binary'], description: 'Linear checks one by one; binary splits ordered data in half.' },
      { key: 'max_checks', label: 'Max checks', type: 'integer', default: 20, min: 1, max: 1000, description: 'Limit how many places the search can inspect.' },
    ],
  },
  {
    id: 'pathfinding',
    type: 'learningAlgorithm',
    name: 'Pathfinding',
    label: 'Pathfinding',
    family: 'graph',
    category: 'graph',
    plainPurpose: 'Find a route from one point to another.',
    realWorldExample: 'Map directions, game character movement, and robot navigation.',
    historyNote: 'Edsger Dijkstra published a shortest-path method in 1959 that is still taught today.',
    inputs: ['graph'],
    outputs: ['path'],
    inputPorts: ['graph'],
    outputPorts: ['path'],
    difficulty: 'builder',
    whyItMatters: 'Pathfinding turns a messy map into a decision process that can be inspected.',
    sourceRefs: ['dijkstra/shortest-path'],
    description: 'Explore connections and choose a route through a network.',
    params: [
      { key: 'strategy', label: 'Strategy', type: 'enum', default: 'dijkstra', options: ['breadth-first', 'dijkstra', 'a-star'], description: 'Choose how the route is explored.' },
      { key: 'prefer_shortest', label: 'Prefer shortest', type: 'boolean', default: true, description: 'Prefer fewer steps when routes tie.' },
    ],
  },
  {
    id: 'recommendation',
    type: 'learningAlgorithm',
    name: 'Recommendation',
    label: 'Recommendation',
    family: 'recommendation',
    category: 'recommendation',
    plainPurpose: 'Suggest what may be useful next.',
    realWorldExample: 'Recommend a song, video, article, or practice exercise.',
    historyNote: 'Recommendation systems became famous as the web learned from clicks, ratings, and shared patterns.',
    inputs: ['data'],
    outputs: ['score'],
    inputPorts: ['data'],
    outputPorts: ['score'],
    difficulty: 'builder',
    whyItMatters: 'Recommendations shape what people see, so students should understand how they are built.',
    sourceRefs: ['computer-science/recommendation'],
    description: 'Score options and suggest the next useful item.',
    params: [
      { key: 'signal', label: 'Signal', type: 'enum', default: 'similarity', options: ['similarity', 'popularity', 'recent activity'], description: 'Choose the clue used to suggest an item.' },
      { key: 'top_k', label: 'Top results', type: 'integer', default: 5, min: 1, max: 50, description: 'How many suggestions to return.' },
    ],
  },
  {
    id: 'classification',
    type: 'learningAlgorithm',
    name: 'Classification',
    label: 'Classification',
    family: 'classification',
    category: 'classification',
    plainPurpose: 'Choose the most likely label for something.',
    realWorldExample: 'Decide if a message is spam, a photo has a stop sign, or a support ticket is urgent.',
    historyNote: 'Alan Turing helped frame the question of how machines can follow rules and appear intelligent.',
    inputs: ['data'],
    outputs: ['prediction'],
    inputPorts: ['data'],
    outputPorts: ['prediction'],
    difficulty: 'builder',
    whyItMatters: 'Classification affects real decisions, so students must learn what a label can and cannot prove.',
    sourceRefs: ['turing/computation', 'machine-learning/classification'],
    h2oAnnexRefs: ['gbm', 'glm', 'random_forest'],
    description: 'Assign a label by comparing evidence against learned patterns.',
    params: [
      { key: 'threshold', label: 'Confidence threshold', type: 'float', default: 0.5, min: 0, max: 1, description: 'Minimum confidence before a label is accepted.' },
      { key: 'explain_label', label: 'Explain label', type: 'boolean', default: true, description: 'Show why the label was selected.' },
    ],
  },
  {
    id: 'clustering',
    type: 'learningAlgorithm',
    name: 'Clustering',
    label: 'Clustering',
    family: 'clustering',
    category: 'clustering',
    plainPurpose: 'Group similar things without knowing labels first.',
    realWorldExample: 'Group similar songs, shopping habits, or study patterns.',
    historyNote: 'Clustering helped researchers explore data before knowing exactly what they were looking for.',
    inputs: ['data'],
    outputs: ['group'],
    inputPorts: ['data'],
    outputPorts: ['group'],
    difficulty: 'builder',
    whyItMatters: 'Clustering teaches students that patterns can be discovered, but still need human interpretation.',
    sourceRefs: ['machine-learning/clustering'],
    h2oAnnexRefs: ['k_means'],
    description: 'Find groups of similar items in unlabeled data.',
    params: [
      { key: 'groups', label: 'Groups', type: 'integer', default: 3, min: 1, max: 20, description: 'How many groups the algorithm should look for.' },
      { key: 'distance', label: 'Distance', type: 'enum', default: 'similarity', options: ['similarity', 'difference'], description: 'How the algorithm judges whether items belong together.' },
    ],
  },
  {
    id: 'encryption',
    type: 'learningAlgorithm',
    name: 'Encryption',
    label: 'Encryption',
    family: 'security',
    category: 'security',
    plainPurpose: 'Transform a message so only the right key can read it.',
    realWorldExample: 'Protect a private chat or school account password in transit.',
    historyNote: 'From ancient ciphers to modern cryptography, hiding and proving information shaped computing history.',
    inputs: ['message'],
    outputs: ['protected-message'],
    inputPorts: ['message'],
    outputPorts: ['protected-message'],
    difficulty: 'starter',
    whyItMatters: 'Encryption makes privacy concrete and shows why keys must be protected.',
    sourceRefs: ['cryptography/introduction'],
    description: 'Protect information by turning readable text into a locked form.',
    params: [
      { key: 'method', label: 'Method', type: 'enum', default: 'toy-caesar', options: ['toy-caesar', 'keyed-hash', 'public-key'], description: 'Choose the learning-safe protection model.' },
      { key: 'key_strength', label: 'Key strength', type: 'integer', default: 3, min: 1, max: 10, description: 'Toy strength setting used for education.' },
    ],
  },
  {
    id: 'compression',
    type: 'learningAlgorithm',
    name: 'Compression',
    label: 'Compression',
    family: 'compression',
    category: 'compression',
    plainPurpose: 'Represent the same information with fewer pieces.',
    realWorldExample: 'Shrink an image, zip homework files, or stream video with less bandwidth.',
    historyNote: 'Claude Shannon gave information theory the math language behind compression and communication.',
    inputs: ['message'],
    outputs: ['shorter-message'],
    inputPorts: ['message'],
    outputPorts: ['shorter-message'],
    difficulty: 'starter',
    whyItMatters: 'Compression shows that information has structure, repetition, and tradeoffs.',
    sourceRefs: ['shannon/information-theory'],
    description: 'Find repeated patterns and store the message more efficiently.',
    params: [
      { key: 'lossy', label: 'Allow loss', type: 'boolean', default: false, description: 'Allow the result to lose some detail for a smaller output.' },
      { key: 'window', label: 'Pattern window', type: 'integer', default: 8, min: 2, max: 64, description: 'How far back the algorithm searches for repeated patterns.' },
    ],
  },
  {
    id: 'scheduling',
    type: 'learningAlgorithm',
    name: 'Scheduling',
    label: 'Scheduling',
    family: 'scheduling',
    category: 'scheduling',
    plainPurpose: 'Choose what should happen first when time and resources are limited.',
    realWorldExample: 'Plan study sessions, game server tasks, or cafeteria lines.',
    historyNote: 'Operating systems use scheduling to share one machine fairly between many jobs.',
    inputs: ['task'],
    outputs: ['plan'],
    inputPorts: ['task'],
    outputPorts: ['plan'],
    difficulty: 'builder',
    whyItMatters: 'Scheduling makes fairness, priority, and efficiency visible.',
    sourceRefs: ['operating-systems/scheduling'],
    description: 'Order tasks so limited time is used wisely.',
    params: [
      { key: 'policy', label: 'Policy', type: 'enum', default: 'priority', options: ['first-in-first-out', 'shortest-first', 'priority'], description: 'Rule used to pick the next task.' },
      { key: 'time_slice', label: 'Time slice', type: 'integer', default: 5, min: 1, max: 60, description: 'How long a task gets before another task can run.' },
    ],
  },
  {
    id: 'neural_networks',
    type: 'learningAlgorithm',
    name: 'Neural Networks',
    label: 'Neural Networks',
    family: 'neural',
    category: 'neural',
    plainPurpose: 'Stack simple decisions into a model that can learn patterns.',
    realWorldExample: 'Recognize speech, translate text, or classify images.',
    historyNote: 'Neural ideas grew from early models of neurons into modern deep learning systems.',
    inputs: ['signal'],
    outputs: ['prediction'],
    inputPorts: ['signal'],
    outputPorts: ['prediction'],
    difficulty: 'advanced',
    whyItMatters: 'Neural networks are powerful, but students need to see them as connected steps, not magic.',
    sourceRefs: ['machine-learning/neural-networks'],
    h2oAnnexRefs: ['deep_learning'],
    description: 'Connect layers of small pattern detectors to make a prediction.',
    params: [
      { key: 'layers', label: 'Layers', type: 'integer', default: 2, min: 1, max: 8, description: 'How many learning layers to connect.' },
      { key: 'learning_rate', label: 'Learning rate', type: 'float', default: 0.01, min: 0.001, max: 1, description: 'How quickly the model changes after mistakes.' },
    ],
  },
];

export const ALGORITHM_HISTORY_TIMELINE = [
  { id: 'lovelace', name: 'Ada Lovelace', year: 1843, note: 'Described how a machine could follow symbolic instructions.' },
  { id: 'turing', name: 'Alan Turing', year: 1936, note: 'Defined a model of computation that still anchors computer science.' },
  { id: 'shannon', name: 'Claude Shannon', year: 1948, note: 'Built the mathematical foundation of information and communication.' },
  { id: 'dijkstra', name: 'Edsger Dijkstra', year: 1959, note: 'Published a shortest-path method used to teach graph algorithms.' },
  { id: 'pagerank', name: 'PageRank', year: 1998, note: 'Ranked web pages by using links as signals of importance.' },
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
      algorithm.family,
      algorithm.plainPurpose,
      algorithm.realWorldExample,
      algorithm.historyNote,
      algorithm.whyItMatters,
      algorithm.description,
      ...algorithm.params.map((param) => `${param.key} ${param.label} ${param.description}`),
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
