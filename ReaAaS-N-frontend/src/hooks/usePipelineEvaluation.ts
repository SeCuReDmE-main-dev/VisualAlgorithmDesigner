import { useCallback, useState } from 'react';
import { evaluatePipeline, type PipelineEvaluation, type PipelineEdgePayload, type PipelineNodePayload } from '../services/api';

export interface UsePipelineEvaluationState {
  evaluation: PipelineEvaluation | null;
  isEvaluating: boolean;
  error: string | null;
  latencyMs: number | null;
}

export function usePipelineEvaluation(nodes: PipelineNodePayload[], edges: PipelineEdgePayload[]) {
  const [state, setState] = useState<UsePipelineEvaluationState>({
    evaluation: null,
    isEvaluating: false,
    error: null,
    latencyMs: null,
  });

  const runEvaluation = useCallback(async () => {
    const startedAt = performance.now();
    setState((currentState) => ({ ...currentState, isEvaluating: true, error: null }));

    try {
      const evaluation = await evaluatePipeline({ nodes, edges });
      const latencyMs = Math.round(performance.now() - startedAt);
      setState({ evaluation, isEvaluating: false, error: null, latencyMs });
      return evaluation;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pipeline evaluation failed.';
      setState((currentState) => ({ ...currentState, isEvaluating: false, error: message, latencyMs: null }));
      throw error;
    }
  }, [edges, nodes]);

  const resetEvaluation = useCallback(() => {
    setState({ evaluation: null, isEvaluating: false, error: null, latencyMs: null });
  }, []);

  return {
    ...state,
    runEvaluation,
    resetEvaluation,
  };
}
