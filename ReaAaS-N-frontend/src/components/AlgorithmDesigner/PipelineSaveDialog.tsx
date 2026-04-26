import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';

interface PipelineSaveDialogProps {
  open: boolean;
  nodeCount: number;
  edgeCount: number;
  onClose: () => void;
  onSave: (metadata: { name: string; description: string }) => void;
}

export default function PipelineSaveDialog({ open, nodeCount, edgeCount, onClose, onSave }: PipelineSaveDialogProps) {
  const [name, setName] = useState('Untitled H2O pipeline');
  const [description, setDescription] = useState('');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Save Pipeline</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField size="small" label="Name" value={name} onChange={(event) => setName(event.target.value)} autoFocus />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            multiline
            minRows={3}
            helperText={`${nodeCount} nodes, ${edgeCount} edges`}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!name.trim()}
          onClick={() => {
            onSave({ name: name.trim(), description: description.trim() });
            onClose();
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
