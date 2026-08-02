import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Divider, Paper, Snackbar, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Edge, Node, ReactFlowProvider } from '@xyflow/react';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import AlgorithmCanvas, { buildAlgorithmNode } from '../components/AlgorithmDesigner/AlgorithmCanvas';
import AlgorithmPalette from '../components/AlgorithmDesigner/AlgorithmPalette';
import AlgorithmPropertiesPanel, { toPipelinePayloadNode } from '../components/AlgorithmDesigner/AlgorithmPropertiesPanel';
import AIExplanationPanel from '../components/AlgorithmDesigner/AIExplanationPanel';
import PipelineSaveDialog from '../components/AlgorithmDesigner/PipelineSaveDialog';
import SubpipelineLibraryPanel from '../components/AlgorithmDesigner/SubpipelineLibraryPanel';
import H2OParameterPalette from '../components/AlgorithmDesigner/H2OParameterPalette';
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
import { VADBrandMark } from '../components/Brand/VADBrand';
import { useGraphHistory } from '../hooks/useGraphHistory';
import { FEATURE_FLAGS } from '../config/featureFlags';

const PIPELINE_METADATA_KEY = 'vad_pipeline_metadata';
const FEEDBACK_KEY = 'vad_ai_feedback';

function loadInitialNodes(): Node<AlgorithmNodeData>[] {
  return (loadSavedPipeline()?.nodes ?? []) as Node<AlgorithmNodeData>[];
}

function loadInitialEdges(): Edge[] {
  return loadSavedPipeline()?.edges ?? [];
}

interface AlgorithmDesignerPageProps {
  backendOnline?: boolean | null;
}

type WorkbenchSection = 'explore' | 'build' | 'connect' | 'explain' | 'history';

export default function AlgorithmDesignerPage({ backendOnline }: AlgorithmDesignerPageProps) {
  const initialGraph = useMemo(() => ({ nodes: loadInitialNodes(), edges: loadInitialEdges() }), []);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    commit: commitGraphMutation,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useGraphHistory<Node<AlgorithmNodeData>>(initialGraph);
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
  const [compactPaletteMode, setCompactPaletteMode] = useState<'algorithms' | 'prefabs' | 'h2o'>('algorithms');
  const [activeSection, setActiveSection] = useState<WorkbenchSection>('explore');
  const [securityProfile, setSecurityProfile] = useState<SecurityProfileId>(DEFAULT_SECURITY_PROFILE_ID);
  const [toast, setToast] = useState('');
  const palettePaneRef = useRef<HTMLDivElement | null>(null);
  const canvasPaneRef = useRef<HTMLDivElement | null>(null);
  const inspectorPaneRef = useRef<HTMLDivElement | null>(null);
  const historyControlsRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const compactLayout = useMediaQuery(theme.breakpoints.down('md'));
  const status = usePipelineStatus(nodes, edges);
  const loops = useLoopDetector(nodes, edges);
  usePipelineSaver(nodes, edges);
  useKeyboardShortcuts({
    onTogglePalette: () => setPaletteVisible((visible) => !visible),
    onToggleLibrary: () => setCompactPaletteMode((mode) => mode === 'algorithms' ? 'prefabs' : 'algorithms'),
    onSave: () => setSaveOpen(true),
    onUndo: undo,
    onRedo: redo,
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
    commitGraphMutation((current) => {
      const index = current.nodes.findIndex((node) => node.id === nodeId);
      if (index === -1) return current;

      const newNodes = [...current.nodes];
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
      return { ...current, nodes: newNodes };
    });
  }, [commitGraphMutation]);

  const runExplain = useCallback(async () => {
    if (!FEATURE_FLAGS.annexes) {
      setToast('RaySight is preserved but unavailable until Gate 2 opens.');
      return;
    }
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
    if (!FEATURE_FLAGS.promotion) {
      setToast('Evaluation and promotion are preserved but unavailable until Gate 4 opens.');
      return;
    }
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
    link.download = `vad-review-${report.sha256.slice(0, 8)}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setToast(`Review report generated: ${report.sha256.slice(0, 12)}`);
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
    commitGraphMutation(() => ({ nodes: [], edges: [] }));
    setSelectedNodeId(null);
    setExplanation('');
    setEvaluation(null);
    clearSavedPipeline();
    setToast('Canvas cleared.');
  }, [commitGraphMutation]);

  const deleteSelected = useCallback(() => {
    if (!selectedNodeId) return;
    commitGraphMutation((current) => ({
      nodes: current.nodes.filter((node) => node.id !== selectedNodeId),
      edges: current.edges.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId),
    }));
    setSelectedNodeId(null);
    setToast('Selected block deleted.');
  }, [commitGraphMutation, selectedNodeId]);

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

  const completeSuggestedWorkflow = useCallback(() => {
    commitGraphMutation((current) => {
      const nextNodes = [...current.nodes];
      const findByAlgorithm = (algorithmId: string) => nextNodes.find((node) => node.data.algorithmId === algorithmId);
      const ensureNode = (algorithmId: string, position: { x: number; y: number }) => {
        const existing = findByAlgorithm(algorithmId);
        if (existing) return existing;
        const created = buildAlgorithmNode(algorithmId, position);
        nextNodes.push(created);
        return created;
      };

      const existingSorting = findByAlgorithm('sorting');
      const existingRecommendation = findByAlgorithm('recommendation');
      const base = existingSorting?.position ?? { x: 0, y: 0 };
      const sorting = ensureNode('sorting', base);
      const recommendation = ensureNode('recommendation', { x: base.x + 600, y: base.y });
      const midpoint = existingSorting && existingRecommendation
        ? {
            x: (existingSorting.position.x + existingRecommendation.position.x) / 2,
            y: (existingSorting.position.y + existingRecommendation.position.y) / 2,
          }
        : { x: base.x + 300, y: base.y };
      const search = ensureNode('search', midpoint);
      const chainNodeIds = new Set([sorting.id, search.id, recommendation.id]);
      let nextEdges = current.edges.filter((edge) => !(
        edge.source === sorting.id && edge.target === recommendation.id
      ));

      const addTypedEdge = (source: Node<AlgorithmNodeData>, target: Node<AlgorithmNodeData>) => {
        if (nextEdges.some((edge) => edge.source === source.id && edge.target === target.id)) return;
        const sourceHandle = source.data.ports?.find((port) => port.direction === 'output')?.id;
        const targetHandle = target.data.ports?.find((port) => port.direction === 'input')?.id;
        if (!sourceHandle || !targetHandle) return;
        nextEdges = nextEdges.concat({
          id: `suggested-${source.id}-${target.id}`,
          source: source.id,
          target: target.id,
          sourceHandle,
          targetHandle,
          type: 'algorithmEdge',
          animated: true,
          data: { suggested: true, workflow: 'study-recommendation' },
        });
      };

      addTypedEdge(sorting, search);
      addTypedEdge(search, recommendation);
      return {
        nodes: nextNodes,
        edges: nextEdges.filter((edge) => (
          !chainNodeIds.has(edge.source)
          || !chainNodeIds.has(edge.target)
          || edge.source !== edge.target
        )),
      };
    });
    setActiveSection('build');
    setToast('Suggested workflow completed: Sort → Search → Recommend. One Undo removes the entire suggestion.');
  }, [commitGraphMutation]);

  const focusPane = useCallback((section: WorkbenchSection, pane: HTMLElement | null) => {
    setActiveSection(section);
    window.requestAnimationFrame(() => {
      pane?.focus({ preventScroll: true });
      pane?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }, []);

  const openInspectorForNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    focusPane('explain', inspectorPaneRef.current);
    setToast('Parameters opened in the Lesson Inspector.');
  }, [focusPane]);

  useEffect(() => {
    const handleOpenInspector = (event: Event) => {
      const nodeId = (event as CustomEvent<{ nodeId?: string }>).detail?.nodeId;
      if (nodeId) openInspectorForNode(nodeId);
    };
    window.addEventListener('vad:open-inspector', handleOpenInspector);
    return () => window.removeEventListener('vad:open-inspector', handleOpenInspector);
  }, [openInspectorForNode]);

  const navigateWorkbench = useCallback((section: WorkbenchSection) => {
    if (section === 'explore') {
      setPaletteVisible(true);
      setCompactPaletteMode('algorithms');
      focusPane(section, palettePaneRef.current);
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLInputElement>('[aria-label="Search algorithms"]')?.focus();
      });
      return;
    }
    if (section === 'build') {
      focusPane(section, canvasPaneRef.current);
      setToast('Build mode: add, move, or edit blocks on the canvas.');
      return;
    }
    if (section === 'connect') {
      focusPane(section, canvasPaneRef.current);
      setToast('Connect mode: drag an OUTPUT port to an INPUT port, or click each port in order.');
      return;
    }
    if (section === 'explain') {
      focusPane(section, inspectorPaneRef.current);
      if (!selectedNode) {
        setToast('Select a block first, then choose Explain.');
      } else if (backendOnline === false) {
        setToast('RaySight is offline until the school backend is available.');
      } else {
        void runExplain();
      }
      return;
    }
    focusPane(section, historyControlsRef.current);
    setToast(canUndo || canRedo ? 'History controls are ready.' : 'History is empty. Add or move a block first.');
  }, [backendOnline, canRedo, canUndo, focusPane, runExplain, selectedNode]);

  const navigation: Array<{ id: WorkbenchSection; label: string }> = [
    { id: 'explore', label: 'Explore' },
    { id: 'build', label: 'Build' },
    { id: 'connect', label: 'Connect' },
    ...(FEATURE_FLAGS.annexes ? [{ id: 'explain' as const, label: 'Explain' }] : []),
    { id: 'history', label: 'History' },
  ];

  const paletteTabs = (
    <Stack direction="row" spacing={0.75} role="group" aria-label="Choose block library" className="vad-library-tabs">
      <Button data-testid="library-tab-blocks" size="small" variant={compactPaletteMode === 'algorithms' ? 'contained' : 'outlined'} onClick={() => setCompactPaletteMode('algorithms')}>Blocks</Button>
      <Button data-testid="library-tab-workflows" size="small" variant={compactPaletteMode === 'prefabs' ? 'contained' : 'outlined'} onClick={() => setCompactPaletteMode('prefabs')}>Workflows</Button>
      {FEATURE_FLAGS.annexes && <Button data-testid="library-tab-h2o" size="small" variant={compactPaletteMode === 'h2o' ? 'contained' : 'outlined'} onClick={() => setCompactPaletteMode('h2o')}>H2O bank</Button>}
    </Stack>
  );

  const selectedPalette = compactPaletteMode === 'algorithms'
    ? <AlgorithmPalette />
    : compactPaletteMode === 'prefabs'
      ? <SubpipelineLibraryPanel onSaveRequested={() => setSaveOpen(true)} />
      : FEATURE_FLAGS.annexes ? <H2OParameterPalette /> : <AlgorithmPalette />;

  const inspector = (
    <>
      <AlgorithmPropertiesPanel
        selectedNode={selectedNode}
        status={status}
        evaluation={evaluation}
        evaluationLoading={evaluationLoading}
        onParamChange={updateParam}
        onExplain={runExplain}
        onEvaluate={runEvaluate}
        showAnnexActions={FEATURE_FLAGS.annexes || FEATURE_FLAGS.promotion}
      />
      {FEATURE_FLAGS.annexes && <><Divider sx={{ my: 2 }} />
      <AIExplanationPanel
        available={backendOnline}
        explanation={explanation}
        loading={explanationLoading}
        error={explanationError}
        latencyMs={latencyMs}
        focusLabel={selectedNode?.data.label}
        onFeedback={recordFeedback}
      /></>}
    </>
  );

  return (
    <Box
      className="vad-workbench-shell"
      data-active-section={activeSection}
      sx={{ height: '100vh', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', bgcolor: 'var(--color-bg)' }}
    >
      <Box className="vad-workbench-header" sx={{ minHeight: 72, px: 2, py: 1, borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <VADBrandMark compact={compactLayout} />
        <Stack component="nav" aria-label="Workbench sections" direction="row" spacing={0.5} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
          {navigation.map((item) => (
            <Button
              key={item.id}
              size="small"
              variant="text"
              className={activeSection === item.id ? 'vad-workbench-nav--active' : undefined}
              aria-current={activeSection === item.id ? 'page' : undefined}
              onClick={() => navigateWorkbench(item.id)}
              sx={{ fontWeight: 800 }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
        <Stack ref={historyControlsRef} tabIndex={-1} direction="row" spacing={1} alignItems="center" sx={{ flex: '0 0 auto' }}>
          <Button
            size="small"
            variant="text"
            disabled={!canUndo}
            onClick={undo}
            aria-label="Undo last graph action"
            data-testid="graph-undo"
          >
            Undo
          </Button>
          <Button
            size="small"
            variant="text"
            disabled={!canRedo}
            onClick={redo}
            aria-label="Redo last graph action"
            data-testid="graph-redo"
          >
            Redo
          </Button>
          <Button size="small" color="error" variant="text" disabled={!selectedNodeId} onClick={deleteSelected} aria-label="Delete selected block">
            Delete
          </Button>
          {FEATURE_FLAGS.promotion && <Box sx={{ width: 190, display: { xs: 'none', lg: 'block' } }}>
            <SecurityProfileSelector value={securityProfile} onChange={setSecurityProfile} />
          </Box>}
          <Button size="small" variant="outlined" onClick={() => setTutorialOpen(true)} sx={{ display: { xs: 'none', lg: 'inline-flex' } }}>
            Help
          </Button>
          {FEATURE_FLAGS.promotion && <Button size="small" variant="outlined" onClick={generateReport} sx={{ display: { xs: 'none', lg: 'inline-flex' } }}>
            Teacher report
          </Button>}
          {FEATURE_FLAGS.promotion && <Button size="small" variant="contained" disabled={!evaluation || evaluation.coherenceScore < 93} onClick={() => setPromoteOpen(true)} sx={{ display: { xs: 'none', lg: 'inline-flex' } }}>
            Save as validated
          </Button>}
        </Stack>
      </Box>
      <Box sx={{ minHeight: 0, height: '100%' }}>
        {compactLayout ? (
          <Box sx={{ height: '100%', minHeight: 0, display: 'grid', gridTemplateRows: 'minmax(300px, 42vh) minmax(0, 1fr)' }}>
            <Paper ref={palettePaneRef} tabIndex={-1} square sx={{ minHeight: 0, p: 1.25, overflow: 'hidden', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {activeSection === 'explain' ? inspector : <>{paletteTabs}{selectedPalette}</>}
            </Paper>
            <Box ref={canvasPaneRef} tabIndex={-1} sx={{ minHeight: 0, position: 'relative', bgcolor: 'var(--color-canvas-bg)' }}>
              <ReactFlowProvider>
                <AlgorithmCanvas
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  commitGraphMutation={commitGraphMutation}
                  onSelectedNodeChange={setSelectedNodeId}
                  onSaveRequested={() => setSaveOpen(true)}
                  onClearRequested={clearPipeline}
                />
              </ReactFlowProvider>
            </Box>
          </Box>
        ) : (
        <PanelGroup orientation="horizontal" style={{ height: '100%', width: '100%' }}>
          {paletteVisible && (
            <>
              <Panel defaultSize="340px" minSize="300px" maxSize="440px" groupResizeBehavior="preserve-pixel-size">
                <Paper ref={palettePaneRef} tabIndex={-1} square sx={{ height: '100%', p: 1.5, overflow: 'hidden', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {paletteTabs}
                  {selectedPalette}
                </Paper>
              </Panel>
              <PanelResizeHandle className="vad-resize-handle" />
            </>
          )}
          <Panel minSize="420px">
            <Box ref={canvasPaneRef} tabIndex={-1} sx={{ height: '100%', minHeight: 0, position: 'relative', bgcolor: 'var(--color-canvas-bg)' }}>
              {edges.length === 0 && nodes.length <= 2 && <Box className="vad-canvas-guide" data-vad-drop-exclude="true">
                <Typography variant="caption">Need a complete example?</Typography>
                <Button size="small" variant="contained" onClick={completeSuggestedWorkflow}>Build suggested chain</Button>
              </Box>}
              <ReactFlowProvider>
                <AlgorithmCanvas
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  commitGraphMutation={commitGraphMutation}
                  onSelectedNodeChange={setSelectedNodeId}
                  onSaveRequested={() => setSaveOpen(true)}
                  onClearRequested={clearPipeline}
                />
              </ReactFlowProvider>
            </Box>
          </Panel>
          <PanelResizeHandle className="vad-resize-handle" />
          <Panel defaultSize="360px" minSize="300px" maxSize="460px" groupResizeBehavior="preserve-pixel-size">
            <Paper ref={inspectorPaneRef} tabIndex={-1} square sx={{ height: '100%', p: 2, overflow: 'auto', borderLeft: '1px solid var(--color-border)' }}>
              {inspector}
            </Paper>
          </Panel>
        </PanelGroup>
        )}
      </Box>
      <Box>
        <StatusBar nodeCount={nodes.length} edgeCount={edges.length} latencyMs={FEATURE_FLAGS.annexes ? latencyMs : undefined} hasLoop={loops.hasLoop} coherenceScore={FEATURE_FLAGS.promotion ? evaluation?.coherenceScore : undefined} />
      </Box>
      <PipelineSaveDialog open={saveOpen} nodeCount={nodes.length} edgeCount={edges.length} onClose={() => setSaveOpen(false)} onSave={savePipeline} />
      {FEATURE_FLAGS.promotion && <PipelinePromoteDialog open={promoteOpen} {...(promoteOpen ? buildPipelinePayload() : { nodes: [], edges: [] })} evaluation={evaluation} onClose={() => setPromoteOpen(false)} onPromoted={() => setToast('Pipeline promoted and sent to AlgoQuest outbox.')} />}
      <TutorialOverlay open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
      <Snackbar open={Boolean(toast)} autoHideDuration={2400} message={toast} onClose={() => setToast('')} />
    </Box>
  );
}
