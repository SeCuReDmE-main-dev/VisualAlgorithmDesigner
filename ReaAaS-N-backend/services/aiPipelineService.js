const crypto = require('crypto');
const Groq = require('groq-sdk');
const { normalizeSessionId } = require('./memoryRepository');

const MAX_ITERATIONS = 5;

const SECURITY_PROFILES = {
  general: {
    label: 'General',
    legalJustification: 'General educational or professional algorithm design.',
    allowedVocabulary: ['pipeline', 'model', 'training', 'evaluation', 'loop', 'feedback'],
    promotionThreshold: 93,
  },
  educational: {
    label: 'Educational',
    legalJustification: 'Student learning and classroom explanation.',
    allowedVocabulary: ['step', 'concept', 'example', 'rubric', 'feedback'],
    promotionThreshold: 90,
  },
  integrity: {
    label: 'Integrity',
    legalJustification: 'Defensive integrity monitoring and audit workflows.',
    allowedVocabulary: ['threat', 'anomaly', 'integrity', 'audit', 'risk', 'control'],
    promotionThreshold: 96,
  },
  compliance: {
    label: 'Compliance',
    legalJustification: 'Governance, privacy, and compliance review.',
    allowedVocabulary: ['audit', 'privacy', 'retention', 'consent', 'policy', 'evidence'],
    promotionThreshold: 95,
  },
  security: {
    label: 'Security',
    legalJustification: 'Authorized defensive security analysis.',
    allowedVocabulary: ['detection', 'incident', 'triage', 'containment', 'indicator', 'exploit'],
    promotionThreshold: 95,
  },
  research: {
    label: 'Research',
    legalJustification: 'Controlled research and evaluation.',
    allowedVocabulary: ['experiment', 'baseline', 'metric', 'validation', 'dataset'],
    promotionThreshold: 93,
  },
  operations: {
    label: 'Operations',
    legalJustification: 'Operational decision support and automation.',
    allowedVocabulary: ['monitoring', 'alert', 'handoff', 'runbook', 'rollback'],
    promotionThreshold: 93,
  },
};

class AIPipelineService {
  constructor({ memoryRepository, groqClient, model, maxTokens } = {}) {
    this.memoryRepository = memoryRepository;
    this.groqClient = groqClient || (process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null);
    this.model = model || process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    this.maxTokens = Number(maxTokens || process.env.GROQ_MAX_TOKENS || 1024);
  }

  async explainPipeline(payload, requestContext = {}) {
    const startedAt = Date.now();
    const pipeline = validatePipelinePayload(payload);
    const sessionId = normalizeSessionId(requestContext.sessionId || payload.sessionId);
    const securityProfile = normalizeSecurityProfile(payload.securityProfile);
    const traversal = buildTraversalSummary(pipeline.nodes, pipeline.edges, payload.focusNodeId);
    const promptHash = hashJson({ pipeline, securityProfile, intent: 'explain' });
    const relatedMemories = this.searchMemories(sessionId, pipeline);

    const messages = [
      { role: 'system', content: buildSystemPrompt(securityProfile, 'explain') },
      { role: 'user', content: buildExplainPrompt(pipeline, traversal, relatedMemories) },
    ];

    const aiText = await this.callGroq(messages);
    const explanation = aiText || buildFallbackExplanation(pipeline, traversal, relatedMemories);

    this.memoryRepository?.addMemory(sessionId, {
      content: `Explained pipeline: ${summarizePipeline(pipeline)}\nFocus: ${payload.focusNodeId || 'pipeline'}\nExplanation: ${explanation}`,
      category: 'explanation',
      metadata: { promptHash, securityProfile },
    });

    return {
      explanation,
      focusNodeId: payload.focusNodeId || null,
      promptHash,
      memoryMatches: relatedMemories.length,
      loopGuard: {
        maxIterations: MAX_ITERATIONS,
        visitedNodeIds: traversal.visitedNodeIds,
        truncated: traversal.truncated,
      },
      securityProfile,
      latency_ms: Date.now() - startedAt,
    };
  }

  async evaluatePipeline(payload, requestContext = {}) {
    const startedAt = Date.now();
    const pipeline = validatePipelinePayload(payload);
    const sessionId = normalizeSessionId(requestContext.sessionId || payload.sessionId);
    const securityProfile = normalizeSecurityProfile(payload.securityProfile);
    const misuse = detectContextualMisuse(pipeline.nodes, securityProfile);
    const promptHash = hashJson({ pipeline, securityProfile, intent: 'evaluate' });

    if (misuse.isSuspicious) {
      return {
        explanation: misuse.reason,
        coherenceScore: 0,
        recommendation: 'invalid',
        weakPoints: [misuse.reason],
        strongPoints: [],
        loopCompatible: false,
        promptHash,
        securityProfile,
        latency_ms: Date.now() - startedAt,
      };
    }

    const traversal = buildTraversalSummary(pipeline.nodes, pipeline.edges, payload.focusNodeId);
    const relatedMemories = this.searchMemories(sessionId, pipeline);
    const messages = [
      { role: 'system', content: buildSystemPrompt(securityProfile, 'evaluate') },
      { role: 'user', content: buildEvaluatePrompt(pipeline, traversal, relatedMemories) },
    ];

    const aiText = await this.callGroq(messages);
    const evaluation = parseEvaluation(aiText) || buildFallbackEvaluation(pipeline, traversal);

    this.memoryRepository?.addMemory(sessionId, {
      content: `Evaluated pipeline: ${summarizePipeline(pipeline)}\nScore: ${evaluation.coherenceScore}\nRecommendation: ${evaluation.recommendation}`,
      category: 'evaluation',
      metadata: { promptHash, securityProfile },
    });

    return {
      ...evaluation,
      promptHash,
      securityProfile,
      loopGuard: {
        maxIterations: MAX_ITERATIONS,
        visitedNodeIds: traversal.visitedNodeIds,
        truncated: traversal.truncated,
      },
      latency_ms: Date.now() - startedAt,
    };
  }

  searchMemories(sessionId, pipeline) {
    if (!this.memoryRepository) {
      return [];
    }
    const query = pipeline.nodes.map((node) => node.label || node.type || node.id).join(' ');
    return this.memoryRepository.search(sessionId, query, 5);
  }

  async callGroq(messages) {
    if (!this.groqClient) {
      return null;
    }

    try {
      const completion = await this.groqClient.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.2,
        max_tokens: this.maxTokens,
      });
      return completion.choices?.[0]?.message?.content?.trim() || null;
    } catch (_error) {
      return null;
    }
  }
}

function validatePipelinePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw badRequest('Request body is required');
  }
  if (!Array.isArray(payload.nodes) || payload.nodes.length === 0 || payload.nodes.length > 100) {
    throw badRequest('nodes must contain 1 to 100 items');
  }
  if (!Array.isArray(payload.edges) || payload.edges.length > 200) {
    throw badRequest('edges must contain 0 to 200 items');
  }

  const nodes = payload.nodes.map((node, index) => normalizeNode(node, index));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = payload.edges.map((edge, index) => normalizeEdge(edge, index, nodeIds));
  return { nodes, edges };
}

function normalizeNode(node, index) {
  if (!node || typeof node !== 'object') {
    throw badRequest(`nodes[${index}] must be an object`);
  }
  const id = String(node.id || '').trim();
  if (!id) {
    throw badRequest(`nodes[${index}].id is required`);
  }
  const data = node.data && typeof node.data === 'object' ? node.data : {};
  return {
    id: id.slice(0, 128),
    type: String(node.type || data.algorithmId || 'unknown').slice(0, 128),
    label: String(data.label || node.label || node.type || id).slice(0, 200),
    params: data.params && typeof data.params === 'object' ? data.params : {},
    position: node.position && typeof node.position === 'object' ? node.position : null,
  };
}

function normalizeEdge(edge, index, nodeIds) {
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
}

function buildTraversalSummary(nodes, edges, focusNodeId) {
  const bySource = new Map();
  for (const edge of edges) {
    bySource.set(edge.source, [...(bySource.get(edge.source) || []), edge.target]);
  }

  const startId = focusNodeId && nodes.some((node) => node.id === focusNodeId) ? focusNodeId : nodes[0].id;
  const visited = new Set();
  const queue = [startId];
  const ordered = [];
  let iterations = 0;

  while (queue.length > 0 && iterations < MAX_ITERATIONS) {
    const nodeId = queue.shift();
    if (visited.has(nodeId)) {
      iterations += 1;
      continue;
    }
    visited.add(nodeId);
    ordered.push(nodeId);
    for (const next of bySource.get(nodeId) || []) {
      if (!visited.has(next)) {
        queue.push(next);
      }
    }
    iterations += 1;
  }

  return {
    startId,
    visitedNodeIds: ordered,
    truncated: queue.length > 0 || nodes.length > ordered.length,
    hasCycle: detectCycle(nodes, edges),
  };
}

function detectCycle(nodes, edges) {
  const bySource = new Map();
  for (const edge of edges) {
    bySource.set(edge.source, [...(bySource.get(edge.source) || []), edge.target]);
  }
  const visiting = new Set();
  const visited = new Set();

  function visit(nodeId) {
    if (visiting.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visiting.add(nodeId);
    for (const next of bySource.get(nodeId) || []) {
      if (visit(next)) return true;
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }

  return nodes.some((node) => visit(node.id));
}

function buildSystemPrompt(securityProfile = 'general', mode = 'evaluate') {
  const profileKey = normalizeSecurityProfile(securityProfile);
  const profile = SECURITY_PROFILES[profileKey];
  const contextBlock = profileKey === 'general'
    ? 'This is a general-purpose ML pipeline evaluation.'
    : `This pipeline has been declared under the "${profile.label}" security profile.
Legal basis: ${profile.legalJustification}.
The following vocabulary is expected and legitimate in this context:
${profile.allowedVocabulary.join(', ')}.
Do not flag these terms as misuse. Evaluate architectural coherence only.`;

  const responseRule = mode === 'evaluate'
    ? `Return ONLY valid JSON with these fields:
coherenceScore, recommendation, weakPoints, strongPoints, loopCompatible, explanation.`
    : 'Return a concise educational explanation in plain language.';

  return `
You are an algorithm architecture evaluator for the VAD (Visual Algorithm Designer) platform.
Your role is to evaluate architectural coherence of pipelines for educational and professional purposes.

${contextBlock}

ABSOLUTE SAFETY RULE: Even within a declared defensive security profile, if the pipeline explicitly describes generating malware, weaponizing exploits for unauthorized use, extracting private data without consent, or bypassing security controls without documented authorization, reject it.

${responseRule}
  `.trim();
}

function detectContextualMisuse(nodes, securityProfile = 'general') {
  const profile = normalizeSecurityProfile(securityProfile);
  const allText = nodes.map((node) => `${node.label} ${node.type} ${JSON.stringify(node.params)}`).join(' ').toLowerCase();
  const absoluteViolations = [
    'generate ransomware',
    'create virus',
    'deploy malware',
    'unauthorized access',
    'steal credentials',
    'exfiltrate data without consent',
  ];

  for (const term of absoluteViolations) {
    if (allText.includes(term)) {
      return { isSuspicious: true, reason: `Pipeline rejected: absolute violation "${term}" detected.` };
    }
  }

  if (profile === 'general' || profile === 'educational') {
    const contextualViolations = ['exploit payload', 'bypass auth', 'shellcode inject'];
    for (const term of contextualViolations) {
      if (allText.includes(term)) {
        return { isSuspicious: true, reason: `Pipeline rejected: "${term}" requires an authorized security profile.` };
      }
    }
  }

  return { isSuspicious: false, reason: '' };
}

function buildExplainPrompt(pipeline, traversal, memories) {
  return [
    `Pipeline: ${JSON.stringify(pipeline)}`,
    `Loop guard: ${JSON.stringify(traversal)}`,
    memories.length ? `Relevant memory: ${JSON.stringify(memories)}` : 'Relevant memory: none',
    'Explain what this pipeline does, why the node order matters, and where the learner should focus next.',
  ].join('\n\n');
}

function buildEvaluatePrompt(pipeline, traversal, memories) {
  return [
    `Pipeline: ${JSON.stringify(pipeline)}`,
    `Loop guard: ${JSON.stringify(traversal)}`,
    memories.length ? `Relevant memory: ${JSON.stringify(memories)}` : 'Relevant memory: none',
    'Return the structured JSON evaluation.',
  ].join('\n\n');
}

function buildFallbackExplanation(pipeline, traversal, memories) {
  const nodeLabels = pipeline.nodes.map((node) => node.label).join(' -> ');
  const memoryHint = memories.length ? ` I also found ${memories.length} related memory item(s) for this session.` : '';
  const loopHint = traversal.hasCycle
    ? ` A loop is present, so analysis was capped at ${MAX_ITERATIONS} iterations to avoid recursive feedback.`
    : '';
  return `This pipeline contains ${pipeline.nodes.length} node(s): ${nodeLabels}. It has ${pipeline.edges.length} connection(s), so data flows through the graph in that order.${loopHint}${memoryHint}`;
}

function buildFallbackEvaluation(pipeline, traversal) {
  const hasDisconnectedNodes = pipeline.nodes.length > 1 && pipeline.edges.length === 0;
  const score = hasDisconnectedNodes ? 68 : traversal.hasCycle ? 82 : Math.min(96, 80 + pipeline.edges.length * 5 + pipeline.nodes.length * 3);
  return {
    coherenceScore: score,
    recommendation: score >= 93 ? 'valid' : score >= 70 ? 'warning' : 'invalid',
    weakPoints: hasDisconnectedNodes ? ['Nodes are not connected into a data flow.'] : [],
    strongPoints: pipeline.edges.length > 0 ? ['Pipeline has an explicit connection structure.'] : ['Pipeline has a clear starting node.'],
    loopCompatible: traversal.hasCycle,
    explanation: `The pipeline scores ${score}/100 based on node connectivity, graph structure, and loop compatibility.`,
  };
}

function parseEvaluation(text) {
  if (!text) return null;
  const parsed = safeParseJson(text);
  if (!parsed || typeof parsed !== 'object') return null;
  const score = Number(parsed.coherenceScore);
  if (!Number.isInteger(score) || score < 0 || score > 100) return null;
  const recommendation = ['valid', 'warning', 'invalid'].includes(parsed.recommendation)
    ? parsed.recommendation
    : score >= 93 ? 'valid' : score >= 70 ? 'warning' : 'invalid';
  return {
    coherenceScore: score,
    recommendation,
    weakPoints: Array.isArray(parsed.weakPoints) ? parsed.weakPoints.slice(0, 3).map(String) : [],
    strongPoints: Array.isArray(parsed.strongPoints) ? parsed.strongPoints.slice(0, 3).map(String) : [],
    loopCompatible: Boolean(parsed.loopCompatible),
    explanation: String(parsed.explanation || '').slice(0, 2000) || `Score: ${score}`,
  };
}

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (_error) {
    const match = String(text).match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch (__error) {
      return null;
    }
  }
}

function summarizePipeline(pipeline) {
  return `${pipeline.nodes.length} node(s), ${pipeline.edges.length} edge(s)`;
}

function hashJson(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function normalizeSecurityProfile(securityProfile) {
  const key = String(securityProfile || 'general').toLowerCase();
  return SECURITY_PROFILES[key] ? key : 'general';
}

function badRequest(message) {
  return Object.assign(new Error(message), { status: 400, code: 'BAD_REQUEST' });
}

module.exports = {
  AIPipelineService,
  MAX_ITERATIONS,
  SECURITY_PROFILES,
  buildSystemPrompt,
  detectContextualMisuse,
  validatePipelinePayload,
};
