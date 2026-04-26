const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const MiniSearch = require('minisearch');
const {
  MemoryRepository,
  normalizeFeedback,
  normalizeMemory,
  normalizeSessionId,
} = require('./memoryRepository');

class SQLiteMemoryRepository extends MemoryRepository {
  constructor(dbPath) {
    super();
    this.dbPath = path.resolve(dbPath || './data/memory.sqlite');
    fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.prepareSchema();
    this.searchIndex = new MiniSearch({
      fields: ['content', 'category'],
      storeFields: ['id', 'sessionId', 'content', 'category', 'createdAt', 'metadata'],
      searchOptions: { boost: { content: 2 }, fuzzy: 0.2, prefix: true },
    });
    this.rebuildIndex();
  }

  prepareSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        metadata_json TEXT NOT NULL DEFAULT '{}',
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_memories_session_created
        ON memories(session_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        feedback TEXT NOT NULL CHECK (feedback IN ('positive', 'negative')),
        explanation_id TEXT,
        prompt_hash TEXT,
        comment TEXT,
        pipeline_json TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_feedback_session_created
        ON feedback(session_id, created_at DESC);
    `);
  }

  rebuildIndex() {
    const rows = this.db.prepare(`
      SELECT id, session_id AS sessionId, content, category, metadata_json AS metadataJson, created_at AS createdAt
      FROM memories
      ORDER BY created_at DESC
      LIMIT 2000
    `).all();

    this.searchIndex.removeAll();
    this.searchIndex.addAll(rows.map((row) => ({
      id: String(row.id),
      sessionId: row.sessionId,
      content: row.content,
      category: row.category,
      createdAt: row.createdAt,
      metadata: safeJson(row.metadataJson, {}),
    })));
  }

  addMemory(sessionId, memory) {
    const safeSessionId = normalizeSessionId(sessionId);
    const safeMemory = normalizeMemory(memory);
    const createdAt = Date.now();

    const result = this.db.prepare(`
      INSERT INTO memories (session_id, content, category, metadata_json, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      safeSessionId,
      safeMemory.content,
      safeMemory.category,
      JSON.stringify(safeMemory.metadata),
      createdAt,
    );

    const indexed = {
      id: String(result.lastInsertRowid),
      sessionId: safeSessionId,
      content: safeMemory.content,
      category: safeMemory.category,
      metadata: safeMemory.metadata,
      createdAt,
    };
    this.searchIndex.add(indexed);
    return indexed;
  }

  search(sessionId, query, topK = 5) {
    const safeSessionId = normalizeSessionId(sessionId);
    const text = String(query || '').trim();
    if (!text) {
      return [];
    }

    return this.searchIndex.search(text, { combineWith: 'AND' })
      .filter((result) => result.sessionId === safeSessionId || result.sessionId === 'anonymous')
      .slice(0, Math.max(1, Math.min(Number(topK) || 5, 10)))
      .map((result) => ({
        id: result.id,
        content: result.content,
        category: result.category,
        metadata: result.metadata,
        createdAt: result.createdAt,
        score: result.score,
      }));
  }

  addFeedback(payload) {
    const feedback = normalizeFeedback(payload);
    const createdAt = Date.now();
    const result = this.db.prepare(`
      INSERT INTO feedback (
        session_id, feedback, explanation_id, prompt_hash, comment, pipeline_json, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      feedback.sessionId,
      feedback.feedback,
      feedback.explanationId,
      feedback.promptHash,
      feedback.comment,
      feedback.pipeline ? JSON.stringify(feedback.pipeline) : null,
      createdAt,
    );

    const memoryContent = [
      `User feedback: ${feedback.feedback}`,
      feedback.comment ? `Comment: ${feedback.comment}` : '',
      feedback.pipeline ? `Pipeline: ${summarizePipeline(feedback.pipeline)}` : '',
    ].filter(Boolean).join('\n');

    this.addMemory(feedback.sessionId, {
      content: memoryContent,
      category: 'feedback',
      metadata: {
        feedbackId: Number(result.lastInsertRowid),
        feedback: feedback.feedback,
        explanationId: feedback.explanationId,
        promptHash: feedback.promptHash,
      },
    });

    return {
      id: Number(result.lastInsertRowid),
      createdAt,
      feedback: feedback.feedback,
    };
  }
}

function safeJson(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function summarizePipeline(pipeline) {
  const nodes = Array.isArray(pipeline.nodes) ? pipeline.nodes.length : 0;
  const edges = Array.isArray(pipeline.edges) ? pipeline.edges.length : 0;
  return `${nodes} node(s), ${edges} edge(s)`;
}

module.exports = {
  SQLiteMemoryRepository,
};
