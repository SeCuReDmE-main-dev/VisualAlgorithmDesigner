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

try {
  Module.prototype.require = function(path) {
    if (path === 'groq-sdk') {
      return class { constructor() {} };
    }
    return originalRequire.apply(this, arguments);
  };

  ({ AIPipelineService } = require('./aiPipelineService'));
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

test('explainPipeline falls back to general profile when requesting elevated profile without authorization', async () => {
  const originalApiKey = process.env.ELEVATED_PROFILE_API_KEY;
  process.env.ELEVATED_PROFILE_API_KEY = 'secret-key';
  try {
    const service = new AIPipelineService();
    // Prevent actual API call, just let it use fallback explanation
    service.callGroq = async () => 'mock explain';

    const payload = {
      nodes: [{ id: 'n1', type: 'test' }],
      edges: [],
      securityProfile: 'security',
    };

    const result = await service.explainPipeline(payload, { authorization: null });

    assert.strictEqual(result.securityProfile, 'general', 'Should fall back to general profile without authorization');
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.ELEVATED_PROFILE_API_KEY;
    } else {
      process.env.ELEVATED_PROFILE_API_KEY = originalApiKey;
    }
  }
});

test('explainPipeline allows elevated profile with correct API key', async () => {
  const originalApiKey = process.env.ELEVATED_PROFILE_API_KEY;
  process.env.ELEVATED_PROFILE_API_KEY = 'secret-key';
  try {
    const service = new AIPipelineService();
    // Prevent actual API call, just let it use fallback explanation
    service.callGroq = async () => 'mock explain';

    const payload = {
      nodes: [{ id: 'n1', type: 'test' }],
      edges: [],
      securityProfile: 'security',
    };

    const result = await service.explainPipeline(payload, { authorization: 'Bearer secret-key' });

    assert.strictEqual(result.securityProfile, 'security', 'Should allow elevated profile with valid authorization');
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.ELEVATED_PROFILE_API_KEY;
    } else {
      process.env.ELEVATED_PROFILE_API_KEY = originalApiKey;
    }
  }
});

test('evaluatePipeline falls back to general profile when requesting elevated profile without API key', async () => {
  const originalApiKey = process.env.ELEVATED_PROFILE_API_KEY;
  process.env.ELEVATED_PROFILE_API_KEY = 'secret-key';
  try {
    const service = new AIPipelineService();
    // Prevent actual API call
    service.callGroq = async () => JSON.stringify({
      coherenceScore: 90,
      recommendation: 'valid',
      weakPoints: [],
      strongPoints: [],
      loopCompatible: false,
      explanation: 'test'
    });

    const payload = {
      nodes: [{ id: 'n1', type: 'test' }],
      edges: [],
      securityProfile: 'integrity',
    };

    const result = await service.evaluatePipeline(payload, { authorization: 'Bearer wrong-key' });

    assert.strictEqual(result.securityProfile, 'general', 'Should fall back to general profile with wrong authorization key');
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.ELEVATED_PROFILE_API_KEY;
    } else {
      process.env.ELEVATED_PROFILE_API_KEY = originalApiKey;
    }
  }
});

test('explainPipeline allows educational profile without API key', async () => {
  const originalApiKey = process.env.ELEVATED_PROFILE_API_KEY;
  process.env.ELEVATED_PROFILE_API_KEY = 'secret-key';
  try {
    const service = new AIPipelineService();
    // Prevent actual API call
    service.callGroq = async () => 'mock explain';

    const payload = {
      nodes: [{ id: 'n1', type: 'test' }],
      edges: [],
      securityProfile: 'educational',
    };

    const result = await service.explainPipeline(payload, { authorization: null });

    assert.strictEqual(result.securityProfile, 'educational', 'Should allow educational profile without authorization');
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.ELEVATED_PROFILE_API_KEY;
    } else {
      process.env.ELEVATED_PROFILE_API_KEY = originalApiKey;
    }
  }
});
