import type { PipelineEdgePayload, PipelineEvaluation, PipelineNodePayload } from './api';

export const VALIDATED_ALGORITHMS_STORAGE_KEY = 'vad_validated_algorithms';
export const PROMOTION_THRESHOLD = 93;

export interface ValidatedAlgorithmRecord {
  id: string;
  name: string;
  description?: string;
  nodes: PipelineNodePayload[];
  edges: PipelineEdgePayload[];
  evaluation: PipelineEvaluation;
  coherenceScore: number;
  promotedAt: string;
  updatedAt: string;
  tags: string[];
}

export interface PromoteValidatedAlgorithmInput {
  name: string;
  description?: string;
  nodes: PipelineNodePayload[];
  edges: PipelineEdgePayload[];
  evaluation: PipelineEvaluation;
  tags?: string[];
}

function createId() {
  if ('crypto' in globalThis && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `validated-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

let catalogCache: ValidatedAlgorithmRecord[] | null = null;

function readCatalog(): ValidatedAlgorithmRecord[] {
  if (catalogCache !== null) {
    return catalogCache;
  }

  try {
    const rawCatalog = localStorage.getItem(VALIDATED_ALGORITHMS_STORAGE_KEY);

    if (!rawCatalog) {
      catalogCache = [];
      return catalogCache;
    }

    const parsedCatalog = JSON.parse(rawCatalog);
    catalogCache = Array.isArray(parsedCatalog) ? (parsedCatalog as ValidatedAlgorithmRecord[]) : [];
    return catalogCache;
  } catch {
    catalogCache = [];
    return catalogCache;
  }
}

function writeCatalog(records: ValidatedAlgorithmRecord[]) {
  localStorage.setItem(VALIDATED_ALGORITHMS_STORAGE_KEY, JSON.stringify(records));
  catalogCache = records;
}

export function isPromotionEligible(evaluation: Pick<PipelineEvaluation, 'coherenceScore'> | null | undefined) {
  return Boolean(evaluation && evaluation.coherenceScore >= PROMOTION_THRESHOLD);
}

export function listValidatedAlgorithms() {
  return readCatalog().sort((left, right) => right.promotedAt.localeCompare(left.promotedAt));
}

export function getValidatedAlgorithm(id: string) {
  return readCatalog().find((record) => record.id === id) ?? null;
}

export function promoteValidatedAlgorithm(input: PromoteValidatedAlgorithmInput) {
  if (!isPromotionEligible(input.evaluation)) {
    throw new Error(`Pipeline score must be at least ${PROMOTION_THRESHOLD}% to promote.`);
  }

  const now = new Date().toISOString();
  const record: ValidatedAlgorithmRecord = {
    id: createId(),
    name: input.name.trim() || 'Validated pipeline',
    description: input.description?.trim(),
    nodes: input.nodes,
    edges: input.edges,
    evaluation: input.evaluation,
    coherenceScore: input.evaluation.coherenceScore,
    promotedAt: now,
    updatedAt: now,
    tags: input.tags ?? [],
  };

  writeCatalog([record, ...readCatalog()]);
  return record;
}

export function updateValidatedAlgorithm(
  id: string,
  patch: Partial<Pick<ValidatedAlgorithmRecord, 'name' | 'description' | 'tags'>>,
) {
  const records = readCatalog();
  const index = records.findIndex((record) => record.id === id);

  if (index === -1) {
    return null;
  }

  const updatedRecord: ValidatedAlgorithmRecord = {
    ...records[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  records[index] = updatedRecord;
  writeCatalog(records);
  return updatedRecord;
}

export function deleteValidatedAlgorithm(id: string) {
  const records = readCatalog();
  const nextRecords = records.filter((record) => record.id !== id);
  writeCatalog(nextRecords);
  return nextRecords.length !== records.length;
}

export function clearValidatedAlgorithms() {
  localStorage.removeItem(VALIDATED_ALGORITHMS_STORAGE_KEY);
  catalogCache = null;
}
