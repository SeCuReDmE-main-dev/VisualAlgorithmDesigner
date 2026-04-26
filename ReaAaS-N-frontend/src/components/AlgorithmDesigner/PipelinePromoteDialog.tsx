import type { FormEvent } from 'react';
import { useState } from 'react';
import type { PipelineEvaluation, PipelineEdgePayload, PipelineNodePayload } from '../../services/api';
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
      onPromoted?.(record.id);
      onClose();
    } catch (promotionError) {
      setError(promotionError instanceof Error ? promotionError.message : 'Promotion failed.');
    }
  };

  return (
    <div role="presentation" style={backdropStyle}>
      <form aria-label="Promote validated pipeline" onSubmit={onSubmit} style={dialogStyle}>
        <header>
          <h2 style={titleStyle}>Promote pipeline</h2>
          <p style={copyStyle}>
            Score {evaluation?.coherenceScore ?? 0}% / {PROMOTION_THRESHOLD}% required
          </p>
        </header>

        {!eligible && (
          <div role="alert" style={warningStyle}>
            This pipeline needs a coherence score of at least {PROMOTION_THRESHOLD}% before it can enter the validated catalog.
          </div>
        )}

        <label style={labelStyle}>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} />
        </label>

        <label style={labelStyle}>
          Description
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} style={inputStyle} />
        </label>

        {error && (
          <div role="alert" style={errorStyle}>
            {error}
          </div>
        )}

        <footer style={actionsStyle}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button type="submit" disabled={!eligible} style={eligible ? primaryButtonStyle : disabledButtonStyle}>
            Promote
          </button>
        </footer>
      </form>
    </div>
  );
}

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  display: 'grid',
  placeItems: 'center',
  background: 'rgba(15, 23, 42, 0.55)',
};

const dialogStyle: React.CSSProperties = {
  width: 'min(460px, calc(100vw - 32px))',
  display: 'grid',
  gap: 16,
  padding: 20,
  borderRadius: 8,
  background: '#ffffff',
  color: '#172033',
  boxShadow: '0 24px 80px rgba(15, 23, 42, 0.25)',
};

const titleStyle: React.CSSProperties = { margin: 0, fontSize: 20 };
const copyStyle: React.CSSProperties = { margin: '6px 0 0', color: '#5f6b7a' };
const labelStyle: React.CSSProperties = { display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 };
const inputStyle: React.CSSProperties = { border: '1px solid #cad3df', borderRadius: 6, padding: '10px 12px', font: 'inherit' };
const actionsStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: 8 };
const primaryButtonStyle: React.CSSProperties = { border: 0, borderRadius: 6, padding: '10px 14px', background: '#2f7d32', color: '#fff', fontWeight: 700 };
const secondaryButtonStyle: React.CSSProperties = { border: '1px solid #cad3df', borderRadius: 6, padding: '10px 14px', background: '#fff', color: '#172033' };
const disabledButtonStyle: React.CSSProperties = { ...primaryButtonStyle, background: '#9aa5b1', cursor: 'not-allowed' };
const warningStyle: React.CSSProperties = { borderRadius: 6, padding: 10, background: '#fff7ed', color: '#9a3412' };
const errorStyle: React.CSSProperties = { borderRadius: 6, padding: 10, background: '#fef2f2', color: '#991b1b' };
