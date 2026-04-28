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

// Mock require only while loading the module under test
const Module = require('module');
const originalRequire = Module.prototype.require;
let AIPipelineService;
let safeParseJson;

try {
  Module.prototype.require = function(path) {
    if (path === 'groq-sdk') {
      return class { constructor() {} };
    }
    return originalRequire.apply(this, arguments);
  };

  ({ AIPipelineService, safeParseJson } = require('./aiPipelineService'));
} finally {
  Module.prototype.require = originalRequire;
}
test('callGroq returns null when groqClient.chat.completions.create throws an error', async () => {
  // Arrange
  const mockGroqClient = {
    chat: {
      completions: {
        create: async () => {
          throw new Error('Groq API error');
        }
      }
    }
  };
  const service = new AIPipelineService({ groqClient: mockGroqClient });
  const messages = [{ role: 'user', content: 'test message' }];

  // Act
  const result = await service.callGroq(messages);

  // Assert
  assert.strictEqual(result, null, 'callGroq should return null on error');
});

test('callGroq returns null when groqClient is not provided', async () => {
  const originalGroqApiKey = process.env.GROQ_API_KEY;
  const originalGroqModel = process.env.GROQ_MODEL;

  delete process.env.GROQ_API_KEY;
  delete process.env.GROQ_MODEL;

  try {
    // Arrange
    const service = new AIPipelineService({ groqClient: null });
    const messages = [{ role: 'user', content: 'test message' }];

    assert.strictEqual(service.groqClient, null, 'groqClient should be null when no client and no Groq env vars are provided');

    // Act
    const result = await service.callGroq(messages);

    // Assert
    assert.strictEqual(result, null, 'callGroq should return null when no groqClient is present');
  } finally {
    if (originalGroqApiKey === undefined) {
      delete process.env.GROQ_API_KEY;
    } else {
      process.env.GROQ_API_KEY = originalGroqApiKey;
    }

    if (originalGroqModel === undefined) {
      delete process.env.GROQ_MODEL;
    } else {
      process.env.GROQ_MODEL = originalGroqModel;
    }
  }
});

test('callGroq returns content when groqClient succeeds', async () => {
  // Arrange
  const mockGroqClient = {
    chat: {
      completions: {
        create: async () => {
          return {
            choices: [
              {
                message: {
                  content: '  Mocked response  '
                }
              }
            ]
          };
        }
      }
    }
  };
  const service = new AIPipelineService({ groqClient: mockGroqClient });
  const messages = [{ role: 'user', content: 'test message' }];

  // Act
  const result = await service.callGroq(messages);

  // Assert
  assert.strictEqual(result, 'Mocked response', 'callGroq should return trimmed content');
});

test('safeParseJson edge cases', () => {
  // 1. Clean JSON
  assert.deepStrictEqual(safeParseJson('{"a":1}'), { a: 1 });

  // 2. Mixed content / regex extract
  assert.deepStrictEqual(safeParseJson('prefix {"a":1} suffix'), { a: 1 });
  assert.deepStrictEqual(safeParseJson('  \n {\n"b": 2\n} \n '), { b: 2 });

  // 3. Regex match but invalid JSON (second parse fails)
  assert.strictEqual(safeParseJson('prefix {a: 1,}'), null);

  // 4. No braces at all
  assert.strictEqual(safeParseJson('no braces at all'), null);
  assert.deepStrictEqual(safeParseJson('[]'), []); // Empty array is valid JSON

  // 5. null, undefined, '' (empty string)
  assert.strictEqual(safeParseJson(''), null);
  assert.strictEqual(safeParseJson(null), null);
  assert.strictEqual(safeParseJson(undefined), null);

  // 6. Valid JSON primitives (documents permissive behavior)
  assert.strictEqual(safeParseJson('42'), 42);
  assert.strictEqual(safeParseJson('"hello"'), 'hello');
  assert.strictEqual(safeParseJson('true'), true);
});
