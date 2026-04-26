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
      <Box sx={{ textAlign: 'center', maxWidth: 380, px: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Drop an algorithm or prefab pipeline
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-muted)', mt: 1 }}>
          Build a H2O flow, select a node, then explain or evaluate the pipeline.
        </Typography>
      </Box>
    </Box>
  );
}
