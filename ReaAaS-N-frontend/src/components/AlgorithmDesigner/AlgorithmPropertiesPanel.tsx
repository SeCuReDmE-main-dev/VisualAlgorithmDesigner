import { Box, Button, Chip, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { Node } from '@xyflow/react';
import type { PipelineEvaluation, PipelineNodePayload } from '../../services/api';
import type { PipelineStatus } from '../../hooks/usePipelineStatus';
import { getAlgorithmById } from '../../services/algorithmCatalog';
import type { AlgorithmNodeData } from './AlgorithmNode';

interface AlgorithmPropertiesPanelProps {
  selectedNode: Node<AlgorithmNodeData> | null;
  status: PipelineStatus;
  evaluation: PipelineEvaluation | null;
  evaluationLoading: boolean;
  onParamChange: (nodeId: string, key: string, value: unknown) => void;
  onExplain: () => void;
  onEvaluate: () => void;
}

function coerceParamValue(rawValue: string, type: string) {
  if (type === 'integer') {
    return Number.parseInt(rawValue, 10);
  }
  if (type === 'float') {
    return Number.parseFloat(rawValue);
  }
  if (type === 'boolean') {
    return rawValue === 'true';
  }
  return rawValue;
}

export default function AlgorithmPropertiesPanel({
  selectedNode,
  status,
  evaluation,
  evaluationLoading,
  onParamChange,
  onExplain,
  onEvaluate,
}: AlgorithmPropertiesPanelProps) {
  const nodeData = selectedNode?.data;
  const algorithm = nodeData ? getAlgorithmById(nodeData.algorithmId) : undefined;
  const canExplain = Boolean(selectedNode);
  const canEvaluate = status === 'ready' || status === 'single-node';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Properties
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-muted)' }}>
          Pipeline status: {status}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1}>
        <Button fullWidth variant="contained" disabled={!canExplain} onClick={onExplain}>
          Explain
        </Button>
        <Button fullWidth variant="outlined" aria-disabled={!canEvaluate || evaluationLoading} aria-busy={evaluationLoading} onClick={(!canEvaluate || evaluationLoading) ? undefined : onEvaluate} sx={{ opacity: (!canEvaluate || evaluationLoading) ? 0.5 : 1, cursor: (!canEvaluate || evaluationLoading) ? 'not-allowed' : 'pointer' }}>
          {evaluationLoading ? 'Evaluating' : 'Evaluate'}
        </Button>
      </Stack>
      {evaluation && (
        <Box sx={{ p: 1, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
            <Chip size="small" color={evaluation.coherenceScore >= 93 ? 'success' : 'warning'} label={`${evaluation.coherenceScore}%`} />
            <Chip size="small" variant="outlined" label={evaluation.recommendation} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>
            {evaluation.explanation}
          </Typography>
        </Box>
      )}
      <Divider />
      {!selectedNode && (
        <Typography variant="body2" sx={{ color: 'var(--color-text-muted)' }}>
          Select a node on the canvas to edit algorithm parameters.
        </Typography>
      )}
      {selectedNode && nodeData && (
        <Stack spacing={1.25}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {nodeData.label}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>
              {nodeData.description || algorithm?.description || nodeData.algorithmId}
            </Typography>
          </Box>
          {algorithm?.params.map((param) => {
            const value = nodeData.params?.[param.key] ?? param.default;
            if (param.type === 'enum' || param.type === 'boolean') {
              const options = param.type === 'boolean' ? ['true', 'false'] : param.options ?? [];
              return (
                <TextField
                  key={param.key}
                  select
                  size="small"
                  label={param.label}
                  value={String(value)}
                  onChange={(event) => onParamChange(selectedNode.id, param.key, coerceParamValue(event.target.value, param.type))}
                  helperText={param.description}
                >
                  {options.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              );
            }

            return (
              <TextField
                key={param.key}
                size="small"
                type="number"
                label={param.label}
                value={String(value)}
                inputProps={{ min: param.min, max: param.max, step: param.type === 'integer' ? 1 : 0.01 }}
                onChange={(event) => onParamChange(selectedNode.id, param.key, coerceParamValue(event.target.value, param.type))}
                helperText={param.description}
              />
            );
          })}
          {!algorithm && (
            <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>
              This mechanism has no editable H2O parameters yet.
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}

export function toPipelinePayloadNode(node: Node<AlgorithmNodeData>): PipelineNodePayload {
  return {
    id: node.id,
    type: node.data.algorithmId,
    params: node.data.params,
    data: {
      label: node.data.label,
      category: node.data.category,
    },
    position: node.position,
  };
}
