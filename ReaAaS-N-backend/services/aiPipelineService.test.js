const { test } = require('node:test');
const assert = require('node:assert');

// Mock require before loading the module
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(path) {
  if (path === 'groq-sdk') {
    return class { constructor() {} };
  }
  return originalRequire.apply(this, arguments);
};

const { AIPipelineService } = require('./aiPipelineService');

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
