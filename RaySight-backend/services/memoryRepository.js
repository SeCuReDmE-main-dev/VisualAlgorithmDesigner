class MemoryRepository {
  addMemory(_sessionId, _memory) {
    throw new Error('MemoryRepository.addMemory must be implemented');
  }

  search(_sessionId, _query, _topK = 5) {
    throw new Error('MemoryRepository.search must be implemented');
  }

  addFeedback(_feedback) {
    throw new Error('MemoryRepository.addFeedback must be implemented');
  }
}

const FEEDBACK_VALUES = new Set(['positive', 'negative']);

function normalizeSessionId(sessionId) {
  if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
    return 'anonymous';
  }
  return sessionId.trim().slice(0, 128);
}

function normalizeMemory(memory) {
  const content = String(memory?.content || '').trim();
  if (!content) {
    throw Object.assign(new Error('Memory content is required'), { status: 400, code: 'BAD_REQUEST' });
  }

  return {
    content: content.slice(0, 4000),
    category: String(memory?.category || 'general').slice(0, 64),
    metadata: memory?.metadata && typeof memory.metadata === 'object' ? memory.metadata : {},
  };
}

function normalizeFeedback(payload) {
  const value = String(payload?.feedback || payload?.value || '').toLowerCase();
  if (!FEEDBACK_VALUES.has(value)) {
    throw Object.assign(new Error('Feedback must be positive or negative'), { status: 400, code: 'BAD_REQUEST' });
  }

  return {
    sessionId: normalizeSessionId(payload?.sessionId),
    feedback: value,
    explanationId: String(payload?.explanationId || '').slice(0, 128) || null,
    promptHash: String(payload?.promptHash || '').slice(0, 128) || null,
    comment: String(payload?.comment || '').trim().slice(0, 1000) || null,
    pipeline: payload?.pipeline && typeof payload.pipeline === 'object' ? payload.pipeline : null,
  };
}

module.exports = {
  MemoryRepository,
  normalizeFeedback,
  normalizeMemory,
  normalizeSessionId,
};
