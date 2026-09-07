import { preparePrefabTransaction, type PrefabInput } from './prefabTransaction';

export type VadWebMcpMode = 'READ' | 'STAGE' | 'EXECUTE';
export interface VadWebMcpTool { name: string; mode: VadWebMcpMode; description: string; inputSchema: Record<string, unknown>; handler: (input: Record<string, unknown>) => unknown | Promise<unknown>; }

const unsafe = /(password|cookie|authorization|access_token|client_secret|raw_prompt|student_email)/i;
function sanitized(input: Record<string, unknown>): Record<string, unknown> { if (unsafe.test(JSON.stringify(input))) throw new Error('SECRET_OR_PERSONAL_DATA_REJECTED'); return input; }
function graph(input: Record<string, unknown>): PrefabInput { const value = sanitized(input); return { nodes: Array.isArray(value.nodes) ? value.nodes as PrefabInput['nodes'] : [], edges: Array.isArray(value.edges) ? value.edges as PrefabInput['edges'] : [] }; }
type HumanApproval = { tool_name: string; audience: string; nonce: string; expires_at: number; human_confirmed: true };
const EXECUTE_TOOLS = new Set(['vad_export_review_receipt', 'vad_prepare_qbit_handoff']);
const issuedApprovals = new Map<string, HumanApproval>();
const idempotentResults = new Map<string, unknown | Promise<unknown>>();

/** A visible human control, not an agent, mints this one-use approval. */
export function grantVadOneUseApproval(tool_name: string, audience: string, nonce: string, expires_at: number): HumanApproval {
  if (!EXECUTE_TOOLS.has(tool_name) || !audience || !nonce || !Number.isFinite(expires_at) || expires_at <= Date.now()) throw new Error('INVALID_HUMAN_APPROVAL');
  const approval: HumanApproval = { tool_name, audience, nonce, expires_at, human_confirmed: true };
  issuedApprovals.set(nonce, approval);
  return approval;
}
function executeWithApproval(toolName: string, input: Record<string, unknown>, operation: () => unknown | Promise<unknown>): unknown | Promise<unknown> {
  const value = sanitized(input);
  const key = typeof value.idempotencyKey === 'string' ? value.idempotencyKey : '';
  if (!/^[a-z0-9_-]{12,128}$/i.test(key)) throw new Error('IDEMPOTENCY_KEY_REQUIRED');
  const resultKey = `${toolName}:${key}`;
  if (idempotentResults.has(resultKey)) return idempotentResults.get(resultKey)!;
  const approval = value.approval as Partial<HumanApproval> | undefined;
  const issued = approval?.nonce ? issuedApprovals.get(approval.nonce) : undefined;
  if (!issued || !approval || issued.tool_name !== toolName || issued.audience !== value.audience || issued.expires_at <= Date.now() || approval.human_confirmed !== true) throw new Error('HUMAN_APPROVAL_REQUIRED_OR_EXPIRED');
  issuedApprovals.delete(issued.nonce);
  const result = operation();
  idempotentResults.set(resultKey, result);
  return result;
}
const approvalSchema = { type: 'object', properties: { tool_name: { type: 'string' }, audience: { type: 'string' }, nonce: { type: 'string' }, expires_at: { type: 'number' }, human_confirmed: { const: true } }, required: ['tool_name', 'audience', 'nonce', 'expires_at', 'human_confirmed'], additionalProperties: false };
function valueSchema(key: string): Record<string, unknown> {
  if (['companion_context', 'context'].includes(key)) return { type: 'object' };
  if (['nodes', 'edges'].includes(key)) return { type: 'array' };
  if (key === 'zoom') return { type: 'number' };
  return { type: 'string' };
}
function closedToolSchema(tool: VadWebMcpTool): Record<string, unknown> {
  const properties = Object.fromEntries(Object.keys(tool.inputSchema).map((key) => [key, valueSchema(key)]));
  return { type: 'object', properties: { ...properties, approval: approvalSchema, audience: { type: 'string', minLength: 1 }, idempotencyKey: { type: 'string', pattern: '^[A-Za-z0-9_-]{12,128}$' } }, required: tool.mode === 'EXECUTE' ? [...Object.keys(tool.inputSchema), 'approval', 'audience', 'idempotencyKey'] : Object.keys(tool.inputSchema), additionalProperties: false };
}

/** VAD exposes visual-design assistance only. It is never a mission, evidence,
 * token, or learning-authority surface. */
export const VAD_WEBMCP_TOOLS: VadWebMcpTool[] = ([
  { name: 'vad_inspect_canvas', mode: 'READ', description: 'Inspect a sanitized visual algorithm graph.', inputSchema: { nodes: 'array', edges: 'array' }, handler: (input) => { const value = graph(input); return { node_count: value.nodes.length, edge_count: value.edges.length, raw_secret_stored: false }; } },
  { name: 'vad_list_safe_prefabs', mode: 'READ', description: 'List safe visual-prefab categories.', inputSchema: {}, handler: () => ({ prefabs: ['condition', 'loop', 'function', 'structure', 'comparison'], unavailable: ['credential-processing', 'malware-automation'] }) },
  { name: 'vad_inspect_specialist_context', mode: 'READ', description: 'Read an AlgoQuest-provided sanitized companion projection.', inputSchema: { companion_context: 'object' }, handler: (input) => ({ companion_context: sanitized(input).companion_context || null, canonical_state_owner: 'algoquest' }) },
  { name: 'vad_validate_prefab', mode: 'READ', description: 'Validate a graph prefab without mutation.', inputSchema: { nodes: 'array', edges: 'array' }, handler: (input) => preparePrefabTransaction(graph(input), (kind, original, index) => `${kind}-${original}-${index}`) },
  { name: 'vad_stage_prefab', mode: 'STAGE', description: 'Stage a cloned visual prefab; the caller chooses whether to apply it.', inputSchema: { nodes: 'array', edges: 'array' }, handler: (input) => { const result = preparePrefabTransaction(graph(input), (kind, original, index) => `staged-${kind}-${original}-${index}`); return result.ok ? { staged: true, transaction: result.transaction } : result; } },
  { name: 'vad_stage_layout', mode: 'STAGE', description: 'Stage a layout preference without changing a learning mission.', inputSchema: { layout: 'radial|linear', zoom: 'number' }, handler: (input) => { const value = sanitized(input); const layout = value.layout === 'linear' ? 'linear' : 'radial'; const zoom = Number(value.zoom ?? 1); if (!Number.isFinite(zoom) || zoom < 0.25 || zoom > 2) throw new Error('INVALID_ZOOM'); return { staged: true, layout, zoom }; } },
  { name: 'vad_stage_visual_annotation', mode: 'STAGE', description: 'Stage a short non-sensitive graph annotation.', inputSchema: { note: 'string' }, handler: (input) => { const note = String(sanitized(input).note || '').trim(); if (!note || note.length > 280) throw new Error('INVALID_ANNOTATION'); return { staged: true, note }; } },
  { name: 'vad_export_review_receipt', mode: 'EXECUTE', description: 'Produce an opaque visual review receipt for AlgoQuest to review.', inputSchema: { graph_ref: 'opaque string' }, handler: (input) => executeWithApproval('vad_export_review_receipt', input, () => { const graphRef = String(sanitized(input).graph_ref || ''); if (!/^[a-z0-9:_-]{3,160}$/i.test(graphRef)) throw new Error('INVALID_GRAPH_REFERENCE'); return { schema: 'securedme.education.vad-review-receipt.v1', receipt_id: `vad-review:${graphRef}`, graph_ref: graphRef, source_app: 'visual-algorithm', target_app: 'algoquest', canonical_state_owner: 'algoquest', raw_payload_embedded: false, raw_secret_stored: false }; }) },
  { name: 'vad_prepare_qbit_handoff', mode: 'EXECUTE', description: 'Prepare an opaque Qbit return pointer without changing progression.', inputSchema: { receipt_id: 'opaque string' }, handler: (input) => executeWithApproval('vad_prepare_qbit_handoff', input, () => { const receipt = String(sanitized(input).receipt_id || ''); if (!/^[a-z0-9:_-]{3,180}$/i.test(receipt)) throw new Error('INVALID_RECEIPT_REFERENCE'); return { handoff_id: `qbit:${receipt}`, return_channel: 'qbit-plan-handoff', canonical_state_owner: 'algoquest', raw_payload_embedded: false }; }) },
  { name: 'vad_get_specialist_status', mode: 'READ', description: 'Report the bounded VAD specialist status.', inputSchema: {}, handler: () => ({ specialist: 'Visual Algorithm Designer', persona: 'spatial visualisation coach', authority: 'proposal-and-receipt-only', canonical_state_owner: 'algoquest' }) },
  { name: 'securedme_companion_context', mode: 'READ', description: 'Read the sanitized companion context supplied by AlgoQuest.', inputSchema: { context: 'object' }, handler: (input) => ({ context: sanitized(input).context || null, canonical_state_owner: 'algoquest', raw_secret_stored: false }) },
  { name: 'securedme_qbit_plan_handoff', mode: 'STAGE', description: 'Stage a Qbit return plan without changing progression.', inputSchema: { receipt_ref: 'opaque string' }, handler: (input) => ({ staged: true, receipt_ref: String(sanitized(input).receipt_ref || ''), return_channel: 'qbit-plan-handoff', canonical_state_owner: 'algoquest' }) },
 ] as VadWebMcpTool[]).map((tool): VadWebMcpTool => ({
  ...tool,
  inputSchema: closedToolSchema(tool),
}));

export function executeVadWebMcp(name: string, input: Record<string, unknown> = {}): unknown | Promise<unknown> { const tool = VAD_WEBMCP_TOOLS.find((candidate) => candidate.name === name); if (!tool) throw new Error('UNKNOWN_WEBMCP_TOOL'); return tool.handler(input); }
export function registerVadWebMcp(target: unknown = typeof document === 'undefined' ? null : document): number { const registry = (target as { modelContext?: { registerTool?: (tool: unknown) => void } } | null)?.modelContext?.registerTool; if (!registry) return 0; VAD_WEBMCP_TOOLS.forEach((tool) => registry({ name: tool.name, description: tool.description, inputSchema: tool.inputSchema, execute: tool.handler })); return VAD_WEBMCP_TOOLS.length; }
