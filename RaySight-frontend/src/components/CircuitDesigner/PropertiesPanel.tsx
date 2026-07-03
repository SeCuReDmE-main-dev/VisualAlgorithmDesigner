import React from 'react';
import { Box, Paper, Typography, TextField, Divider } from '@mui/material';
import { Node } from '@xyflow/react';

// Define the expected structure of node data that includes a label
interface NodeWithLabelData {
  label: string;
  [key: string]: any; // Allow other data properties
}

interface PropertiesPanelProps {
  selectedNode: Node<NodeWithLabelData> | null;
  onUpdateNodeLabel: (nodeId: string, newLabel: string) => void;
}

// Helper function to format node type for display
const formatNodeType = (type?: string): string => {
  if (!type) return 'N/A';
  switch (type) {
    case 'inputSource': return 'Input Source';
    case 'outputSink': return 'Output Sink';
    case 'andGate': return 'AND Gate';
    case 'orGate': return 'OR Gate';
    case 'notGate': return 'NOT Gate';
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, onUpdateNodeLabel }) => {
  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedNode) {
      onUpdateNodeLabel(selectedNode.id, event.target.value);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        width: 250, // Fixed width for the panel
        p: 2, 
        overflowY: 'auto',
        height: '100%', // Fill the height of the parent flex container
        borderLeft: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Typography variant="h6" gutterBottom>
        Properties
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {selectedNode ? (
        <Box>
          <Typography variant="subtitle2" gutterBottom>ID:</Typography>
          <Typography variant="body2" sx={{ mb: 2, wordBreak: 'break-all' }}>{selectedNode.id}</Typography>
          
          <Typography variant="subtitle2" gutterBottom>Type:</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>{formatNodeType(selectedNode.type)}</Typography>
          
          {typeof selectedNode.data?.label !== 'undefined' && (
            <>
              <Typography variant="subtitle2" gutterBottom>Label:</Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={selectedNode.data.label}
                onChange={handleLabelChange}
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: 'text.secondary' } }}
                inputProps={{ style: { color: 'text.primary' } }}
              />
            </>
          )}
          {/* Add more editable properties here if needed, e.g., specific to node type */}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Select a node to see its properties.
        </Typography>
      )}
    </Paper>
  );
};

export default PropertiesPanel;
