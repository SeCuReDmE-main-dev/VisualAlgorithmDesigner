import { memo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { Handle, NodeProps, Position } from '@xyflow/react';

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

function AlgorithmNode({ data, selected }: NodeProps) {
  const nodeData = data as AlgorithmNodeData;
  const accent = categoryVar[nodeData.category] ?? 'var(--color-primary)';
  const paramCount = Object.keys(nodeData.params ?? {}).length;

  return (
    <Box
      className="vad-node-drop"
      sx={{
        width: 220,
        minHeight: 118,
        border: selected ? '2px solid var(--color-node-selected)' : '1px solid var(--color-border)',
        borderLeft: `5px solid ${accent}`,
        borderRadius: 'var(--radius-md)',
        bgcolor: 'var(--color-surface-alt)',
        boxShadow: selected ? '0 0 0 4px color-mix(in srgb, var(--color-node-selected) 18%, transparent)' : 'var(--shadow-node)',
        color: 'var(--color-text)',
        overflow: 'hidden',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ width: 13, height: 13, background: accent, border: '2px solid #fff' }} />
      <Box sx={{ p: 1.25 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
          {nodeData.label}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'var(--color-text-muted)', mt: 0.25 }}>
          {nodeData.plainPurpose || nodeData.description || nodeData.algorithmId}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label={nodeData.category} sx={{ height: 22, bgcolor: accent, color: '#fff', fontSize: '0.68rem' }} />
          {paramCount > 0 && <Chip size="small" variant="outlined" label={`${paramCount} params`} sx={{ height: 22, fontSize: '0.68rem' }} />}
          {nodeData.difficulty && <Chip size="small" variant="outlined" label={nodeData.difficulty} sx={{ height: 22, fontSize: '0.68rem' }} />}
          {typeof nodeData.coherenceScore === 'number' && <Chip size="small" label={`${nodeData.coherenceScore}%`} color="success" sx={{ height: 22, fontSize: '0.68rem' }} />}
        </Box>
      </Box>
      <Handle type="source" position={Position.Right} style={{ width: 13, height: 13, background: accent, border: '2px solid #fff' }} />
    </Box>
  );
}

export default memo(AlgorithmNode);
