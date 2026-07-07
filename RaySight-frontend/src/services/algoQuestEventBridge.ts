import type { PipelineEvaluation } from './api';
import {
  isPromotionEligible,
  PROMOTION_THRESHOLD,
  type ValidatedAlgorithmRecord,
} from './validatedAlgorithmCatalog';

export const ALGOQUEST_OUTBOX_STORAGE_KEY = 'securedme.education.algoquest.outbox.v1';
export const GUARDIAN_OUTBOX_STORAGE_KEY = 'securedme.education.vot-guardian.outbox.v1';

export interface StudentLearningEventV1 {
  schema: 'securedme.education.student-learning-event.v1';
  event_id: string;
  app_slug: 'visual-algorithm';
  artifact_ref: string;
  skill_area: string;
  difficulty_band: string;
  score: number;
  threshold: number;
  attempt_count: number;
  blocked_reason: string;
  next_step_hint: string;
  qbit_help_accepted: boolean;
  risk_flags: string[];
  created_at: string;
  contract_version: 'v1';
  raw_secret_stored: false;
}

export interface GuardianArtifactPointerV1 {
  schema: 'securedme.education.artifact-pointer.v1';
  pointer_id: string;
  source_app: 'visual-algorithm';
  target_app: 'vot-guardian';
  artifact_ref: string;
  risk_flags: string[];
  consent_required: true;
  consent_scope: 'tool' | 'suite';
  created_at: string;
  contract_version: 'v1';
  raw_payload_embedded: false;
  raw_secret_stored: false;
}

const forbiddenKeys = new Set([
  '.env',
  'api_key',
  'browser_session',
  'client_secret',
  'cookie',
  'oauth_token',
  'password',
  'raw_chat_log',
  'raw_prompt',
  'roster',
  'secret',
  'session_cookie',
  'student_email',
  'student_id',
  'student_name',
  'token',
]);

const allowedRawProofKeys = new Set(['raw_payload_embedded', 'raw_secret_stored', 'raw_values_printed']);

function stableId(prefix: string, seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }
  return `${prefix}-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

export function hasSecretLikeField(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(hasSecretLikeField);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).some(([key, nested]) => {
      const normalized = key.toLowerCase();
      if (allowedRawProofKeys.has(normalized)) {
        return false;
      }
      return forbiddenKeys.has(normalized) || normalized.startsWith('raw_') || hasSecretLikeField(nested);
    });
  }

  if (typeof value === 'string') {
    return /((api[_-]?key|access[_-]?token|refresh[_-]?token|oauth[_-]?token|oauth|token|cookie|password|client[_-]?secret)\s*[:=])|bearer\s+[a-z0-9._~+/=-]{12,}/i.test(
      value,
    );
  }

  return false;
}

function riskFlagsFromEvaluation(evaluation: PipelineEvaluation, tags: string[]): string[] {
  const flags = new Set<string>();

  if (evaluation.contextualMisuse?.isSuspicious) {
    flags.add('privacy');
  }

  if (evaluation.complianceStatus === 'review' || evaluation.complianceStatus === 'fail') {
    flags.add('security');
  }

  for (const tag of tags) {
    const normalized = tag.toLowerCase();
    if (normalized.includes('secret') || normalized.includes('privacy') || normalized.includes('security')) {
      flags.add(normalized.includes('secret') ? 'secret' : normalized);
    }
  }

  return Array.from(flags).sort();
}

export function buildAlgoQuestLearningEvent(record: ValidatedAlgorithmRecord, attemptCount = 1): StudentLearningEventV1 {
  if (!isPromotionEligible(record.evaluation)) {
    throw new Error(`VAD artifact must score at least ${PROMOTION_THRESHOLD}% before AlgoQuest export.`);
  }

  const risk_flags = riskFlagsFromEvaluation(record.evaluation, record.tags);
  const artifact_ref = `vad:validated-algorithm:${record.id}`;
  const event: StudentLearningEventV1 = {
    schema: 'securedme.education.student-learning-event.v1',
    event_id: stableId('student-event', `${artifact_ref}:${record.coherenceScore}`),
    app_slug: 'visual-algorithm',
    artifact_ref,
    skill_area: 'algorithm_design',
    difficulty_band: 'grade5-sec2',
    score: record.coherenceScore,
    threshold: PROMOTION_THRESHOLD,
    attempt_count: attemptCount,
    blocked_reason: '',
    next_step_hint:
      risk_flags.some((flag) => flag === 'privacy' || flag === 'secret' || flag === 'security')
        ? 'Open AlgoQuest challenge and request V.O.T Guardian review before sharing.'
        : 'Open AlgoQuest challenge and continue with the next algorithm reflection.',
    qbit_help_accepted: false,
    risk_flags,
    created_at: new Date().toISOString(),
    contract_version: 'v1',
    raw_secret_stored: false,
  };

  if (hasSecretLikeField(event)) {
    throw new Error('AlgoQuest learning event contains forbidden secret-like material.');
  }

  return event;
}

export function buildGuardianArtifactPointer(
  event: StudentLearningEventV1,
  consentScope: 'tool' | 'suite' = 'tool',
): GuardianArtifactPointerV1 {
  const pointer: GuardianArtifactPointerV1 = {
    schema: 'securedme.education.artifact-pointer.v1',
    pointer_id: stableId('guardian-pointer', `${event.artifact_ref}:${consentScope}`),
    source_app: 'visual-algorithm',
    target_app: 'vot-guardian',
    artifact_ref: event.artifact_ref,
    risk_flags: event.risk_flags,
    consent_required: true,
    consent_scope: consentScope,
    created_at: new Date().toISOString(),
    contract_version: 'v1',
    raw_payload_embedded: false,
    raw_secret_stored: false,
  };

  if (hasSecretLikeField(pointer)) {
    throw new Error('Guardian artifact pointer contains forbidden secret-like material.');
  }

  return pointer;
}

function appendJsonStorage<T>(key: string, value: T): T[] {
  const current = JSON.parse(localStorage.getItem(key) || '[]');
  const records = Array.isArray(current) ? current : [];
  const next = [value, ...records].slice(0, 25);
  localStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function exportValidatedAlgorithmForAlgoQuest(
  record: ValidatedAlgorithmRecord,
  options: { attemptCount?: number; consentScope?: 'tool' | 'suite'; writeLocalOutbox?: boolean } = {},
) {
  const event = buildAlgoQuestLearningEvent(record, options.attemptCount ?? 1);
  const guardianPointer = buildGuardianArtifactPointer(event, options.consentScope ?? 'tool');

  if (options.writeLocalOutbox) {
    appendJsonStorage(ALGOQUEST_OUTBOX_STORAGE_KEY, event);
    appendJsonStorage(GUARDIAN_OUTBOX_STORAGE_KEY, guardianPointer);
  }

  return {
    schema: 'securedme.education.vad-algoquest-export.v1',
    success: true,
    event,
    guardianPointer,
    raw_secret_stored: false,
  };
}
