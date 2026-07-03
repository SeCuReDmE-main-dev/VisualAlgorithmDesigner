class MLJobRepository {
  createJob(_job) {
    throw new Error('MLJobRepository.createJob must be implemented');
  }

  updateJob(_jobId, _patch) {
    throw new Error('MLJobRepository.updateJob must be implemented');
  }

  getJob(_jobId) {
    throw new Error('MLJobRepository.getJob must be implemented');
  }

  saveArtifacts(_jobId, _artifacts) {
    throw new Error('MLJobRepository.saveArtifacts must be implemented');
  }

  getArtifacts(_jobId) {
    throw new Error('MLJobRepository.getArtifacts must be implemented');
  }
}

function normalizeJobId(jobId) {
  const value = String(jobId || '').trim();
  if (!/^[a-f0-9-]{36}$/i.test(value)) {
    throw Object.assign(new Error('Invalid job id'), { status: 400, code: 'BAD_REQUEST' });
  }
  return value;
}

module.exports = {
  MLJobRepository,
  normalizeJobId,
};
