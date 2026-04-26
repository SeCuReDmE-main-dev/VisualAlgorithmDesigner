import { getOrCreateSessionId } from './sessionManager';
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
  const sessionId = getOrCreateSessionId();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId,
    },
    body: JSON.stringify({ ...payload, sessionId }),
  });

  return readJsonResponse<TResponse>(response);
}

export function explainPipeline(payload: ExplainPipelinePayload) {
  return postPipeline<ExplainPipelineResult>('/api/ai/explain-pipeline', payload);
}

export function evaluatePipeline(payload: EvaluatePipelinePayload) {
  return postPipeline<PipelineEvaluation>('/api/ai/evaluate-pipeline', payload);
}
