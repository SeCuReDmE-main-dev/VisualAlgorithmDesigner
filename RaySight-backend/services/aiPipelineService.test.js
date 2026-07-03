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

const aiPipelineService = require('./aiPipelineService');
const AIPipelineService = aiPipelineService.AIPipelineService;
const safeParseJson = aiPipelineService.__private ? aiPipelineService.__private.safeParseJson : aiPipelineService.safeParseJson;

test('callSchoolModelRuntime returns null when the injected runtime throws an error', async () => {
  const mockRuntime = {
    complete: async () => {
      throw new Error('School model runtime error');
    }
  };
  const service = new AIPipelineService({ schoolModelRuntime: mockRuntime });
  const messages = [{ role: 'user', content: 'test message' }];

  const result = await service.callSchoolModelRuntime(messages);

  assert.strictEqual(result, null, 'callSchoolModelRuntime should return null on error');
});

test('callSchoolModelRuntime returns null when no runtime is provided', async () => {
  const service = new AIPipelineService({ schoolModelRuntime: null });
  const messages = [{ role: 'user', content: 'test message' }];

  assert.strictEqual(service.schoolModelRuntime, null, 'schoolModelRuntime should stay null without an injected runtime');

  const result = await service.callSchoolModelRuntime(messages);

  assert.strictEqual(result, null, 'callSchoolModelRuntime should return null when no runtime is present');
});

test('callSchoolModelRuntime returns content when the injected runtime succeeds', async () => {
  const mockRuntime = {
    complete: async () => '  Mocked response  '
  };
  const service = new AIPipelineService({ schoolModelRuntime: mockRuntime });
  const messages = [{ role: 'user', content: 'test message' }];

  const result = await service.callSchoolModelRuntime(messages);

  assert.strictEqual(result, 'Mocked response', 'callSchoolModelRuntime should return trimmed content');
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
  assert.strictEqual(safeParseJson('prefix [1, 2] suffix'), null); // Fails with current implementation

  // 5. null, undefined, '' (empty string)
  assert.strictEqual(safeParseJson(''), null);
  assert.strictEqual(safeParseJson(null), null);
  assert.strictEqual(safeParseJson(undefined), null);

  // 6. Valid JSON primitives (documents permissive behavior)
  assert.strictEqual(safeParseJson('42'), 42);
  assert.strictEqual(safeParseJson('"hello"'), 'hello');
  assert.strictEqual(safeParseJson('true'), true);
});
