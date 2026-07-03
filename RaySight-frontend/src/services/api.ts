import { SecurityProfileId } from './securityProfileCatalog';

export interface PipelineNodePayload {
  id: string;
  type: string;
  params?: Record<string, unknown>;
  data?: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface PipelineEdgePayload {
  id?: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface ExplainPipelinePayload {
  nodes: PipelineNodePayload[];
  edges: PipelineEdgePayload[];
  focusNodeId?: string;
  securityProfile?: SecurityProfileId;
}

export interface ExplainPipelineResult {
  explanation: string;
  promptHash?: string;
  securityProfile?: SecurityProfileId;
  contextualMisuse?: ContextualMisuseResult;
}

export interface EvaluatePipelinePayload {
  nodes: PipelineNodePayload[];
  edges: PipelineEdgePayload[];
  focusNodeId?: string;
  securityProfile?: SecurityProfileId;
}

export interface ContextualMisuseResult {
  isSuspicious: boolean;
  reason: string;
  matchedTerm?: string;
  intent?: string;
}

export interface PipelineEvaluation {
  explanation: string;
  coherenceScore: number;
  complianceScore?: number;
  complianceStatus?: 'pass' | 'review' | 'fail';
  recommendation: 'valid' | 'warning' | 'invalid';
  weakPoints: string[];
  strongPoints: string[];
  loopCompatible: boolean;
  promptHash?: string;
  securityProfile?: SecurityProfileId;
  contextualMisuse?: ContextualMisuseResult;
  loopGuard?: {
    maxIterations: number;
    visitedNodeIds: string[];
    truncated: boolean;
  };
}

export interface MLJobCompatibility {
  status: 'annex_compatible' | 'memory_only' | 'unsupported';
  reason: string;
  annexAlgorithms: string[];
  supportedNodeIds: string[];
  unsupportedNodeIds: string[];
  mojoAvailable: boolean;
}

export interface CreateMLJobPayload {
  nodes: PipelineNodePayload[];
  edges: PipelineEdgePayload[];
  securityProfile?: SecurityProfileId;
  mode?: 'annex' | 'fallback';
}

export interface CreateMLJobResult {
  jobId: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled';
  executionMode: 'annex' | 'fallback';
  compatibility: MLJobCompatibility;
  message: string;
}

export interface MLJob extends Omit<CreateMLJobResult, 'jobId'> {
  id: string;
  request: Record<string, unknown>;
  metrics?: Record<string, unknown> | null;
  error?: string | null;
  createdAt: number;
  updatedAt: number;
  completedAt?: number | null;
}

export interface MLJobArtifacts {
  jobId: string;
  leaderboard: Array<Record<string, unknown>>;
  metrics: Record<string, unknown>;
  memoryTemplate: {
    title: string;
    content: string;
  };
  mojoAvailable: boolean;
  runtime?: Record<string, unknown> | null;
  createdAt?: number;
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof json === 'object' && json !== null && 'message' in json
        ? String(json.message)
        : `HTTP ${response.status}`;
    throw new Error(message);
  }

  if (typeof json === 'object' && json !== null && 'data' in json) {
    return json.data as T;
  }

  return json as T;
}

async function postPipeline<TResponse>(endpoint: string, payload: object): Promise<TResponse> {
  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return readJsonResponse<TResponse>(response);
}

async function getJson<TResponse>(endpoint: string): Promise<TResponse> {
  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include',
  });

  return readJsonResponse<TResponse>(response);
}

export function explainPipeline(payload: ExplainPipelinePayload) {
  return postPipeline<ExplainPipelineResult>('/api/ai/explain-pipeline', payload);
}

export function evaluatePipeline(payload: EvaluatePipelinePayload) {
  return postPipeline<PipelineEvaluation>('/api/ai/evaluate-pipeline', payload);
}

export function createMLJob(payload: CreateMLJobPayload) {
  return postPipeline<CreateMLJobResult>('/api/ml/jobs', payload);
}

export function getMLJob(jobId: string) {
  return getJson<MLJob>(`/api/ml/jobs/${jobId}`);
}

export function cancelMLJob(jobId: string) {
  return postPipeline<MLJob>(`/api/ml/jobs/${jobId}/cancel`, {});
}

export function getMLJobArtifacts(jobId: string) {
  return getJson<MLJobArtifacts>(`/api/ml/jobs/${jobId}/artifacts`);
}
