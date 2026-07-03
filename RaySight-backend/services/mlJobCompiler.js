const H2O_ALGORITHMS = new Map([
  ['automl', { label: 'AutoML', mojoCapable: true }],
  ['gbm', { label: 'GBM', mojoCapable: true }],
  ['drf', { label: 'Distributed Random Forest', mojoCapable: true }],
  ['randomforest', { label: 'Distributed Random Forest', mojoCapable: true }],
  ['xgboost', { label: 'XGBoost', mojoCapable: true }],
  ['glm', { label: 'GLM', mojoCapable: true }],
  ['deeplearning', { label: 'Deep Learning', mojoCapable: true }],
  ['kmeans', { label: 'K-Means', mojoCapable: true }],
  ['pca', { label: 'PCA', mojoCapable: false }],
  ['isolationforest', { label: 'Isolation Forest', mojoCapable: true }],
  ['stackedensemble', { label: 'Stacked Ensemble', mojoCapable: true }],
]);

function compileCanvas(payload) {
  if (!payload || typeof payload !== 'object') {
    throw badRequest('Request body is required');
  }

  const nodes = normalizeNodes(payload.nodes);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = normalizeEdges(payload.edges || [], nodeIds);
  const classified = nodes.map(classifyNode);
  const h2oNodes = classified.filter((node) => node.h2oAlgorithm);
  const unsupportedNodes = classified.filter((node) => !node.h2oAlgorithm);
  const requestedMode = normalizeMode(payload.mode);

  let status = 'h2o_compatible';
  let reason = 'All nodes map to supported H2O algorithms.';

  if (h2oNodes.length === 0) {
    status = 'memory_only';
    reason = 'No supported H2O algorithm nodes were found; this canvas can still become memory/template metadata.';
  } else if (unsupportedNodes.length > 0) {
    status = 'memory_only';
    reason = 'Some nodes do not map to H2O model builders, so this canvas is stored as memory/template metadata.';
  }

  if (edges.length > 200) {
    throw badRequest('edges must contain 0 to 200 items');
  }

  return {
    requestedMode,
    nodes,
    edges,
    compatibility: {
      status,
      reason,
      h2oAlgorithms: h2oNodes.map((node) => node.h2oAlgorithm),
      supportedNodeIds: h2oNodes.map((node) => node.id),
      unsupportedNodeIds: unsupportedNodes.map((node) => node.id),
      mojoAvailable: h2oNodes.length > 0 && h2oNodes.every((node) => node.mojoCapable),
    },
    executionPlan: {
      type: status === 'h2o_compatible' ? 'h2o_runtime_probe' : 'memory_template',
      algorithms: h2oNodes.map((node) => node.h2oAlgorithm),
      summary: summarizeCanvas(nodes, edges),
    },
  };
}

function normalizeNodes(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0 || nodes.length > 100) {
    throw badRequest('nodes must contain 1 to 100 items');
  }

  return nodes.map((node, index) => {
    if (!node || typeof node !== 'object') {
      throw badRequest(`nodes[${index}] must be an object`);
    }
    const data = node.data && typeof node.data === 'object' ? node.data : {};
    const id = String(node.id || '').trim();
    if (!id) {
      throw badRequest(`nodes[${index}].id is required`);
    }
    return {
      id: id.slice(0, 128),
      type: String(node.type || data.algorithmId || '').slice(0, 128),
      algorithmId: normalizeAlgorithmId(data.algorithmId || node.algorithmId || node.type),
      label: String(data.label || node.label || data.algorithmId || node.type || id).slice(0, 200),
      params: data.params && typeof data.params === 'object' ? data.params : {},
    };
  });
}

function normalizeEdges(edges, nodeIds) {
  if (!Array.isArray(edges)) {
    throw badRequest('edges must be an array');
  }

  return edges.map((edge, index) => {
    if (!edge || typeof edge !== 'object') {
      throw badRequest(`edges[${index}] must be an object`);
    }
    const source = String(edge.source || '').trim();
    const target = String(edge.target || '').trim();
    if (!source || !target) {
      throw badRequest(`edges[${index}] requires source and target`);
    }
    if (!nodeIds.has(source) || !nodeIds.has(target)) {
      throw badRequest(`edges[${index}] references an unknown node`);
    }
    return {
      id: String(edge.id || `${source}->${target}`).slice(0, 128),
      source,
      target,
    };
  });
}

function classifyNode(node) {
  const key = normalizeAlgorithmId(node.algorithmId || node.type || node.label);
  const h2oAlgorithm = H2O_ALGORITHMS.get(key);
  return {
    ...node,
    h2oAlgorithm: h2oAlgorithm ? key : null,
    h2oLabel: h2oAlgorithm ? h2oAlgorithm.label : null,
    mojoCapable: Boolean(h2oAlgorithm?.mojoCapable),
  };
}

function normalizeAlgorithmId(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function normalizeMode(mode) {
  const value = String(mode || 'h2o').toLowerCase();
  if (value === 'fallback') return 'fallback';
  return 'h2o';
}

function summarizeCanvas(nodes, edges) {
  const labels = nodes.map((node) => node.label).join(' -> ');
  return `${nodes.length} node(s), ${edges.length} edge(s): ${labels}`;
}

function badRequest(message) {
  return Object.assign(new Error(message), { status: 400, code: 'BAD_REQUEST' });
}

module.exports = {
  H2O_ALGORITHMS,
  compileCanvas,
  __private: {
    normalizeAlgorithmId,
    normalizeMode,
  },
};
