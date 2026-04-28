let test;
try {
  ({ test } = require('node:test'));
} catch (error) {
  test = function(name, fn) {
    Promise.resolve()
      .then(fn)
      .catch((err) => {
        process.exitCode = 1;
        console.error('Test failed:', name);
        console.error(err);
      });
  };
}
const assert = require('assert');

const {
  MemoryRepository,
  normalizeSessionId,
  normalizeMemory,
  normalizeFeedback,
} = require('./memoryRepository');

// MemoryRepository tests
test('MemoryRepository methods throw not implemented error', () => {
  const repo = new MemoryRepository();
  assert.throws(() => repo.addMemory('session', {}), /MemoryRepository\.addMemory must be implemented/);
  assert.throws(() => repo.search('session', 'query'), /MemoryRepository\.search must be implemented/);
  assert.throws(() => repo.addFeedback({}), /MemoryRepository\.addFeedback must be implemented/);
});

// normalizeSessionId tests
test('normalizeSessionId returns "anonymous" for non-strings or empty strings', () => {
  assert.strictEqual(normalizeSessionId(), 'anonymous');
  assert.strictEqual(normalizeSessionId(null), 'anonymous');
  assert.strictEqual(normalizeSessionId(123), 'anonymous');
  assert.strictEqual(normalizeSessionId(''), 'anonymous');
  assert.strictEqual(normalizeSessionId('   '), 'anonymous');
});

test('normalizeSessionId trims whitespace and limits length to 128', () => {
  assert.strictEqual(normalizeSessionId('  my-session-id  '), 'my-session-id');
  const longString = 'a'.repeat(200);
  assert.strictEqual(normalizeSessionId(longString), 'a'.repeat(128));
});

// normalizeMemory tests
test('normalizeMemory throws error if content is missing or empty', () => {
  const checkError = (err) => {
    assert.strictEqual(err.message, 'Memory content is required');
    assert.strictEqual(err.status, 400);
    assert.strictEqual(err.code, 'BAD_REQUEST');
    return true;
  };

  assert.throws(() => normalizeMemory(), checkError);
  assert.throws(() => normalizeMemory({}), checkError);
  assert.throws(() => normalizeMemory({ content: '   ' }), checkError);
});

test('normalizeMemory normalizes valid input', () => {
  const input = {
    content: '  my content  ',
    category: 'custom-category',
    metadata: { key: 'value' },
  };
  const expected = {
    content: 'my content',
    category: 'custom-category',
    metadata: { key: 'value' },
  };
  assert.deepStrictEqual(normalizeMemory(input), expected);
});

test('normalizeMemory applies defaults and truncation', () => {
  const longContent = 'a'.repeat(5000);
  const longCategory = 'b'.repeat(100);
  const input = {
    content: longContent,
    category: longCategory,
    metadata: 'not-an-object',
  };
  const expected = {
    content: 'a'.repeat(4000),
    category: 'b'.repeat(64),
    metadata: {},
  };
  assert.deepStrictEqual(normalizeMemory(input), expected);
});

test('normalizeMemory uses "general" as default category', () => {
  const result = normalizeMemory({ content: 'content' });
  assert.strictEqual(result.category, 'general');
});

// normalizeFeedback tests
test('normalizeFeedback throws error for invalid feedback values', () => {
  const checkError = (err) => {
    assert.strictEqual(err.message, 'Feedback must be positive or negative');
    assert.strictEqual(err.status, 400);
    assert.strictEqual(err.code, 'BAD_REQUEST');
    return true;
  };

  assert.throws(() => normalizeFeedback(), checkError);
  assert.throws(() => normalizeFeedback({ feedback: 'neutral' }), checkError);
  assert.throws(() => normalizeFeedback({ value: 'neutral' }), checkError);
});

test('normalizeFeedback accepts positive and negative feedback, checking feedback or value property', () => {
  const pos1 = normalizeFeedback({ feedback: 'positive' });
  assert.strictEqual(pos1.feedback, 'positive');

  const pos2 = normalizeFeedback({ value: 'POSITIVE' });
  assert.strictEqual(pos2.feedback, 'positive');

  const neg = normalizeFeedback({ feedback: 'Negative' });
  assert.strictEqual(neg.feedback, 'negative');
});

test('normalizeFeedback normalizes other fields with defaults and truncation', () => {
  const input = {
    feedback: 'positive',
    sessionId: ' my-session ',
    explanationId: 'e'.repeat(200),
    promptHash: 'p'.repeat(200),
    comment: '  my comment' + 'c'.repeat(2000),
    pipeline: { version: 1 },
  };
  const expected = {
    sessionId: 'my-session',
    feedback: 'positive',
    explanationId: 'e'.repeat(128),
    promptHash: 'p'.repeat(128),
    comment: ('my comment' + 'c'.repeat(2000)).slice(0, 1000),
    pipeline: { version: 1 },
  };
  assert.deepStrictEqual(normalizeFeedback(input), expected);
});

test('normalizeFeedback uses default nulls for optional fields', () => {
  const result = normalizeFeedback({ feedback: 'positive' });
  assert.strictEqual(result.sessionId, 'anonymous');
  assert.strictEqual(result.explanationId, null);
  assert.strictEqual(result.promptHash, null);
  assert.strictEqual(result.comment, null);
  assert.strictEqual(result.pipeline, null);
});
