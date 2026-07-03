import { Box, Typography } from '@mui/material';
import { VADOnboardingBanner } from '../Brand/VADBrand';

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
      <Box sx={{ textAlign: 'center', maxWidth: 560, px: 2, display: 'grid', justifyItems: 'center', gap: 1.25 }}>
        <VADOnboardingBanner />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Build, connect, explain
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-muted)', mt: 1 }}>
          Drag a learning block onto the canvas, connect it to another block, then ask RaySight what the algorithm is doing.
        </Typography>
      </Box>
    </Box>
  );
}
