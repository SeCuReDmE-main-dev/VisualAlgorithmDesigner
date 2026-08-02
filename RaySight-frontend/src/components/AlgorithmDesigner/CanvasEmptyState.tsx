import { Box, Typography } from '@mui/material';

export default function CanvasEmptyState() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 420, px: 2, display: 'grid', justifyItems: 'center', gap: 1 }}>
        <Box aria-hidden="true" sx={{ width: 48, height: 48, display: 'grid', placeItems: 'center', border: '1px solid var(--color-border)', color: 'var(--color-accent)', fontSize: 24, fontWeight: 900 }}>
          +
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Start with one block
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-muted)' }}>
          Drag a block or workflow here, or press Add. Connect an output dot to a compatible input dot.
        </Typography>
      </Box>
    </Box>
  );
}
