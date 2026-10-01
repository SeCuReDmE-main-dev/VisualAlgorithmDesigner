import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Box, Button, Typography } from '@mui/material';
import type { Edge, Node } from '@xyflow/react';
import type { AlgorithmNodeData } from './AlgorithmDesigner/AlgorithmNode';
import { buildAlgorithmNode } from './AlgorithmDesigner/AlgorithmCanvas';
import { getAlgorithmById } from '../services/algorithmCatalog';
import { SUBPIPELINE_CATALOG, LOOP_CATALOG, SECURITY_TEMPLATE_CATALOG } from '../services/subpipelineCatalog';
import type { GraphMutation } from '../hooks/useGraphHistory';
import { createVadWebMcpRuntime, registerVadWebMcp, type VadGraphSnapshot, type VadProposal } from '../services/webMcpTools';
import { loadVadGatewaySession } from '../services/vadGatewaySession';
import { requestVadHumanReview } from '../services/vadHumanReview';

interface Props {
  nodes: Node<AlgorithmNodeData>[];
  edges: Edge[];
  commit: (mutation: GraphMutation<Node<AlgorithmNodeData>>) => void;
  context: Record<string, unknown>;
}
type PendingProposal = { proposal: VadProposal; authorize: () => Promise<void> };

export function VadWebMcpBridge(props: Props) {
  const latest = useRef(props);
  latest.current = props;
  const graph = useRef<VadGraphSnapshot>({ graph_ref: `vad:${crypto.randomUUID()}`, revision: 1, nodes: props.nodes, edges: props.edges });
  if (graph.current.nodes !== props.nodes || graph.current.edges !== props.edges) {
    graph.current = { graph_ref: graph.current.graph_ref, revision: graph.current.revision + 1, nodes: props.nodes, edges: props.edges };
  }
  const [pending, setPending] = useState<PendingProposal | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [annotation, setAnnotation] = useState('');
  const [handoff, setHandoff] = useState('');

  useEffect(() => {
    const lifetime = new AbortController();
    const analytics = (window as Window & { SecuredMePublicAnalytics?: { setPrivate: (value: boolean) => void } }).SecuredMePublicAnalytics;
    analytics?.setPrivate(true);
    const runtime = createVadWebMcpRuntime({
      readGraph: () => graph.current,
      readContext: () => ({ ...latest.current.context, canonical_state_owner: 'algoquest', authority: 'visual-design-only' }),
      listPrefabs: () => [...SUBPIPELINE_CATALOG, ...LOOP_CATALOG, ...SECURITY_TEMPLATE_CATALOG].map(item => ({ id: item.id, label: item.label, category: item.category })),
      stageProposal: (proposal, authorize) => { setPending({ proposal, authorize }); setMessage(''); },
      loadSession: loadVadGatewaySession,
      requestHumanApproval: requestVadHumanReview,
      exportReview: async () => {
        const snapshot = graph.current;
        const receipt_id = `vad-review:${crypto.randomUUID()}`;
        const artifact_name = receipt_id.replace(':', '-') + '.json';
        const artifact = { schema: 'securedme.education.vad-graph-review.v1', receipt_id,
          graph_ref: snapshot.graph_ref, revision: snapshot.revision,
          nodes: snapshot.nodes, edges: snapshot.edges, evidence_decision: 'pending_algoquest_review',
          canonical_state_owner: 'algoquest', exported_at: new Date().toISOString() };
        const body = JSON.stringify(artifact, null, 2);
        if (body.length > 1048576) throw new Error('REVIEW_ARTIFACT_TOO_LARGE');
        const url = URL.createObjectURL(new Blob([body], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url; link.download = artifact_name;
        document.body.append(link); link.click(); link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMessage('Export local demandé. Vérifiez le fichier téléchargé avant de le partager.');
        return { receipt_id, artifact_name, download_requested: true };
      },
      prepareHandoff: async (receipt_id) => {
        setHandoff(receipt_id);
        return { prepared: true, receipt_id, displayed_in_designer: true, dispatched: false, canonical_state_owner: 'algoquest' };
      },
    });
    void registerVadWebMcp(document, runtime, lifetime.signal).catch(() => {
      lifetime.abort();
      console.warn('VAD WebMCP unavailable; the normal designer remains usable.');
    });
    return () => lifetime.abort();
  }, []);

  async function applyProposal(value: PendingProposal) {
    setBusy(true);
    try {
      await value.authorize();
      const snapshot = graph.current;
      const proposal = value.proposal;
      if (snapshot.graph_ref !== proposal.graph_ref || snapshot.revision !== proposal.expected_revision) throw new Error('STALE_GRAPH_REVISION');
      if (proposal.kind === 'prefab' || proposal.kind === 'layout') {
        let added: Node<AlgorithmNodeData>[] = [];
        if (proposal.kind === 'prefab') {
          added = (proposal.transaction?.nodes || []).map(node => {
            const algorithmId = String((node.data as Record<string, unknown>).algorithmId || '');
            if (!getAlgorithmById(algorithmId)) throw new Error('UNSUPPORTED_PREFAB_ALGORITHM');
            return { ...buildAlgorithmNode(algorithmId, node.position), id: node.id };
          });
          if (added.some(node => snapshot.nodes.some(existing => existing.id === node.id))) throw new Error('PREFAB_ID_COLLISION');
        }
        let applied = false;
        flushSync(() => latest.current.commit(current => {
          if (current.nodes !== snapshot.nodes || current.edges !== snapshot.edges) return current;
          applied = true;
          if (proposal.kind === 'prefab') return { nodes: [...current.nodes, ...added], edges: [...current.edges, ...(proposal.transaction?.edges || [])] };
          return { ...current, nodes: current.nodes.map((node, index) => ({ ...node, position: proposal.layout === 'linear'
            ? { x: index * 300, y: 0 }
            : { x: Math.cos(index * Math.PI * 2 / Math.max(current.nodes.length, 1)) * 350, y: Math.sin(index * Math.PI * 2 / Math.max(current.nodes.length, 1)) * 350 } })) };
        }));
        if (!applied) throw new Error('STALE_GRAPH_REVISION');
        if (proposal.kind === 'layout') window.dispatchEvent(new CustomEvent('vad:webmcp-zoom', { detail: { zoom: proposal.zoom } }));
      } else if (proposal.kind === 'annotation') setAnnotation(proposal.note || '');
      else setHandoff(proposal.receipt_ref || '');
      setPending(null);
      setMessage('Proposition appliquée dans le designer. Aucun changement de progression AlgoQuest.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'WEBMCP_PROPOSAL_FAILED'); }
    finally { setBusy(false); }
  }

  if (!pending && !message && !annotation && !handoff) return null;
  return <Box role="region" aria-label="VAD WebMCP proposals" sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1500, maxWidth: 'min(30rem, 90vw)', maxHeight: '60vh', overflow: 'auto', bgcolor: 'background.paper', color: 'text.primary', p: 2, border: '2px solid #7465ef', borderRadius: 2 }}>
    <Typography fontWeight={800}>Proposition WebMCP</Typography>
    {pending && <><Typography>{pending.proposal.kind} · révision {pending.proposal.expected_revision}</Typography>
      <Typography sx={{ overflowWrap: 'anywhere' }}>{pending.proposal.note || pending.proposal.receipt_ref || (pending.proposal.kind === 'prefab' ? `${pending.proposal.transaction?.nodes.length} blocs` : `${pending.proposal.layout} · zoom ${pending.proposal.zoom}`)}</Typography>
      <Button disabled={busy} onClick={() => setPending(null)}>Refuser</Button>
      <Button disabled={busy} onClick={event => { if (event.nativeEvent.isTrusted) void applyProposal(pending); }}>Appliquer cette proposition</Button></>}
    {message && <Typography role="status">{message}</Typography>}
    {annotation && <Typography sx={{ overflowWrap: 'anywhere' }}>Annotation privée : {annotation}</Typography>}
    {handoff && <Typography sx={{ overflowWrap: 'anywhere' }}>Référence Qbit préparée : {handoff}</Typography>}
    {!pending && <Button onClick={() => { setMessage(''); setAnnotation(''); setHandoff(''); }}>Fermer</Button>}
  </Box>;
}
