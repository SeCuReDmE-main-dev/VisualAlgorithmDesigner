import type { FormEvent } from 'react';
import { useState } from 'react';
import type { PipelineEvaluation, PipelineEdgePayload, PipelineNodePayload } from '../../services/api';
import { exportValidatedAlgorithmForAlgoQuest } from '../../services/algoQuestEventBridge';
import { PROMOTION_THRESHOLD, isPromotionEligible } from '../../services/validatedAlgorithmCatalog';
import { useValidatedAlgorithms } from '../../hooks/useValidatedAlgorithms';

export interface PipelinePromoteDialogProps {
  open: boolean;
  nodes: PipelineNodePayload[];
  edges: PipelineEdgePayload[];
  evaluation: PipelineEvaluation | null;
  onClose: () => void;
  onPromoted?: (id: string) => void;
}

export function PipelinePromoteDialog({ open, nodes, edges, evaluation, onClose, onPromoted }: PipelinePromoteDialogProps) {
  const [name, setName] = useState('Validated pipeline');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { promote } = useValidatedAlgorithms();

  if (!open) {
    return null;
  }

  const eligible = isPromotionEligible(evaluation);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!evaluation) {
      setError('Run an evaluation before promoting this pipeline.');
      return;
    }

    try {
      const record = promote({
        name,
        description,
        nodes,
        edges,
        evaluation,
        tags: ['validated', evaluation.recommendation],
      });
      exportValidatedAlgorithmForAlgoQuest(record, {
        consentScope: 'suite',
        writeLocalOutbox: true,
      });
      onPromoted?.(record.id);
      onClose();
    } catch (promotionError) {
      setError(promotionError instanceof Error ? promotionError.message : 'Promotion failed.');
    }
  };

  return (
    <div role="presentation" className="ppd-backdrop">
      <form aria-label="Promote validated pipeline" onSubmit={onSubmit} className="ppd-dialog">
        <header>
          <h2 className="ppd-title">Promote pipeline</h2>
          <p className="ppd-copy">
            Score {evaluation?.coherenceScore ?? 0}% / {PROMOTION_THRESHOLD}% required
          </p>
        </header>

        {!eligible && (
          <div role="alert" className="ppd-warning">
            This pipeline needs a coherence score of at least {PROMOTION_THRESHOLD}% before it can enter the validated catalog.
          </div>
        )}

        <label className="ppd-label" htmlFor="promote-name">
          Name
          <input id="promote-name" value={name} onChange={(event) => setName(event.target.value)} className="ppd-input" />
        </label>

        <label className="ppd-label" htmlFor="promote-desc">
          Description
          <textarea id="promote-desc" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="ppd-input" />
        </label>

        {error && (
          <div role="alert" className="ppd-error">
            {error}
          </div>
        )}

        <footer className="ppd-actions">
          <button type="button" onClick={onClose} className="ppd-btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={!eligible} className={eligible ? 'ppd-btn-primary' : 'ppd-btn-disabled'}>
            Promote
          </button>
        </footer>
      </form>
    </div>
  );
}


