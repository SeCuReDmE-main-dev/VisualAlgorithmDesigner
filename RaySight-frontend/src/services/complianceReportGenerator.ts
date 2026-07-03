import { getSecurityProfile, SecurityProfileId } from './securityProfileCatalog';

export interface ComplianceReportInput {
  pipelineName?: string;
  nodes: Array<{ id: string; type?: string; data?: Record<string, unknown>; label?: string }>;
  edges: Array<{ id?: string; source: string; target: string }>;
  securityProfile: SecurityProfileId;
  evaluation?: {
    coherenceScore?: number;
    complianceScore?: number;
    recommendation?: string;
    explanation?: string;
    weakPoints?: string[];
    strongPoints?: string[];
    promptHash?: string;
  };
  generatedAt?: string;
}

export interface ComplianceReport {
  title: string;
  generatedAt: string;
  profileId: SecurityProfileId;
  profileLabel: string;
  complianceScore: number;
  status: 'pass' | 'review' | 'fail';
  sha256: string;
  markdown: string;
}

export async function generateComplianceReport(input: ComplianceReportInput): Promise<ComplianceReport> {
  const profile = getSecurityProfile(input.securityProfile);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const complianceScore = Math.max(
    0,
    Math.min(100, Math.round(input.evaluation?.complianceScore ?? input.evaluation?.coherenceScore ?? 0)),
  );
  const status = complianceScore >= profile.promotionThreshold ? 'pass' : complianceScore >= 70 ? 'review' : 'fail';
  const title = `Review Report - ${input.pipelineName || 'Visual Algorithm Designer pipeline'}`;
  const canonical = {
    title,
    generatedAt,
    profileId: profile.id,
    nodes: input.nodes.map((node) => ({ id: node.id, type: node.type, label: node.label ?? node.data?.label })),
    edges: input.edges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target })),
    evaluation: input.evaluation ?? null,
  };
  const sha256 = await sha256Hex(JSON.stringify(canonical));
  const markdown = [
    `# ${title}`,
    '',
    `Generated: ${generatedAt}`,
    `Profile: ${profile.label}`,
    `Review basis: ${profile.legalJustification}`,
    `Review score: ${complianceScore}/100 (${status})`,
    `Integrity hash: ${sha256}`,
    '',
    `## ${profile.reportSection}`,
    '',
    `Allowed vocabulary: ${profile.allowedVocabulary.join(', ')}`,
    `Blocked intents: ${profile.blockedIntents.join(', ')}`,
    '',
    '## Evaluation',
    '',
    `Recommendation: ${input.evaluation?.recommendation ?? 'not evaluated'}`,
    `Explanation: ${input.evaluation?.explanation ?? 'No evaluation summary provided.'}`,
    `Weak points: ${formatList(input.evaluation?.weakPoints)}`,
    `Strong points: ${formatList(input.evaluation?.strongPoints)}`,
    input.evaluation?.promptHash ? `Prompt hash: ${input.evaluation.promptHash}` : null,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  return {
    title,
    generatedAt,
    profileId: profile.id,
    profileLabel: profile.label,
    complianceScore,
    status,
    sha256,
    markdown,
  };
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function formatList(items?: string[]): string {
  return items && items.length > 0 ? items.join('; ') : 'none';
}
