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
  // Arrange
  const service = new AIPipelineService({ groqClient: null });
  const messages = [{ role: 'user', content: 'test message' }];

  // Act
  const result = await service.callGroq(messages);

  // Assert
  assert.strictEqual(result, null, 'callGroq should return null when no groqClient is present');
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
