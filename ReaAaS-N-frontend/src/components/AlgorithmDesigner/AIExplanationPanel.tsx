import { Alert, Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';

interface AIExplanationPanelProps {
  explanation: string;
  loading: boolean;
  error: string | null;
  latencyMs?: number;
  focusLabel?: string;
  onFeedback: (rating: 'helpful' | 'unclear') => void;
}

export default function AIExplanationPanel({ explanation, loading, error, latencyMs, focusLabel, onFeedback }: AIExplanationPanelProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          AI Tutor
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-muted)' }}>
          Contextual pipeline explanation
        </Typography>
      </Box>
      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
        <Chip className="vad-icon-pulse" size="small" label="Memory on" color="success" />
        {focusLabel && <Chip size="small" variant="outlined" label={`Focus: ${focusLabel}`} />}
        {typeof latencyMs === 'number' && <Chip size="small" variant="outlined" label={`${latencyMs} ms`} />}
      </Stack>
      <Divider />
      {error && <Alert severity="error">{error}</Alert>}
      <Box
        className={explanation ? 'vad-fade-in' : undefined}
        aria-live="polite"
        aria-atomic="true"
        sx={{
          minHeight: 150,
          p: 1.25,
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          bgcolor: 'color-mix(in srgb, var(--color-surface-alt) 72%, transparent)',
          whiteSpace: 'pre-wrap',
        }}
      >
        <Typography variant="body2" sx={{ color: explanation ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
          {loading ? 'Explaining the selected pipeline state...' : explanation || 'Select a node and click Explain to ask the tutor about the current pipeline.'}
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <Button size="small" variant="outlined" disabled={!explanation || loading} aria-label="Mark explanation as helpful" onClick={() => onFeedback('helpful')}>
          Helpful
        </Button>
        <Button size="small" variant="outlined" disabled={!explanation || loading} aria-label="Mark explanation as unclear" onClick={() => onFeedback('unclear')}>
          Unclear
        </Button>
      </Box>
    </Box>
  );
}
