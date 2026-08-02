import { Box, Button, Chip, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { Node } from '@xyflow/react';
import type { PipelineEvaluation, PipelineNodePayload } from '../../services/api';
import type { PipelineStatus } from '../../hooks/usePipelineStatus';
import { getAlgorithmById } from '../../services/algorithmCatalog';
import type { AlgorithmNodeData } from './AlgorithmNode';
import '../../styles/properties.css';

interface AlgorithmPropertiesPanelProps {
  selectedNode: Node<AlgorithmNodeData> | null;
  status: PipelineStatus;
  evaluation: PipelineEvaluation | null;
  evaluationLoading: boolean;
  onParamChange: (nodeId: string, key: string, value: unknown) => void;
  onExplain: () => void;
  onEvaluate: () => void;
  showAnnexActions?: boolean;
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
  showAnnexActions = true,
}: AlgorithmPropertiesPanelProps) {
  const nodeData = selectedNode?.data;
  const algorithm = nodeData ? getAlgorithmById(nodeData.algorithmId) : undefined;
  const canExplain = Boolean(selectedNode);
  const canEvaluate = status === 'ready' || status === 'single-node';

  return (
    <Box className="properties-panel" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Lesson Inspector
        </Typography>
        <Typography variant="body2">
          Build state: {status}
        </Typography>
      </Box>
      {showAnnexActions && <Stack direction="row" spacing={1}>
        <Button fullWidth variant="contained" disabled={!canExplain} onClick={onExplain}>
          Explain
        </Button>
        <Button fullWidth variant="outlined" aria-disabled={!canEvaluate || evaluationLoading} aria-busy={evaluationLoading} onClick={(!canEvaluate || evaluationLoading) ? undefined : onEvaluate} sx={{ opacity: (!canEvaluate || evaluationLoading) ? 0.5 : 1, cursor: (!canEvaluate || evaluationLoading) ? 'not-allowed' : 'pointer' }}>
          {evaluationLoading ? 'Evaluating' : 'Evaluate'}
        </Button>
      </Stack>}
      {showAnnexActions && evaluation && (
        <Box sx={{ p: 1.5, border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Chip size="small" color={evaluation.coherenceScore >= 93 ? 'success' : 'warning'} label={`${evaluation.coherenceScore}%`} />
            <Chip size="small" variant="outlined" label={evaluation.recommendation} />
          </Stack>
          <Typography variant="caption">
            {evaluation.explanation}
          </Typography>
        </Box>
      )}
      <Divider />
      {!selectedNode && (
        <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
          Select a block on the canvas to learn what it does and tune its settings.
        </Typography>
      )}
      {selectedNode && nodeData && (
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '1.1rem', mb: 0.5 }}>
              {nodeData.label}
            </Typography>
            <Typography variant="caption">
              {algorithm?.plainPurpose || nodeData.description || algorithm?.description || nodeData.algorithmId}
            </Typography>
          </Box>
          {algorithm && (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography variant="body2">
                <strong>Example:</strong> {algorithm.realWorldExample}
              </Typography>
              <Typography variant="body2">
                <strong>History:</strong> {algorithm.historyNote}
              </Typography>
              <Typography variant="body2">
                <strong>Why it matters:</strong> {algorithm.whyItMatters}
              </Typography>
            </Box>
          )}
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
                  SelectProps={{
                    MenuProps: {
                      classes: { paper: 'glass-menu-paper' }
                    }
                  }}
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
          {!algorithm && nodeData.parameterSchema && (() => {
            const schema = nodeData.parameterSchema;
            const value = nodeData.params?.[schema.key] ?? schema.defaultValue ?? '';
            if (schema.valueType === 'boolean') {
              return (
                <TextField select size="small" label={schema.key.replaceAll('_', ' ')} value={String(value)} onChange={(event) => onParamChange(selectedNode.id, schema.key, event.target.value === 'true')} helperText="Choose whether this H2O function is enabled.">
                  <MenuItem value="true">Enabled</MenuItem>
                  <MenuItem value="false">Disabled</MenuItem>
                </TextField>
              );
            }
            return (
              <TextField size="small" type={schema.valueType === 'number' ? 'number' : 'text'} label={schema.key.replaceAll('_', ' ')} value={String(value)} onChange={(event) => onParamChange(selectedNode.id, schema.key, schema.valueType === 'number' ? Number(event.target.value) : event.target.value)} helperText="Value passed to the H2O annex when this pipeline runs." />
            );
          })()}
          {nodeData.compatibleAlgorithms && (
            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.75 }}>Compatible H2O algorithms</Typography>
              <Stack direction="row" gap={0.5} flexWrap="wrap">
                {nodeData.compatibleAlgorithms.map((name) => <Chip key={name} size="small" label={name} />)}
              </Stack>
            </Box>
          )}
          {nodeData.sourceUrl && (
            <Button component="a" href={nodeData.sourceUrl} target="_blank" rel="noreferrer" size="small" variant="text">Official H2O source ↗</Button>
          )}
          {!algorithm && !nodeData.parameterSchema && (
            <Typography variant="caption">
              This mechanism has no editable learning settings yet.
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
