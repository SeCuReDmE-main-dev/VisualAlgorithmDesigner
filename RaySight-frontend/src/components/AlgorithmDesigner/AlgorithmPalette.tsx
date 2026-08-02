import { useMemo, useState } from 'react';
import { Box, Button, Chip, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { ALGORITHM_CATALOG, searchAlgorithms } from '../../services/algorithmCatalog';
import type { LearningAlgorithm } from '../../services/algorithmCatalog';
import { useDragSource } from '../../hooks/useDragSource';

function AlgorithmPaletteCard({ algorithm }: { algorithm: LearningAlgorithm }) {
  const payload = useMemo(() => ({
    algorithmId: algorithm.id,
    label: algorithm.label,
    category: algorithm.category,
  }), [algorithm.category, algorithm.id, algorithm.label]);
  const { dragHandleProps, placeAtCenter, ownsKeyboardSession } = useDragSource({
    type: 'algorithm',
    payload,
  });

  return (
    <Box
      className="vad-palette-card"
      data-testid={`palette-card-${algorithm.id}`}
      tabIndex={0}
      onKeyDown={dragHandleProps.onKeyDown}
      sx={{
        p: 1.2,
        minHeight: 138,
        flex: '0 0 auto',
        border: ownsKeyboardSession ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        bgcolor: 'var(--color-surface-alt)',
        userSelect: 'none',
        transition: 'transform 140ms ease, border-color 140ms ease, background 140ms ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          borderColor: 'var(--color-primary)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          {algorithm.label}
        </Typography>
        <Chip size="small" label={algorithm.difficulty} sx={{ height: 22, fontSize: '0.68rem' }} />
      </Box>
      <Typography variant="caption" sx={{ display: 'block', color: 'var(--color-primary-strong)', mt: 0.5, fontWeight: 800, textTransform: 'capitalize' }}>
        {algorithm.family}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: 'var(--color-text-muted)', mt: 0.75, lineHeight: 1.35 }}>
        {algorithm.plainPurpose}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
        <Box
          component="button"
          type="button"
          {...dragHandleProps}
          data-testid={`palette-drag-handle-${algorithm.id}`}
          aria-label={`Drag ${algorithm.label}. Press Enter or Space for keyboard placement.`}
          sx={{
            width: 44,
            height: 44,
            flex: '0 0 44px',
            display: 'grid',
            placeItems: 'center',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            bgcolor: 'var(--color-surface)',
            color: 'var(--color-primary)',
            cursor: 'grab',
            touchAction: 'none',
            font: 'inherit',
            fontWeight: 900,
            '&:focus-visible': { outline: '3px solid var(--color-accent)', outlineOffset: 2 },
            '&:active': { cursor: 'grabbing' },
          }}
        >
          ⋮⋮
        </Box>
        <Button
          size="small"
          variant="outlined"
          aria-label={`Add ${algorithm.label} to canvas`}
          onClick={() => placeAtCenter()}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
}

export default function AlgorithmPalette() {
  const [query, setQuery] = useState('');
  const algorithms = useMemo(() => searchAlgorithms(query).slice().sort((left, right) => {
    if (left.id === 'pathfinding') return -1;
    if (right.id === 'pathfinding') return 1;
    return 0;
  }), [query]);

  return (
    <Box sx={{ minHeight: 0, flex: '1 1 52%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Block palette
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-muted)' }}>
          Choose a block, then drag its handle or press Add.
        </Typography>
      </Box>
      <TextField
        size="small"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search"
        inputProps={{
          'aria-label': 'Search algorithms',
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" aria-hidden="true" role="presentation">
              /
            </InputAdornment>
          ),
        }}
      />
      <Stack spacing={1} sx={{ overflow: 'auto', pr: 0.5, pb: 1 }}>
        {algorithms.map((algorithm) => (
          <AlgorithmPaletteCard key={algorithm.id} algorithm={algorithm} />
        ))}
      </Stack>
    </Box>
  );
}
