import { describe, expect, it } from 'vitest';
import { VAD_WEBMCP_TOOLS, executeVadWebMcp, grantVadOneUseApproval } from './webMcpTools';

describe('VAD WebMCP boundary', () => {
  it('offers ten bounded specialist tools', () => {
    expect(VAD_WEBMCP_TOOLS).toHaveLength(12);
    expect(VAD_WEBMCP_TOOLS.map((tool) => tool.name)).toContain('vad_prepare_qbit_handoff');
  });

  it('refuses secret-like input', () => {
    expect(() => executeVadWebMcp('vad_stage_visual_annotation', { note: 'x', password: 'nope' })).toThrow('SECRET_OR_PERSONAL_DATA_REJECTED');
  });

  it('fails closed without a human approval and accepts it once', () => {
    const input = { graph_ref: 'vad:graph:1', audience: 'primary-5-6', idempotencyKey: 'approval-test-0001' };
    expect(() => executeVadWebMcp('vad_export_review_receipt', input)).toThrow('HUMAN_APPROVAL_REQUIRED_OR_EXPIRED');
    const approval = grantVadOneUseApproval('vad_export_review_receipt', input.audience, 'nonce-vad-test', Date.now() + 30_000);
    expect(executeVadWebMcp('vad_export_review_receipt', { ...input, approval })).toMatchObject({ source_app: 'visual-algorithm' });
  });
});
