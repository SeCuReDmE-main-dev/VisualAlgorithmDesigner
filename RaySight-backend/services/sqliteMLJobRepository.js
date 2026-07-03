const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const { MLJobRepository, normalizeJobId } = require('./mlJobRepository');

class SQLiteMLJobRepository extends MLJobRepository {
  constructor(dbPath) {
    super();
    this.dbPath = path.resolve(dbPath || './data/ml-jobs.sqlite');
    fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.prepareSchema();
  }

  prepareSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ml_jobs (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        execution_mode TEXT NOT NULL,
        compatibility_json TEXT NOT NULL,
        request_json TEXT NOT NULL,
        metrics_json TEXT,
        error TEXT,
        message TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        completed_at INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_ml_jobs_status_updated
        ON ml_jobs(status, updated_at DESC);

      CREATE TABLE IF NOT EXISTS ml_job_artifacts (
        job_id TEXT PRIMARY KEY,
        artifacts_json TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (job_id) REFERENCES ml_jobs(id) ON DELETE CASCADE
      );
    `);
  }

  createJob(job) {
    const now = Date.now();
    const id = job.id || crypto.randomUUID();
    const record = {
      id,
      status: job.status || 'queued',
      executionMode: job.executionMode || 'fallback',
      compatibility: job.compatibility || {},
      request: job.request || {},
      metrics: job.metrics || null,
      error: job.error || null,
      message: job.message || null,
      createdAt: now,
      updatedAt: now,
      completedAt: job.completedAt || null,
    };

    this.db.prepare(`
      INSERT INTO ml_jobs (
        id, status, execution_mode, compatibility_json, request_json,
        metrics_json, error, message, created_at, updated_at, completed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      record.id,
      record.status,
      record.executionMode,
      JSON.stringify(record.compatibility),
      JSON.stringify(record.request),
      record.metrics ? JSON.stringify(record.metrics) : null,
      record.error,
      record.message,
      record.createdAt,
      record.updatedAt,
      record.completedAt,
    );

    return record;
  }

  updateJob(jobId, patch) {
    const id = normalizeJobId(jobId);
    const current = this.getJob(id);
    if (!current) {
      return null;
    }

    const updated = {
      ...current,
      ...patch,
      updatedAt: Date.now(),
    };

    this.db.prepare(`
      UPDATE ml_jobs
      SET status = ?,
          execution_mode = ?,
          compatibility_json = ?,
          request_json = ?,
          metrics_json = ?,
          error = ?,
          message = ?,
          updated_at = ?,
          completed_at = ?
      WHERE id = ?
    `).run(
      updated.status,
      updated.executionMode,
      JSON.stringify(updated.compatibility || {}),
      JSON.stringify(updated.request || {}),
      updated.metrics ? JSON.stringify(updated.metrics) : null,
      updated.error || null,
      updated.message || null,
      updated.updatedAt,
      updated.completedAt || null,
      id,
    );

    return this.getJob(id);
  }

  getJob(jobId) {
    const id = normalizeJobId(jobId);
    const row = this.db.prepare(`
      SELECT id, status, execution_mode AS executionMode, compatibility_json AS compatibilityJson,
             request_json AS requestJson, metrics_json AS metricsJson, error, message,
             created_at AS createdAt, updated_at AS updatedAt, completed_at AS completedAt
      FROM ml_jobs
      WHERE id = ?
    `).get(id);

    return row ? mapJob(row) : null;
  }

  saveArtifacts(jobId, artifacts) {
    const id = normalizeJobId(jobId);
    const createdAt = Date.now();
    this.db.prepare(`
      INSERT INTO ml_job_artifacts (job_id, artifacts_json, created_at)
      VALUES (?, ?, ?)
      ON CONFLICT(job_id) DO UPDATE SET
        artifacts_json = excluded.artifacts_json,
        created_at = excluded.created_at
    `).run(id, JSON.stringify(artifacts || {}), createdAt);
    return { jobId: id, ...artifacts, createdAt };
  }

  getArtifacts(jobId) {
    const id = normalizeJobId(jobId);
    const row = this.db.prepare(`
      SELECT job_id AS jobId, artifacts_json AS artifactsJson, created_at AS createdAt
      FROM ml_job_artifacts
      WHERE job_id = ?
    `).get(id);

    if (!row) {
      return null;
    }

    return {
      jobId: row.jobId,
      ...safeJson(row.artifactsJson, {}),
      createdAt: row.createdAt,
    };
  }
}

function mapJob(row) {
  return {
    id: row.id,
    status: row.status,
    executionMode: row.executionMode,
    compatibility: safeJson(row.compatibilityJson, {}),
    request: safeJson(row.requestJson, {}),
    metrics: safeJson(row.metricsJson, null),
    error: row.error || null,
    message: row.message || null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    completedAt: row.completedAt || null,
  };
}

function safeJson(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

module.exports = {
  SQLiteMLJobRepository,
};
