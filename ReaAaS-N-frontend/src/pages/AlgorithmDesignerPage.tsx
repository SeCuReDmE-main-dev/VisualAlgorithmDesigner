import { useCallback, useMemo, useState } from 'react';
import { Box, Button, Divider, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { Edge, Node, ReactFlowProvider } from '@xyflow/react';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import AlgorithmCanvas from '../components/AlgorithmDesigner/AlgorithmCanvas';
import AlgorithmPalette from '../components/AlgorithmDesigner/AlgorithmPalette';
import AlgorithmPropertiesPanel, { toPipelinePayloadNode } from '../components/AlgorithmDesigner/AlgorithmPropertiesPanel';
import AIExplanationPanel from '../components/AlgorithmDesigner/AIExplanationPanel';
import PipelineSaveDialog from '../components/AlgorithmDesigner/PipelineSaveDialog';
import SubpipelineLibraryPanel from '../components/AlgorithmDesigner/SubpipelineLibraryPanel';
import { PipelinePromoteDialog } from '../components/AlgorithmDesigner/PipelinePromoteDialog';
import SecurityProfileSelector from '../components/AlgorithmDesigner/SecurityProfileSelector';
import { StatusBar } from '../components/AlgorithmDesigner/StatusBar';
import { TutorialOverlay } from '../components/TutorialOverlay';
import type { AlgorithmNodeData } from '../components/AlgorithmDesigner/AlgorithmNode';
import { explainPipeline, evaluatePipeline, PipelineEvaluation } from '../services/api';
import { generateComplianceReport } from '../services/complianceReportGenerator';
import { DEFAULT_SECURITY_PROFILE_ID, SecurityProfileId } from '../services/securityProfileCatalog';
import { clearSavedPipeline, loadSavedPipeline, saveCurrentPipeline, usePipelineSaver } from '../hooks/usePipelineSaver';
import { usePipelineStatus } from '../hooks/usePipelineStatus';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useLoopDetector } from '../hooks/useLoopDetector';

const PIPELINE_METADATA_KEY = 'vad_pipeline_metadata';
const FEEDBACK_KEY = 'vad_ai_feedback';

function loadInitialNodes(): Node<AlgorithmNodeData>[] {
  return (loadSavedPipeline()?.nodes ?? []) as Node<AlgorithmNodeData>[];
}

function loadInitialEdges(): Edge[] {
  return loadSavedPipeline()?.edges ?? [];
}

export default function AlgorithmDesignerPage() {
  const [nodes, setNodes] = useState<Node<AlgorithmNodeData>[]>(loadInitialNodes);
  const [edges, setEdges] = useState<Edge[]>(loadInitialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [explanation, setExplanation] = useState('');
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | undefined>();
  const [evaluation, setEvaluation] = useState<PipelineEvaluation | null>(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [paletteVisible, setPaletteVisible] = useState(true);
  const [libraryVisible, setLibraryVisible] = useState(true);
  const [securityProfile, setSecurityProfile] = useState<SecurityProfileId>(DEFAULT_SECURITY_PROFILE_ID);
  const [toast, setToast] = useState('');
  const status = usePipelineStatus(nodes, edges);
  const loops = useLoopDetector(nodes, edges);
  usePipelineSaver(nodes, edges);
  useKeyboardShortcuts({
    onTogglePalette: () => setPaletteVisible((visible) => !visible),
    onToggleLibrary: () => setLibraryVisible((visible) => !visible),
    onSave: () => setSaveOpen(true),
  });

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);
  const buildPipelinePayload = useCallback(() => ({
    nodes: nodes.map(toPipelinePayloadNode),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated,
    })),
  }), [nodes, edges]);

  const updateParam = useCallback((nodeId: string, key: string, value: unknown) => {
    setNodes((current) => {
      const index = current.findIndex((node) => node.id === nodeId);
      if (index === -1) return current;

      const newNodes = [...current];
      newNodes[index] = {
        ...newNodes[index],
        data: {
          ...newNodes[index].data,
          params: {
            ...(newNodes[index].data.params ?? {}),
            [key]: value,
          },
        },
      };
      return newNodes;
    });
  }, []);

  const runExplain = useCallback(async () => {
    if (!selectedNode) {
      return;
    }

    setExplanationLoading(true);
    setExplanationError(null);
    const startedAt = performance.now();

    try {
      const result = await explainPipeline({ ...buildPipelinePayload(), focusNodeId: selectedNode.id, securityProfile });
      setExplanation(result.explanation);
      setLatencyMs(Math.round(performance.now() - startedAt));
    } catch (error) {
      setExplanationError(error instanceof Error ? error.message : 'AI explanation failed.');
    } finally {
      setExplanationLoading(false);
    }
  }, [buildPipelinePayload, securityProfile, selectedNode]);

  const runEvaluate = useCallback(async () => {
    setEvaluationLoading(true);

    try {
      const result = await evaluatePipeline({ ...buildPipelinePayload(), securityProfile });
      setEvaluation(result);
      setToast(`Pipeline coherence: ${result.coherenceScore}%`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Pipeline evaluation failed.');
    } finally {
      setEvaluationLoading(false);
    }
  }, [buildPipelinePayload, securityProfile]);

  const generateReport = useCallback(async () => {
    const report = await generateComplianceReport({
      pipelineName: 'VAD pipeline',
      ...buildPipelinePayload(),
      securityProfile,
      evaluation: evaluation ?? undefined,
    });
    const blob = new Blob([report.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vad-compliance-${report.sha256.slice(0, 8)}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setToast(`Compliance report generated: ${report.sha256.slice(0, 12)}`);
  }, [evaluation, buildPipelinePayload, securityProfile]);

  const savePipeline = useCallback(
    (metadata: { name: string; description: string }) => {
      saveCurrentPipeline(nodes, edges);
      localStorage.setItem(PIPELINE_METADATA_KEY, JSON.stringify({ ...metadata, savedAt: Date.now() }));
      setToast('Pipeline saved locally.');
    },
    [edges, nodes],
  );

  const clearPipeline = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setExplanation('');
    setEvaluation(null);
    clearSavedPipeline();
    setToast('Canvas cleared.');
  }, []);

  const recordFeedback = useCallback(
    (rating: 'helpful' | 'unclear') => {
      const entry = {
        rating,
        selectedNodeId,
        explanation,
        createdAt: Date.now(),
      };
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(entry));
      setToast('Feedback recorded.');
    },
    [explanation, selectedNodeId],
  );

  return (
    <Box sx={{ height: '100vh', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', bgcolor: 'var(--color-bg)' }}>
      <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 900 }}>
            Algorithm Designer
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-muted)' }}>
            H2O visual pipeline canvas
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 220 }}>
            <SecurityProfileSelector value={securityProfile} onChange={setSecurityProfile} />
          </Box>
          <Button size="small" variant="outlined" onClick={() => setTutorialOpen(true)}>
            Help
          </Button>
          <Button size="small" variant="outlined" onClick={generateReport}>
            Report
          </Button>
          <Button size="small" variant="contained" disabled={!evaluation || evaluation.coherenceScore < 93} onClick={() => setPromoteOpen(true)}>
            Promote
          </Button>
        </Stack>
      </Box>
      <Box sx={{ minHeight: 0 }}>
        <PanelGroup direction="horizontal">
          {paletteVisible && (
            <>
              <Panel defaultSize={20} minSize={15} maxSize={30}>
                <Paper square sx={{ height: '100%', p: 2, overflow: 'hidden', borderRight: '1px solid var(--color-border)' }}>
                  <AlgorithmPalette />
                </Paper>
              </Panel>
              <PanelResizeHandle className="vad-resize-handle" />
            </>
          )}
          <Panel minSize={35}>
            <Box sx={{ height: '100%', minHeight: 0, position: 'relative', bgcolor: 'var(--color-canvas-bg)' }}>
              <ReactFlowProvider>
                <AlgorithmCanvas
                  nodes={nodes}
                  edges={edges}
                  setNodes={setNodes}
                  setEdges={setEdges}
                  onSelectedNodeChange={setSelectedNodeId}
                  onSaveRequested={() => setSaveOpen(true)}
                  onClearRequested={clearPipeline}
                />
              </ReactFlowProvider>
            </Box>
          </Panel>
          <PanelResizeHandle className="vad-resize-handle" />
          <Panel defaultSize={25} minSize={20} maxSize={35}>
            <Paper square sx={{ height: '100%', p: 2, overflow: 'auto', borderLeft: '1px solid var(--color-border)' }}>
              <AlgorithmPropertiesPanel
                selectedNode={selectedNode}
                status={status}
                evaluation={evaluation}
                evaluationLoading={evaluationLoading}
                onParamChange={updateParam}
                onExplain={runExplain}
                onEvaluate={runEvaluate}
              />
              <Divider sx={{ my: 2 }} />
              <AIExplanationPanel
                explanation={explanation}
                loading={explanationLoading}
                error={explanationError}
                latencyMs={latencyMs}
                focusLabel={selectedNode?.data.label}
                onFeedback={recordFeedback}
              />
            </Paper>
          </Panel>
        </PanelGroup>
      </Box>
      <Box>
        {libraryVisible && <SubpipelineLibraryPanel />}
        <StatusBar nodeCount={nodes.length} edgeCount={edges.length} latencyMs={latencyMs} hasLoop={loops.hasLoop} coherenceScore={evaluation?.coherenceScore} />
      </Box>
      <PipelineSaveDialog open={saveOpen} nodeCount={nodes.length} edgeCount={edges.length} onClose={() => setSaveOpen(false)} onSave={savePipeline} />
      <PipelinePromoteDialog open={promoteOpen} {...buildPipelinePayload()} evaluation={evaluation} onClose={() => setPromoteOpen(false)} onPromoted={() => setToast('Pipeline promoted.')} />
      <TutorialOverlay open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
      <Snackbar open={Boolean(toast)} autoHideDuration={2400} message={toast} onClose={() => setToast('')} />
    </Box>
  );
}
