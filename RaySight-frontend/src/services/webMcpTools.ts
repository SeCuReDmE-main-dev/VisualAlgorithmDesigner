import { preparePrefabTransaction, type PrefabInput } from './prefabTransaction';

export type VadWebMcpMode = 'READ' | 'STAGE' | 'EXECUTE';
type Schema = { type?: string; const?: unknown; enum?: unknown[]; properties?: Record<string, Schema>; required?: string[]; additionalProperties?: boolean; items?: Schema; minLength?: number; maxLength?: number; minimum?: number; maximum?: number; maxItems?: number; pattern?: string };
export interface VadWebMcpTool { name: string; mode: VadWebMcpMode; description: string; inputSchema: Schema; }
export interface VadGraphSnapshot {
  graph_ref: string; revision: number;
  nodes: PrefabInput['nodes'];
  edges: readonly { id: string; source: string; target: string }[];
}
export type VadProposal = { kind: 'prefab' | 'layout' | 'annotation' | 'handoff'; graph_ref: string; expected_revision: number; transaction?: PrefabInput; layout?: 'radial' | 'linear'; zoom?: number; note?: string; receipt_ref?: string };
export interface VadReview { tool: string; input: Record<string, unknown>; signal?: AbortSignal; }
export interface VadWebMcpDependencies {
  readGraph: () => VadGraphSnapshot;
  listPrefabs: () => unknown[];
  readContext: () => Record<string, unknown>;
  stageProposal: (proposal: VadProposal, authorize: () => Promise<void>) => void;
  exportReview: () => Promise<{ receipt_id: string; artifact_name: string; download_requested: boolean }>;
  prepareHandoff: (receipt_id: string) => Promise<Record<string, unknown>>;
  loadSession: () => Promise<unknown>;
  requestHumanApproval: (review: VadReview) => Promise<boolean>;
}
const text = (maxLength = 160): Schema => ({ type: 'string', minLength: 1, maxLength });
const object = (properties: Record<string, Schema> = {}): Schema => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const revision = { expected_revision: { type: 'integer', minimum: 1 } as Schema };
const graphFields = { nodes: { type: 'array', maxItems: 100, items: { type: 'object' } } as Schema, edges: { type: 'array', maxItems: 200, items: { type: 'object' } } as Schema };
const execution = {
  ...revision, graph_ref: text(), audience: { type: 'string', const: 'visual-algorithm' } as Schema,
  approval: object({ request_human_review: { type: 'boolean', const: true } }),
  idempotencyKey: { ...text(128), minLength: 12, pattern: '^[A-Za-z0-9_-]+$' },
};

/** VAD owns visual design only. AlgoQuest retains learning and evidence authority. */
export const VAD_WEBMCP_TOOLS: VadWebMcpTool[] = [
  { name: 'vad_inspect_canvas', mode: 'READ', description: 'Read the visible graph counts and revision, not a caller-supplied graph.', inputSchema: object() },
  { name: 'vad_list_safe_prefabs', mode: 'READ', description: 'List the actual prefab catalog used by the current designer.', inputSchema: object() },
  { name: 'vad_inspect_specialist_context', mode: 'READ', description: 'Read the current designer context without learner identity or raw parameters.', inputSchema: object() },
  { name: 'vad_validate_prefab', mode: 'READ', description: 'Validate a bounded prefab using the real graph transaction validator.', inputSchema: object(graphFields) },
  { name: 'vad_stage_prefab', mode: 'STAGE', description: 'Show a validated prefab proposal for the human to apply through the graph history.', inputSchema: object({ ...graphFields, ...revision }) },
  { name: 'vad_stage_layout', mode: 'STAGE', description: 'Show a linear or radial layout proposal for the visible graph.', inputSchema: object({ layout: { type: 'string', enum: ['radial', 'linear'] }, zoom: { type: 'number', minimum: .25, maximum: 2 }, ...revision }) },
  { name: 'vad_stage_visual_annotation', mode: 'STAGE', description: 'Show a short private designer annotation for human review.', inputSchema: object({ note: text(280), ...revision }) },
  { name: 'vad_export_review_receipt', mode: 'EXECUTE', description: 'After visible human review, download an actual current-graph review artifact.', inputSchema: object(execution) },
  { name: 'vad_prepare_qbit_handoff', mode: 'EXECUTE', description: 'After visible human review, prepare a private pointer to a review exported in this session.', inputSchema: object({ ...execution, receipt_id: text() }) },
  { name: 'vad_get_specialist_status', mode: 'READ', description: 'Read the bounded specialist status of the current designer.', inputSchema: object() },
  { name: 'securedme_companion_context', mode: 'READ', description: 'Read the shared context from the current designer, without progression authority.', inputSchema: object() },
  { name: 'securedme_qbit_plan_handoff', mode: 'STAGE', description: 'Show a handoff proposal for a review exported in this session; do not dispatch it.', inputSchema: object({ receipt_ref: text(), ...revision }) },
];

function validate(schema: Schema, value: unknown): void {
  if (schema.const !== undefined && value !== schema.const || schema.enum && !schema.enum.includes(value)) throw new Error('INVALID_WEBMCP_INPUT');
  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID_WEBMCP_INPUT');
    const record = value as Record<string, unknown>;
    for (const key of schema.required || []) if (!Object.prototype.hasOwnProperty.call(record, key)) throw new Error('INVALID_WEBMCP_INPUT');
    for (const key of Object.keys(record)) {
      if (schema.additionalProperties === false && !Object.prototype.hasOwnProperty.call(schema.properties || {}, key)) throw new Error('INVALID_WEBMCP_INPUT');
      if (schema.properties?.[key]) validate(schema.properties[key], record[key]);
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(value) || value.length > (schema.maxItems ?? Infinity)) throw new Error('INVALID_WEBMCP_INPUT');
    if (schema.items) value.forEach(item => validate(schema.items!, item));
  } else if (schema.type === 'string') {
    if (typeof value !== 'string' || value.length < (schema.minLength || 0) || value.length > (schema.maxLength ?? Infinity) || schema.pattern && !new RegExp(schema.pattern).test(value)) throw new Error('INVALID_WEBMCP_INPUT');
  } else if (schema.type === 'number' || schema.type === 'integer') {
    if (typeof value !== 'number' || !Number.isFinite(value) || schema.type === 'integer' && !Number.isSafeInteger(value) || value < (schema.minimum ?? -Infinity) || value > (schema.maximum ?? Infinity)) throw new Error('INVALID_WEBMCP_INPUT');
  } else if (schema.type === 'boolean' && typeof value !== 'boolean') throw new Error('INVALID_WEBMCP_INPUT');
}
export interface VadGatewaySession {
  session_id: string; identity_ref: string; expires_at: string;
  schema: string; raw_secret_stored: boolean; role: string;
  allowed_tools: string[]; authorization_basis: { decision: string };
}
export function requireVadSession(value: unknown): asserts value is VadGatewaySession {
  const session = value as Partial<VadGatewaySession> | null;
  const expiry = Date.parse(session?.expires_at || '');
  if (session?.schema !== 'securedme.education.session.v2' || session.raw_secret_stored !== false || !session.session_id || !session.identity_ref || session.authorization_basis?.decision !== 'allow' || !Array.isArray(session.allowed_tools) || !session.allowed_tools.includes('visual-algorithm') || !['student_minor', 'student_adult', 'teacher'].includes(session.role || '') || !Number.isFinite(expiry) || expiry <= Date.now()) throw new Error('GATEWAY_SESSION_INVALID');
}
function canonical(value: unknown, depth = 0): string {
  if (depth > 16) throw new Error('INVALID_WEBMCP_INPUT');
  if (Array.isArray(value)) return '[' + value.map(item => canonical(item, depth + 1)).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => JSON.stringify(key) + ':' + canonical(item, depth + 1)).join(',') + '}';
  return JSON.stringify(value) ?? 'null';
}

export function createVadWebMcpRuntime(dependencies: VadWebMcpDependencies) {
  const completed = new Map<string, { signature: string; result: unknown }>();
  const pending = new Set<string>();
  const receipts = new Map<string, { owner: string; graph_ref: string; revision: number }>();
  return { async execute(name: string, input: Record<string, unknown> = {}, signal?: AbortSignal): Promise<unknown> {
    const descriptor = VAD_WEBMCP_TOOLS.find(tool => tool.name === name);
    if (!descriptor) throw new Error('UNKNOWN_WEBMCP_TOOL');
    validate(descriptor.inputSchema, input);
    const signature = canonical(input);
    if (signature.length > 65536 || /(password|cookie|authorization|access_token|client_secret|raw_prompt|student_email)/i.test(signature)) throw new Error('SECRET_OR_PERSONAL_DATA_REJECTED');
    signal?.throwIfAborted();
    if (name === 'vad_list_safe_prefabs') return { prefabs: dependencies.listPrefabs() };
    const session = await dependencies.loadSession();
    requireVadSession(session);
    signal?.throwIfAborted();
    const owner = canonical([session.session_id, session.identity_ref]);
    // Keep the reference and revision captured before asynchronous human review.
    // A host may mutate its snapshot object in place while that review is open.
    const graph = { ...dependencies.readGraph() };
    if (name === 'vad_inspect_canvas') return { node_count: graph.nodes.length, edge_count: graph.edges.length, graph_ref: graph.graph_ref, revision: graph.revision };
    if (name === 'vad_inspect_specialist_context' || name === 'securedme_companion_context') return dependencies.readContext();
    if (name === 'vad_get_specialist_status') return { specialist: 'Visual Algorithm Designer', graph_ref: graph.graph_ref, revision: graph.revision, authority: 'visual-design-only', canonical_state_owner: 'algoquest' };
    const validatePrefab = () => preparePrefabTransaction(input as unknown as PrefabInput, (kind, id, index) => `staged-${kind}-${id}-${index}`);
    if (name === 'vad_validate_prefab') return validatePrefab();
    const key = canonical([owner, name, input.idempotencyKey]);
    const cached = descriptor.mode === 'EXECUTE' ? completed.get(key) : undefined;
    if (cached) {
      if (cached.signature !== signature) throw new Error('IDEMPOTENCY_PAYLOAD_MISMATCH');
      return cached.result;
    }
    if (input.expected_revision !== graph.revision) throw new Error('STALE_GRAPH_REVISION');
    const receiptId = String(input.receipt_id || input.receipt_ref || '');
    if (receiptId) {
      const receipt = receipts.get(receiptId);
      if (!receipt || receipt.owner !== owner || receipt.graph_ref !== graph.graph_ref || receipt.revision !== graph.revision) throw new Error('UNKNOWN_REVIEW_RECEIPT');
    }
    if (descriptor.mode === 'STAGE') {
      const proposal: VadProposal = { kind: 'annotation', graph_ref: graph.graph_ref, expected_revision: graph.revision };
      if (name === 'vad_stage_prefab') {
        const result = validatePrefab();
        if (!result.ok) return result;
        proposal.kind = 'prefab'; proposal.transaction = result.transaction;
      } else if (name === 'vad_stage_layout') {
        proposal.kind = 'layout'; proposal.layout = input.layout as 'radial' | 'linear'; proposal.zoom = Number(input.zoom);
      } else if (name === 'vad_stage_visual_annotation') proposal.note = String(input.note);
      else { proposal.kind = 'handoff'; proposal.receipt_ref = receiptId; }
      dependencies.stageProposal(proposal, async () => {
        signal?.throwIfAborted();
        const refreshed = await dependencies.loadSession();
        requireVadSession(refreshed);
        if (canonical([refreshed.session_id, refreshed.identity_ref]) !== owner) throw new Error('GATEWAY_SESSION_CHANGED');
        const current = dependencies.readGraph();
        if (current.graph_ref !== graph.graph_ref || current.revision !== graph.revision) throw new Error('STALE_GRAPH_REVISION');
        signal?.throwIfAborted();
      });
      return { staged: true, proposal, applied: false, dispatched: false };
    }
    if (input.graph_ref !== graph.graph_ref) throw new Error('GRAPH_REFERENCE_MISMATCH');
    if (pending.has(key)) throw new Error('WEBMCP_REVIEW_ALREADY_PENDING');
    pending.add(key);
    try {
      if (!await dependencies.requestHumanApproval({ tool: name, input: JSON.parse(signature), signal })) throw new Error('HUMAN_APPROVAL_REQUIRED_OR_EXPIRED');
      signal?.throwIfAborted();
      const refreshed = await dependencies.loadSession();
      requireVadSession(refreshed);
      if (canonical([refreshed.session_id, refreshed.identity_ref]) !== owner) throw new Error('GATEWAY_SESSION_CHANGED');
      const current = dependencies.readGraph();
      if (current.graph_ref !== graph.graph_ref || current.revision !== graph.revision) throw new Error('STALE_GRAPH_REVISION');
      let result: unknown;
      if (name === 'vad_export_review_receipt') {
        const artifact = await dependencies.exportReview();
        if (!artifact.receipt_id || !artifact.artifact_name || !artifact.download_requested) throw new Error('REVIEW_EXPORT_FAILED');
        receipts.set(artifact.receipt_id, { owner, graph_ref: graph.graph_ref, revision: graph.revision });
        result = { ...artifact, graph_ref: graph.graph_ref, revision: graph.revision, evidence_decision: 'pending_algoquest_review', canonical_state_owner: 'algoquest' };
      } else result = await dependencies.prepareHandoff(receiptId);
      completed.set(key, { signature, result });
      return result;
    } finally { pending.delete(key); }
  } };
}
export type VadWebMcpRuntime = ReturnType<typeof createVadWebMcpRuntime>;

export async function registerVadWebMcp(target: unknown = typeof document === 'undefined' ? null : document, runtime?: VadWebMcpRuntime, signal?: AbortSignal): Promise<number> {
  const api = (target as { modelContext?: { registerTool: (descriptor: unknown, options: { signal?: AbortSignal }) => Promise<void> } } | null)?.modelContext;
  if (!api?.registerTool || !runtime || signal?.aborted) return 0;
  for (const tool of VAD_WEBMCP_TOOLS) {
    signal?.throwIfAborted();
    await api.registerTool({ name: tool.name, description: tool.description, inputSchema: tool.inputSchema,
      annotations: { readOnlyHint: tool.mode === 'READ', consequentialHint: tool.mode === 'EXECUTE' },
      execute: (input: Record<string, unknown>, options: { signal?: AbortSignal } = {}) => runtime.execute(tool.name, input, signal && options.signal ? AbortSignal.any([signal, options.signal]) : options.signal || signal),
    }, { signal });
  }
  return VAD_WEBMCP_TOOLS.length;
}
