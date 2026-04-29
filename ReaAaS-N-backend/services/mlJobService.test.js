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
const os = require('os');
const path = require('path');

const { compileCanvas } = require('./mlJobCompiler');
const { SQLiteMLJobRepository } = require('./sqliteMLJobRepository');
const { MLJobService } = require('./mlJobService');
const { H2OLocalRuntime } = require('./h2oLocalRuntime');

test('compileCanvas marks known H2O nodes as compatible', () => {
  const compiled = compileCanvas({
    nodes: [
      { id: 'n1', data: { algorithmId: 'gbm', label: 'GBM' } },
      { id: 'n2', data: { algorithmId: 'automl', label: 'AutoML' } },
    ],
    edges: [{ source: 'n1', target: 'n2' }],
  });

  assert.strictEqual(compiled.compatibility.status, 'h2o_compatible');
  assert.deepStrictEqual(compiled.compatibility.h2oAlgorithms, ['gbm', 'automl']);
  assert.strictEqual(compiled.compatibility.mojoAvailable, true);
});

test('compileCanvas marks arbitrary nodes as memory_only', () => {
  const compiled = compileCanvas({
    nodes: [{ id: 'n1', type: 'customCode', label: 'Custom DIY step' }],
    edges: [],
  });

  assert.strictEqual(compiled.compatibility.status, 'memory_only');
  assert.deepStrictEqual(compiled.compatibility.h2oAlgorithms, []);
  assert.deepStrictEqual(compiled.compatibility.unsupportedNodeIds, ['n1']);
});

test('SQLiteMLJobRepository persists jobs and artifacts', () => {
  const repo = new SQLiteMLJobRepository(tempDbPath('ml-jobs-repo'));
  const job = repo.createJob({
    status: 'queued',
    executionMode: 'fallback',
    compatibility: { status: 'memory_only' },
    request: { nodes: [] },
  });

  const updated = repo.updateJob(job.id, {
    status: 'succeeded',
    metrics: { nodeCount: 1 },
    completedAt: Date.now(),
  });
  repo.saveArtifacts(job.id, { mojoAvailable: false, metrics: { nodeCount: 1 } });

  assert.strictEqual(updated.status, 'succeeded');
  assert.strictEqual(repo.getJob(job.id).metrics.nodeCount, 1);
  assert.strictEqual(repo.getArtifacts(job.id).mojoAvailable, false);
});

test('MLJobService falls back when H2O is disabled', async () => {
  const repo = new SQLiteMLJobRepository(tempDbPath('ml-jobs-disabled'));
  const runtime = new H2OLocalRuntime({ enabled: false });
  const service = new MLJobService({ repository: repo, runtime });

  const created = await service.createJob({
    mode: 'h2o',
    nodes: [{ id: 'n1', data: { algorithmId: 'gbm', label: 'GBM' } }],
    edges: [],
  }, { sessionId: 'test-session' });

  const job = service.getJob(created.jobId);
  const artifacts = service.getArtifacts(created.jobId);

  assert.strictEqual(created.executionMode, 'fallback');
  assert.strictEqual(job.status, 'succeeded');
  assert.match(job.message, /H2O is disabled/);
  assert.strictEqual(artifacts.mojoAvailable, false);
  assert.strictEqual(artifacts.metrics.runtimeReady, false);
});

test('MLJobService falls back when Java is not 17', async () => {
  const repo = new SQLiteMLJobRepository(tempDbPath('ml-jobs-java'));
  const runtime = {
    ensureStarted: async () => ({
      ok: false,
      reason: 'Java 17 is required for stable H2O mode; found Java 21.',
      javaVersion: 'openjdk version "21.0.9"',
    }),
  };
  const service = new MLJobService({ repository: repo, runtime });

  const created = await service.createJob({
    nodes: [{ id: 'n1', data: { algorithmId: 'automl', label: 'AutoML' } }],
    edges: [],
  });

  assert.strictEqual(created.executionMode, 'fallback');
  assert.match(service.getJob(created.jobId).message, /Java 17 is required/);
});

test('MLJobService falls back when H2O jar is missing', async () => {
  const repo = new SQLiteMLJobRepository(tempDbPath('ml-jobs-jar'));
  const runtime = new H2OLocalRuntime({
    enabled: true,
    jarPath: path.join(os.tmpdir(), 'missing-h2o.jar'),
    javaPath: 'java',
  });
  const service = new MLJobService({ repository: repo, runtime });

  const created = await service.createJob({
    nodes: [{ id: 'n1', data: { algorithmId: 'drf', label: 'DRF' } }],
    edges: [],
  });

  assert.strictEqual(created.executionMode, 'fallback');
  assert.match(service.getJob(created.jobId).message, /H2O_JAR_PATH/);
});

function tempDbPath(name) {
  return path.join(os.tmpdir(), `vad-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`);
}
