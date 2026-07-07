import { describe, expect, it } from 'vitest';
import type { PipelineEvaluation } from './api';
import {
  buildAlgoQuestLearningEvent,
  buildGuardianArtifactPointer,
  exportValidatedAlgorithmForAlgoQuest,
  hasSecretLikeField,
} from './algoQuestEventBridge';
import { PROMOTION_THRESHOLD, type ValidatedAlgorithmRecord } from './validatedAlgorithmCatalog';

function record(score = PROMOTION_THRESHOLD, tags: string[] = ['privacy', 'secret']): ValidatedAlgorithmRecord {
  const evaluation: PipelineEvaluation = {
    coherenceScore: score,
    complianceScore: 96,
    complianceStatus: 'review',
    explanation: 'Validated educational algorithm.',
    recommendation: 'valid',
    weakPoints: [],
    strongPoints: ['Clear algorithmic flow'],
    loopCompatible: false,
    contextualMisuse: {
      isSuspicious: true,
      reason: 'Input may include private user content.',
      matchedTerm: 'secret',
      intent: 'privacy review',
    },
  };

  return {
    id: 'vad-record-001',
    name: 'Privacy-aware sorting flow',
    description: 'A validated pipeline.',
    nodes: [{ id: 'n1', type: 'input', data: { label: 'Input' } }],
    edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    evaluation,
    coherenceScore: score,
    promotedAt: '2026-07-07T14:00:00.000Z',
    updatedAt: '2026-07-07T14:00:00.000Z',
    tags,
  };
}

describe('algoQuestEventBridge', () => {
  it('builds a StudentLearningEvent for a score at the 93 threshold', () => {
    const event = buildAlgoQuestLearningEvent(record(93), 2);

    expect(event.schema).toBe('securedme.education.student-learning-event.v1');
    expect(event.app_slug).toBe('visual-algorithm');
    expect(event.artifact_ref).toBe('vad:validated-algorithm:vad-record-001');
    expect(event.score).toBe(93);
    expect(event.threshold).toBe(93);
    expect(event.attempt_count).toBe(2);
    expect(event.risk_flags).toEqual(['privacy', 'secret', 'security']);
    expect(event.raw_secret_stored).toBe(false);
    expect(JSON.stringify(event)).not.toContain('nodes');
    expect(JSON.stringify(event)).not.toContain('edges');
  });

  it('rejects exports below the 93 threshold', () => {
    expect(() => buildAlgoQuestLearningEvent(record(92.99))).toThrow('at least 93%');
  });

  it('builds a V.O.T Guardian artifact pointer without embedding the raw payload', () => {
    const event = buildAlgoQuestLearningEvent(record(93));
    const pointer = buildGuardianArtifactPointer(event, 'suite');

    expect(pointer.schema).toBe('securedme.education.artifact-pointer.v1');
    expect(pointer.source_app).toBe('visual-algorithm');
    expect(pointer.target_app).toBe('vot-guardian');
    expect(pointer.artifact_ref).toBe(event.artifact_ref);
    expect(pointer.consent_required).toBe(true);
    expect(pointer.consent_scope).toBe('suite');
    expect(pointer.raw_payload_embedded).toBe(false);
    expect(pointer.raw_secret_stored).toBe(false);
  });

  it('exports both AlgoQuest event and Guardian pointer as one dry handoff', () => {
    const result = exportValidatedAlgorithmForAlgoQuest(record(93), { consentScope: 'tool' });

    expect(result.success).toBe(true);
    expect(result.event.schema).toBe('securedme.education.student-learning-event.v1');
    expect(result.guardianPointer.target_app).toBe('vot-guardian');
    expect(result.raw_secret_stored).toBe(false);
  });

  it('detects forbidden secret-like material', () => {
    expect(hasSecretLikeField({ api_key: 'blocked' })).toBe(true);
    expect(hasSecretLikeField({ message: 'token=blocked-value' })).toBe(true);
    expect(hasSecretLikeField({ raw_secret_stored: false, raw_payload_embedded: false })).toBe(false);
  });
});
