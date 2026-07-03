/**
 * ModeSelectionDialog.tsx — F78
 * Plan reference: Phase 8-3.2
 *
 * Shown on first launch when no vad_session_mode exists in localStorage.
 * The dialog is NOT dismissable without making a choice.
 *
 * Phase 1: two modes only.
 * Phase 2 expansion: add profile picker inside workbench selection.
 */

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

interface Props {
  open: boolean;
  onSelect: () => void;
  onPlayground: () => void;
  onWorkbench: () => void;
}

export function ModeSelectionDialog({ open, onSelect, onPlayground, onWorkbench }: Props) {
  function handlePlayground() {
    onPlayground();
    onSelect();
  }

  function handleWorkbench() {
    onWorkbench();
    onSelect();
  }

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      // Prevent backdrop click from closing — user must choose
      onClose={(_e, reason) => {
        if (reason === 'backdropClick') return;
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 1 }}>
        <Typography variant="h5" component="div" fontWeight={700}>
          Bienvenue dans VAD
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Comment souhaitez-vous utiliser l&apos;outil aujourd&apos;hui&nbsp;?
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 4, pt: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mt: 1,
          }}
        >
          {/* Playground */}
          <Button
            variant="outlined"
            onClick={handlePlayground}
            fullWidth
            sx={{
              py: 3,
              flexDirection: 'column',
              gap: 1,
              borderRadius: 2,
              borderColor: 'secondary.main',
              color: 'secondary.main',
              '&:hover': {
                bgcolor: 'secondary.main',
                color: 'background.paper',
                borderColor: 'secondary.main',
              },
            }}
          >
            <Typography variant="h4" component="span" aria-hidden="true">
              🎮
            </Typography>
            <Typography variant="subtitle1" fontWeight={700}>
              Mode Exploration
            </Typography>
            <Typography variant="caption" color="inherit" sx={{ opacity: 0.85 }}>
              Je construis et je comprends les algorithmes
            </Typography>
          </Button>

          {/* Workbench */}
          <Button
            variant="outlined"
            onClick={handleWorkbench}
            fullWidth
            sx={{
              py: 3,
              flexDirection: 'column',
              gap: 1,
              borderRadius: 2,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'background.paper',
                borderColor: 'primary.main',
              },
            }}
          >
            <Typography variant="h4" component="span" aria-hidden="true">
              🔧
            </Typography>
            <Typography variant="subtitle1" fontWeight={700}>
              Teacher Workbench
            </Typography>
            <Typography variant="caption" color="inherit" sx={{ opacity: 0.85 }}>
              Je valide des pipelines de classe
            </Typography>
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ModeSelectionDialog;
