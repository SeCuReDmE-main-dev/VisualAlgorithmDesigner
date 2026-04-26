import { Box, Button, Divider, Paper, Stack } from '@mui/material';
import { ALGORITHM_CATALOG } from '../../services/algorithmCatalog';

interface CanvasContextMenuProps {
  open: boolean;
  x: number;
  y: number;
  onAddAlgorithm: (algorithmId: string) => void;
  onSave: () => void;
  onClear: () => void;
  onClose: () => void;
}

export default function CanvasContextMenu({ open, x, y, onAddAlgorithm, onSave, onClear, onClose }: CanvasContextMenuProps) {
  if (!open) {
    return null;
  }

  return (
    <Paper
      elevation={8}
      onMouseLeave={onClose}
      sx={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 30,
        width: 220,
        p: 1,
        border: '1px solid var(--color-border)',
        bgcolor: 'var(--color-surface-alt)',
      }}
    >
      <Stack spacing={0.5}>
        {ALGORITHM_CATALOG.slice(0, 4).map((algorithm) => (
          <Button key={algorithm.id} size="small" fullWidth sx={{ justifyContent: 'flex-start' }} onClick={() => onAddAlgorithm(algorithm.id)}>
            Add {algorithm.label}
          </Button>
        ))}
        <Divider />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
          <Button size="small" variant="outlined" onClick={onSave}>
            Save
          </Button>
          <Button size="small" color="error" onClick={onClear}>
            Clear
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
