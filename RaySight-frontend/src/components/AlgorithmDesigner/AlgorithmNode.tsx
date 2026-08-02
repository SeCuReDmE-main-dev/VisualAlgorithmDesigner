import { memo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { Handle, NodeProps, Position } from '@xyflow/react';
import type { PortDescriptorV1 } from '../../services/graphPorts';
import { FEATURE_FLAGS } from '../../config/featureFlags';

export interface AlgorithmNodeData extends Record<string, unknown> {
  algorithmId: string;
  label: string;
  category: string;
  description?: string;
  plainPurpose?: string;
  realWorldExample?: string;
  historyNote?: string;
  whyItMatters?: string;
  difficulty?: string;
  params?: Record<string, unknown>;
  coherenceScore?: number;
  isPrefab?: boolean;
  loopCapable?: boolean;
  ports?: PortDescriptorV1[];
  parameterSchema?: {
    key: string;
    valueType: 'boolean' | 'number' | 'text';
    defaultValue: unknown;
    description: string;
  };
  compatibleAlgorithms?: string[];
  sourceUrl?: string;
  annexAdapter?: 'h2o';
  annexStatus?: 'required' | 'available';
}

const categoryVar: Record<string, string> = {
  sorting: 'var(--color-node-sorting)',
  search: 'var(--color-node-search)',
  graph: 'var(--color-node-graph)',
  recommendation: 'var(--color-node-recommendation)',
  classification: 'var(--color-node-classification)',
  clustering: 'var(--color-node-clustering)',
  security: 'var(--color-node-security)',
  compression: 'var(--color-node-compression)',
  scheduling: 'var(--color-node-scheduling)',
  neural: 'var(--color-node-neural)',
  supervised: 'var(--color-node-supervised)',
  unsupervised: 'var(--color-node-unsupervised)',
  data: 'var(--color-primary)',
  logic: 'var(--color-node-search)',
  feedback: 'var(--color-node-recommendation)',
  output: 'var(--color-node-scheduling)',
  review: 'var(--color-node-classification)',
  practice: 'var(--color-node-search)',
  improvement: 'var(--color-node-recommendation)',
  preprocessing: 'var(--color-secondary)',
  training: 'var(--color-secondary)',
  validation: 'var(--color-accent)',
  deployment: 'var(--color-success)',
  monitoring: 'var(--color-warning)',
  tuning: 'var(--color-secondary)',
  retraining: 'var(--color-accent)',
};

function openNodeInspector(nodeId: string) {
  window.dispatchEvent(new CustomEvent('vad:open-inspector', { detail: { nodeId } }));
}

function AlgorithmNode({ id, data, selected }: NodeProps) {
  const nodeData = data as AlgorithmNodeData;
  const accent = categoryVar[nodeData.category] ?? 'var(--color-primary)';
  const paramCount = Object.keys(nodeData.params ?? {}).length;
  const inputPorts = (nodeData.ports ?? []).filter((port) => port.direction === 'input');
  const outputPorts = (nodeData.ports ?? []).filter((port) => port.direction === 'output');

  return (
    <Box
      className="vad-node-drop vad-node-card"
      data-testid="algorithm-node"
      data-algorithm-id={nodeData.algorithmId}
      sx={{
        width: 220,
        minHeight: 118,
        border: selected ? '2px solid var(--color-node-selected)' : '1px solid var(--color-border)',
        borderLeft: `5px solid ${accent}`,
        borderRadius: 'var(--radius-md)',
        bgcolor: 'var(--color-surface-alt)',
        boxShadow: selected ? '0 0 0 4px color-mix(in srgb, var(--color-node-selected) 18%, transparent)' : 'var(--shadow-node)',
        color: 'var(--color-text)',
        overflow: 'visible',
      }}
    >
      {inputPorts.map((port, index) => (
        <Handle
          key={port.id}
          id={port.id}
          className="vad-port vad-port--input"
          type="target"
          position={Position.Left}
          data-testid={`port-input-${port.id}`}
          aria-label={`${port.label} input (${port.dataType})`}
          title={`INPUT · ${port.label} · ${port.dataType}`}
          style={{
            width: 22,
            height: 22,
            top: `${((index + 1) / (inputPorts.length + 1)) * 100}%`,
            background: accent,
            border: '3px solid var(--color-surface)',
            zIndex: 30,
            pointerEvents: 'all',
            touchAction: 'none',
          }}
        />
      ))}
      <Box sx={{ p: 1.25 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
          {nodeData.label}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'var(--color-text-muted)', mt: 0.25 }}>
          {nodeData.plainPurpose || nodeData.description || nodeData.algorithmId}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label={`Type: ${nodeData.category}`} sx={{ height: 22, bgcolor: accent, color: '#fff', fontSize: '0.68rem' }} />
          {paramCount > 0 && <Chip size="small" variant="outlined" label={`${paramCount} parameters`} sx={{ height: 22, fontSize: '0.68rem' }} />}
          {nodeData.difficulty && <Chip size="small" variant="outlined" label={`Level: ${nodeData.difficulty}`} sx={{ height: 22, fontSize: '0.68rem' }} />}
          {FEATURE_FLAGS.promotion && typeof nodeData.coherenceScore === 'number' && <Chip size="small" label={`${nodeData.coherenceScore}%`} color="success" sx={{ height: 22, fontSize: '0.68rem' }} />}
        </Box>
        {paramCount > 0 && (
          <Box
            component="button"
            type="button"
            className="nodrag nopan vad-node-edit"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              openNodeInspector(id);
            }}
            aria-label={`Edit parameters for ${nodeData.label}`}
          >
            Edit parameters →
          </Box>
        )}
      </Box>
      {outputPorts.map((port, index) => (
        <Handle
          key={port.id}
          id={port.id}
          className="vad-port vad-port--output"
          type="source"
          position={Position.Right}
          data-testid={`port-output-${port.id}`}
          aria-label={`${port.label} output (${port.dataType})`}
          style={{
            width: 22,
            height: 22,
            top: `${((index + 1) / (outputPorts.length + 1)) * 100}%`,
            background: accent,
            border: '3px solid var(--color-surface)',
            zIndex: 30,
            pointerEvents: 'all',
            touchAction: 'none',
          }}
          title={`OUTPUT · ${port.label} · ${port.dataType}`}
        />
      ))}
    </Box>
  );
}

export default memo(AlgorithmNode);
