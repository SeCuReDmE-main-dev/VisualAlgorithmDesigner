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
const http = require('http');
const os = require('os');
const path = require('path');

test('ML jobs API creates, reads, cancels, and returns artifacts in fallback mode', async () => {
  process.env.NODE_ENV = 'test';
  process.env.SESSION_SECRET = 'test-secret';
  process.env.H2O_ENABLED = 'false';
  process.env.DB_PATH = tempDbPath('api-memory');
  process.env.ML_JOB_DB_PATH = tempDbPath('api-ml-jobs');
  process.env.GROQ_API_KEY = '';

  const { app } = require('../server');
  const server = http.createServer(app);
  await listen(server);
  const { port } = server.address();

  try {
    const createResponse = await fetch(`http://127.0.0.1:${port}/api/ml/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'fallback',
        nodes: [{ id: 'n1', data: { algorithmId: 'gbm', label: 'GBM' } }],
        edges: [],
      }),
    });
    const created = await createResponse.json();

    assert.strictEqual(createResponse.status, 201);
    assert.strictEqual(created.status, 'success');
    assert.match(created.data.jobId, /^[a-f0-9-]{36}$/i);

    const jobResponse = await fetch(`http://127.0.0.1:${port}/api/ml/jobs/${created.data.jobId}`);
    const job = await jobResponse.json();
    assert.strictEqual(job.data.status, 'succeeded');
    assert.strictEqual(job.data.executionMode, 'fallback');

    const cancelResponse = await fetch(`http://127.0.0.1:${port}/api/ml/jobs/${created.data.jobId}/cancel`, {
      method: 'POST',
    });
    const canceled = await cancelResponse.json();
    assert.strictEqual(canceled.data.status, 'succeeded');

    const artifactsResponse = await fetch(`http://127.0.0.1:${port}/api/ml/jobs/${created.data.jobId}/artifacts`);
    const artifacts = await artifactsResponse.json();
    assert.strictEqual(artifacts.data.mojoAvailable, false);
    assert.ok(Array.isArray(artifacts.data.leaderboard));
    assert.ok(artifacts.data.memoryTemplate.content.includes(created.data.jobId));
  } finally {
    await close(server);
  }
});

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

function tempDbPath(name) {
  return path.join(os.tmpdir(), `vad-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`);
}
