import { describe, expect, it, vi } from 'vitest';
import { createVadWebMcpRuntime, registerVadWebMcp } from './webMcpTools';

function fixture() {
  const current = { graph_ref: 'graph-test', revision: 1, nodes: [{ id: 'visible-node', position: { x: 0, y: 0 }, data: { algorithmId: 'sorting' } }], edges: [] };
  const session = { schema: 'securedme.education.session.v2', raw_secret_stored: false, session_id: 'session-test', identity_ref: 'subject-test', role: 'student_adult', authorization_basis: { decision: 'allow' }, allowed_tools: ['visual-algorithm'], expires_at: new Date(Date.now() + 60000).toISOString() };
  const staged: unknown[] = [];
  const authorizations: Array<() => Promise<void>> = [];
  const dependencies = {
    readGraph: () => current,
    listPrefabs: () => [{ id: 'sorting', label: 'Sort' }],
    readContext: () => ({ selected_node: 'visible-node', canonical_state_owner: 'algoquest' }),
    stageProposal: (value: unknown, authorize: () => Promise<void>) => { staged.push(value); authorizations.push(authorize); },
    exportReview: vi.fn(async () => ({ receipt_id: 'review-test', artifact_name: 'review.json', download_requested: true })),
    prepareHandoff: vi.fn(async (receipt_id: string) => ({ receipt_id, prepared: true, dispatched: false })),
    loadSession: vi.fn(async () => session),
    requestHumanApproval: vi.fn(async () => true),
  };
  return { current, session, staged, authorizations, dependencies, runtime: createVadWebMcpRuntime(dependencies) };
}
const execution = { graph_ref: 'graph-test', expected_revision: 1, audience: 'visual-algorithm', approval: { request_human_review: true }, idempotencyKey: 'request-000001' };

describe('VAD WebMCP bound to the visible product', () => {
  it('inspects the actual graph and rejects caller-supplied graph substitution', async () => {
    const { current, runtime } = fixture();
    expect(await runtime.execute('vad_inspect_canvas', {})).toMatchObject({ node_count: 1, revision: 1, graph_ref: 'graph-test' });
    current.nodes.push({ id: 'second-visible-node', position: { x: 1, y: 2 }, data: { algorithmId: 'search' } });
    expect(await runtime.execute('vad_inspect_canvas', {})).toMatchObject({ node_count: 2 });
    await expect(runtime.execute('vad_inspect_canvas', { nodes: [] })).rejects.toThrow('INVALID_WEBMCP_INPUT');
  });
  it('stages a real visible proposal without modifying the graph', async () => {
    const { current, staged, runtime } = fixture();
    await runtime.execute('vad_stage_layout', { layout: 'linear', zoom: 1, expected_revision: 1 });
    expect(staged).toEqual([{ kind: 'layout', layout: 'linear', zoom: 1, graph_ref: 'graph-test', expected_revision: 1 }]);
    expect(current.nodes[0].position).toEqual({ x: 0, y: 0 });
  });
  it('denies invalid sessions and stale graphs before export', async () => {
    const { current, session, dependencies, runtime } = fixture();
    session.allowed_tools = [];
    await expect(runtime.execute('vad_export_review_receipt', execution)).rejects.toThrow('GATEWAY_SESSION_INVALID');
    session.allowed_tools = ['visual-algorithm'];
    current.revision = 2;
    await expect(runtime.execute('vad_export_review_receipt', execution)).rejects.toThrow('STALE_GRAPH_REVISION');
    expect(dependencies.exportReview).not.toHaveBeenCalled();
  });
  it('requires human review, exports once and rejects changed retry payloads', async () => {
    const { dependencies, runtime } = fixture();
    dependencies.requestHumanApproval.mockResolvedValueOnce(false);
    await expect(runtime.execute('vad_export_review_receipt', execution)).rejects.toThrow('HUMAN_APPROVAL_REQUIRED_OR_EXPIRED');
    expect(dependencies.exportReview).not.toHaveBeenCalled();
    const result = await runtime.execute('vad_export_review_receipt', execution);
    expect(await runtime.execute('vad_export_review_receipt', execution)).toEqual(result);
    expect(dependencies.exportReview).toHaveBeenCalledTimes(1);
    await expect(runtime.execute('vad_export_review_receipt', { ...execution, expected_revision: 2 })).rejects.toThrow('IDEMPOTENCY_PAYLOAD_MISMATCH');
  });
  it('does not reuse approval or receipt authority after a session identity changes', async () => {
    const { session, dependencies, runtime } = fixture();
    await runtime.execute('vad_export_review_receipt', execution);
    session.identity_ref = 'another-subject';
    dependencies.requestHumanApproval.mockResolvedValueOnce(false);
    await expect(runtime.execute('vad_export_review_receipt', execution)).rejects.toThrow('HUMAN_APPROVAL_REQUIRED_OR_EXPIRED');
    await expect(runtime.execute('securedme_qbit_plan_handoff', { receipt_ref: 'review-test', expected_revision: 1 })).rejects.toThrow('UNKNOWN_REVIEW_RECEIPT');
  });
  it('revalidates the graph after human review and before producing an artifact', async () => {
    const { current, dependencies, runtime } = fixture();
    dependencies.requestHumanApproval.mockImplementationOnce(async () => { current.revision++; return true; });
    await expect(runtime.execute('vad_export_review_receipt', execution)).rejects.toThrow('STALE_GRAPH_REVISION');
    expect(dependencies.exportReview).not.toHaveBeenCalled();
  });
  it('revalidates the owning session when a human applies a staged proposal', async () => {
    const { session, authorizations, runtime } = fixture();
    await runtime.execute('vad_stage_layout', { layout: 'linear', zoom: 1, expected_revision: 1 });
    session.identity_ref = 'another-subject';
    await expect(authorizations[0]()).rejects.toThrow('GATEWAY_SESSION_CHANGED');
  });
  it('awaits native registrations with the owning API receiver and lifecycle signal', async () => {
    const { runtime } = fixture();
    const life = new AbortController();
    const registry = { count: 0, async registerTool(this: { count: number }, descriptor: unknown, options: { signal: AbortSignal }) { expect(this).toBe(registry); expect(descriptor).toBeTruthy(); expect(options.signal).toBe(life.signal); this.count++; } };
    expect(await registerVadWebMcp({ modelContext: registry }, runtime, life.signal)).toBe(12);
    expect(registry.count).toBe(12);
  });
});
