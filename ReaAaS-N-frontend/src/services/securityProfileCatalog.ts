export type SecurityProfileId =
  | 'general'
  | 'educational'
  | 'integrity'
  | 'compliance'
  | 'security'
  | 'research'
  | 'operations';

export interface SecurityProfile {
  id: SecurityProfileId;
  label: string;
  shortLabel: string;
  description: string;
  legalJustification: string;
  allowedVocabulary: string[];
  blockedIntents: string[];
  promotionThreshold: number;
  requiresDisclaimer: boolean;
  reportSection: string;
}

export const SECURITY_PROFILE_CATALOG: SecurityProfile[] = [
  {
    id: 'general',
    label: 'General algorithm design',
    shortLabel: 'General',
    description: 'Default educational or professional algorithm drafting with standard safety checks.',
    legalJustification: 'General educational or professional algorithm design.',
    allowedVocabulary: ['pipeline', 'model', 'training', 'evaluation', 'loop', 'feedback'],
    blockedIntents: ['unauthorized access', 'credential theft', 'privacy-invasive extraction'],
    promotionThreshold: 93,
    requiresDisclaimer: false,
    reportSection: 'Baseline safeguards',
  },
  {
    id: 'educational',
    label: 'Educational review',
    shortLabel: 'Education',
    description: 'Classroom, training, and learner-facing explanations with reduced promotion threshold.',
    legalJustification: 'Student learning and classroom explanation.',
    allowedVocabulary: ['step', 'concept', 'example', 'rubric', 'feedback'],
    blockedIntents: ['operational misuse', 'unauthorized security testing'],
    promotionThreshold: 90,
    requiresDisclaimer: false,
    reportSection: 'Pedagogical safeguards',
  },
  {
    id: 'integrity',
    label: 'Integrity monitoring',
    shortLabel: 'Integrity',
    description: 'Defensive anomaly, audit, and data-integrity workflows with strict compliance scoring.',
    legalJustification: 'Defensive integrity monitoring and audit workflows.',
    allowedVocabulary: ['threat', 'anomaly', 'integrity', 'audit', 'risk', 'control'],
    blockedIntents: ['weaponization', 'covert persistence', 'evasion'],
    promotionThreshold: 96,
    requiresDisclaimer: true,
    reportSection: 'Integrity and red-team controls',
  },
  {
    id: 'compliance',
    label: 'Compliance and privacy',
    shortLabel: 'Compliance',
    description: 'Governance, privacy, retention, and evidence review for regulated workflows.',
    legalJustification: 'Governance, privacy, and compliance review.',
    allowedVocabulary: ['audit', 'privacy', 'retention', 'consent', 'policy', 'evidence'],
    blockedIntents: ['unconsented profiling', 'private data extraction', 'retention bypass'],
    promotionThreshold: 95,
    requiresDisclaimer: true,
    reportSection: 'Privacy impact controls',
  },
  {
    id: 'security',
    label: 'Authorized security',
    shortLabel: 'Security',
    description: 'Authorized defensive analysis, incident triage, and detection engineering.',
    legalJustification: 'Authorized defensive security analysis.',
    allowedVocabulary: ['detection', 'incident', 'triage', 'containment', 'indicator', 'exploit'],
    blockedIntents: ['unauthorized exploitation', 'malware generation', 'credential theft'],
    promotionThreshold: 95,
    requiresDisclaimer: true,
    reportSection: 'Authorized security controls',
  },
  {
    id: 'research',
    label: 'Controlled research',
    shortLabel: 'Research',
    description: 'Controlled experiments, benchmarks, and dataset validation with traceable assumptions.',
    legalJustification: 'Controlled research and evaluation.',
    allowedVocabulary: ['experiment', 'baseline', 'metric', 'validation', 'dataset'],
    blockedIntents: ['human-subject reidentification', 'unapproved data collection'],
    promotionThreshold: 93,
    requiresDisclaimer: false,
    reportSection: 'Research protocol controls',
  },
  {
    id: 'operations',
    label: 'Operations support',
    shortLabel: 'Operations',
    description: 'Runbook, monitoring, rollback, and operational decision-support pipelines.',
    legalJustification: 'Operational decision support and automation.',
    allowedVocabulary: ['monitoring', 'alert', 'handoff', 'runbook', 'rollback'],
    blockedIntents: ['unsafe automation', 'approval bypass', 'silent destructive action'],
    promotionThreshold: 93,
    requiresDisclaimer: false,
    reportSection: 'Operational controls',
  },
];

export const DEFAULT_SECURITY_PROFILE_ID: SecurityProfileId = 'general';

const SECURITY_PROFILE_MAP = new Map<string, SecurityProfile>(
  SECURITY_PROFILE_CATALOG.map((profile) => [profile.id, profile])
);

export function getSecurityProfile(profileId?: string): SecurityProfile {
  return (
    (profileId ? SECURITY_PROFILE_MAP.get(profileId) : undefined) ??
    SECURITY_PROFILE_MAP.get(DEFAULT_SECURITY_PROFILE_ID)!
  );
}

export function isSecurityProfileId(profileId: string): profileId is SecurityProfileId {
  return profileId ? SECURITY_PROFILE_MAP.has(profileId) : false;
}
