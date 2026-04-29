-- ============================================================
-- VAD ML Jobs — H2O thin-slice durable metadata
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS ml_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'canceled')),
    execution_mode TEXT NOT NULL CHECK (execution_mode IN ('h2o', 'fallback')),
    compatibility JSONB NOT NULL DEFAULT '{}',
    request JSONB NOT NULL DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    error TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ml_jobs_user_created
    ON ml_jobs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ml_jobs_status_updated
    ON ml_jobs(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS ml_job_artifacts (
    job_id UUID PRIMARY KEY REFERENCES ml_jobs(id) ON DELETE CASCADE,
    leaderboard JSONB DEFAULT '[]',
    metrics JSONB DEFAULT '{}',
    memory_template JSONB DEFAULT '{}',
    mojo_available BOOLEAN DEFAULT false,
    runtime JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ml_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_job_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ml jobs" ON ml_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ml jobs" ON ml_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ml jobs" ON ml_jobs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own ml artifacts" ON ml_job_artifacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ml_jobs
            WHERE ml_jobs.id = ml_job_artifacts.job_id
              AND ml_jobs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own ml artifacts" ON ml_job_artifacts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ml_jobs
            WHERE ml_jobs.id = ml_job_artifacts.job_id
              AND ml_jobs.user_id = auth.uid()
        )
    );
