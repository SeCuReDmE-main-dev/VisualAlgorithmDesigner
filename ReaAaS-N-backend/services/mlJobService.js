const { compileCanvas } = require('./mlJobCompiler');
const { normalizeJobId } = require('./mlJobRepository');

const TERMINAL_STATUSES = new Set(['succeeded', 'failed', 'canceled']);

class MLJobService {
  constructor({ repository, runtime, memoryRepository } = {}) {
    if (!repository) {
      throw new Error('MLJobService requires a repository');
    }
    this.repository = repository;
    this.runtime = runtime;
    this.memoryRepository = memoryRepository;
  }

  async createJob(payload, requestContext = {}) {
    const compiled = compileCanvas(payload);
    const initialMode = compiled.requestedMode === 'fallback' ? 'fallback' : 'h2o';
    const job = this.repository.createJob({
      status: 'queued',
      executionMode: initialMode,
      compatibility: compiled.compatibility,
      request: {
        nodes: compiled.nodes,
        edges: compiled.edges,
        securityProfile: payload.securityProfile || null,
        executionPlan: compiled.executionPlan,
      },
      message: 'ML job accepted.',
    });

    const completed = await this.runThinSlice(job, compiled, requestContext);
    return summarizeJob(completed);
  }

  getJob(jobId) {
    const job = this.repository.getJob(normalizeJobId(jobId));
    if (!job) {
      throw notFound('ML job not found');
    }
    return job;
  }

  cancelJob(jobId) {
    const job = this.getJob(jobId);
    if (TERMINAL_STATUSES.has(job.status)) {
      return job;
    }
    return this.repository.updateJob(job.id, {
      status: 'canceled',
      completedAt: Date.now(),
      message: 'ML job canceled.',
    });
  }

  getArtifacts(jobId) {
    const job = this.getJob(jobId);
    const artifacts = this.repository.getArtifacts(job.id);
    if (artifacts) {
      return artifacts;
    }
    return buildArtifacts(job, {
      runtimeProbe: null,
      message: 'No explicit artifacts were saved; returning metadata from job state.',
    });
  }

  async runThinSlice(job, compiled, requestContext) {
    if (compiled.requestedMode === 'fallback' || compiled.compatibility.status !== 'h2o_compatible') {
      return this.finishWithArtifacts(job, compiled, {
        executionMode: 'fallback',
        message: compiled.compatibility.reason,
        runtimeProbe: null,
      }, requestContext);
    }

    const probe = this.runtime ? await this.runtime.ensureStarted() : { ok: false, reason: 'No H2O runtime configured.' };
    if (!probe.ok) {
      return this.finishWithArtifacts(job, compiled, {
        executionMode: 'fallback',
        message: probe.reason,
        runtimeProbe: probe,
      }, requestContext);
    }

    return this.finishWithArtifacts(job, compiled, {
      executionMode: 'h2o',
      message: 'H2O runtime is available; training is deferred to the next execution slice.',
      runtimeProbe: probe,
    }, requestContext);
  }

  finishWithArtifacts(job, compiled, outcome, requestContext) {
    const metrics = buildMetrics(compiled, outcome);
    const completed = this.repository.updateJob(job.id, {
      status: 'succeeded',
      executionMode: outcome.executionMode,
      metrics,
      message: outcome.message,
      completedAt: Date.now(),
    });
    const artifacts = buildArtifacts(completed, {
      runtimeProbe: outcome.runtimeProbe,
      message: outcome.message,
    });
    this.repository.saveArtifacts(job.id, artifacts);

    this.memoryRepository?.addMemory(requestContext.sessionId || 'anonymous', {
      content: artifacts.memoryTemplate.content,
      category: 'ml_job',
      metadata: {
        jobId: job.id,
        executionMode: outcome.executionMode,
        compatibility: compiled.compatibility.status,
      },
    });

    return completed;
  }
}

function summarizeJob(job) {
  return {
    jobId: job.id,
    status: job.status,
    executionMode: job.executionMode,
    compatibility: job.compatibility,
    message: job.message,
  };
}

function buildMetrics(compiled, outcome) {
  return {
    nodeCount: compiled.nodes.length,
    edgeCount: compiled.edges.length,
    h2oAlgorithmCount: compiled.compatibility.h2oAlgorithms.length,
    compatibilityStatus: compiled.compatibility.status,
    runtimeReady: Boolean(outcome.runtimeProbe?.ok),
    mojoAvailable: compiled.compatibility.mojoAvailable && outcome.executionMode === 'h2o',
  };
}

function buildArtifacts(job, options = {}) {
  const algorithms = job.compatibility?.h2oAlgorithms || [];
  return {
    leaderboard: algorithms.map((algorithm, index) => ({
      rank: index + 1,
      modelId: `${algorithm}_template_${job.id.slice(0, 8)}`,
      algorithm,
      status: 'template',
    })),
    metrics: job.metrics || {},
    memoryTemplate: {
      title: `VAD ML job ${job.id}`,
      content: [
        `Approved canvas artifact for job ${job.id}.`,
        `Execution mode: ${job.executionMode}.`,
        `Compatibility: ${job.compatibility?.status || 'unknown'}.`,
        `Algorithms: ${algorithms.length ? algorithms.join(', ') : 'none'}.`,
        options.message ? `Note: ${options.message}` : '',
      ].filter(Boolean).join('\n'),
    },
    mojoAvailable: Boolean(job.metrics?.mojoAvailable),
    runtime: options.runtimeProbe || null,
  };
}

function notFound(message) {
  return Object.assign(new Error(message), { status: 404, code: 'NOT_FOUND' });
}

module.exports = {
  MLJobService,
  __private: {
    buildArtifacts,
    buildMetrics,
    summarizeJob,
  },
};
