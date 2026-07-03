import { useMemo, useState } from 'react';
import { Box, Chip, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { ALGORITHM_CATALOG, searchAlgorithms } from '../../services/algorithmCatalog';
import { useDnD } from '../../contexts/DnDContext';

export default function AlgorithmPalette() {
  const [query, setQuery] = useState('');
  const { startPointerDrag } = useDnD();
  const algorithms = useMemo(() => searchAlgorithms(query), [query]);

  return (
    <Box sx={{ minHeight: 0, flex: '1 1 52%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Explore
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-muted)' }}>
          {ALGORITHM_CATALOG.length} learning blocks for VAD
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
          <Box
            key={algorithm.id}
            className="vad-palette-card"
            onPointerDown={(event) => {
              if (event.button !== 0) {
                return;
              }

              event.preventDefault();
              startPointerDrag(
                'algorithm',
                {
                  algorithmId: algorithm.id,
                  label: algorithm.label,
                  category: algorithm.category,
                },
                { x: event.clientX, y: event.clientY },
              );
            }}
            sx={{
              p: 1.2,
              minHeight: 124,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              bgcolor: 'var(--color-surface-alt)',
              cursor: 'grab',
              userSelect: 'none',
              touchAction: 'none',
              transition: 'transform 140ms ease, border-color 140ms ease, background 140ms ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                borderColor: 'var(--color-primary)',
              },
              '&:active': {
                cursor: 'grabbing',
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
            <Typography variant="caption" sx={{ display: 'block', color: 'var(--color-text-soft)', mt: 0.75, lineHeight: 1.3 }}>
              Example: {algorithm.realWorldExample}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
