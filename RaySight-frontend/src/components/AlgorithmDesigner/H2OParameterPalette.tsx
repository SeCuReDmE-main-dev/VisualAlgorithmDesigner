import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Link, Stack, TextField, Typography } from '@mui/material';
import { useDragSource } from '../../hooks/useDragSource';
import type { DragPayload } from '../../contexts/DnDContext';
import {
  H2O_PARAMETER_FALLBACK,
  H2O_PARAMETER_SOURCE,
  H2O_PARAMETER_TOTAL,
  loadH2OParameterCatalog,
  searchH2OParameters,
  type H2OParameterEntry,
} from '../../services/h2oParameterCatalog';

const H2O_PORTS = [
  { id: 'in-data', direction: 'input' as const, dataType: 'data', cardinality: 1 as const, label: 'model data', loopCapable: false },
  { id: 'out-data', direction: 'output' as const, dataType: 'data', cardinality: 'many' as const, label: 'configured data', loopCapable: false },
];

function titleCase(name: string) {
  return name.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function H2OParameterCard({ parameter }: { parameter: H2OParameterEntry }) {
  const payload = useMemo<DragPayload>(() => ({
    algorithmId: `h2o-param-${parameter.name}`,
    label: titleCase(parameter.name),
    category: 'h2o-parameter',
    nodeData: {
      description: parameter.description,
      plainPurpose: parameter.description,
      difficulty: 'advanced',
      params: { [parameter.name]: parameter.defaultValue ?? (parameter.valueType === 'boolean' ? false : '') },
      ports: H2O_PORTS,
      parameterSchema: {
        key: parameter.name,
        valueType: parameter.valueType,
        defaultValue: parameter.defaultValue,
        description: parameter.description,
      },
      compatibleAlgorithms: parameter.algorithms,
      sourceUrl: parameter.sourceUrl,
      annexAdapter: 'h2o',
      annexStatus: 'required',
    },
  }), [parameter]);
  const { dragHandleProps, placeAtCenter, ownsKeyboardSession } = useDragSource({ type: 'h2o-parameter', payload });

  return (
    <Box className="vad-palette-card vad-h2o-card" data-testid={`h2o-card-${parameter.name}`} sx={{ p: 1, border: ownsKeyboardSession ? '2px solid var(--color-accent)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', bgcolor: 'var(--color-surface-alt)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{titleCase(parameter.name)}</Typography>
        <Chip size="small" label="H2O" color="primary" />
      </Stack>
      <Typography variant="caption" title={parameter.description} sx={{ display: 'block', color: 'var(--color-text-muted)', mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {parameter.algorithms.join(' · ') || 'H2O parameter'}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Box component="button" type="button" {...dragHandleProps} data-testid={`h2o-drag-handle-${parameter.name}`} aria-label={`Drag H2O function ${parameter.name}`} className="vad-drag-handle">⋮⋮</Box>
        <Button size="small" variant="outlined" onClick={() => placeAtCenter()}>Add</Button>
      </Stack>
    </Box>
  );
}

export default function H2OParameterPalette() {
  const [query, setQuery] = useState('');
  const [parameters, setParameters] = useState(H2O_PARAMETER_FALLBACK);
  useEffect(() => { void loadH2OParameterCatalog().then(setParameters); }, []);
  const visible = useMemo(() => searchH2OParameters(parameters, query), [parameters, query]);

  return (
    <Box sx={{ minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 900 }}>H2O function bank</Typography>
          <Chip size="small" label={`${H2O_PARAMETER_TOTAL} functions`} />
        </Stack>
        <Typography variant="body2" sx={{ color: 'var(--color-text-muted)' }}>
          Official Appendix A parameters, classified and ready to drag. Powered by H2O.
        </Typography>
        <Link href={H2O_PARAMETER_SOURCE} target="_blank" rel="noreferrer" variant="caption">View the official source</Link>
      </Box>
      <TextField size="small" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search balance_classes, GBM…" inputProps={{ 'aria-label': 'Search H2O functions' }} />
      <Typography variant="caption">Showing {visible.length} of {parameters.length}</Typography>
      <Stack spacing={1} sx={{ overflow: 'auto', pr: 0.5, pb: 1 }}>
        {visible.map((parameter) => <H2OParameterCard key={parameter.name} parameter={parameter} />)}
      </Stack>
    </Box>
  );
}
