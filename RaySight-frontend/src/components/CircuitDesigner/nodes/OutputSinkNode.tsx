import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Paper, Typography, Box } from '@mui/material';

// data prop for this node type
export interface OutputSinkData {
  label: string;
  value: boolean; // This will be updated by the simulation based on connected input
}

const OutputSinkNode: React.FC<NodeProps<OutputSinkData>> = ({ data, isConnectable }) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 1.5, 
        width: 150, 
        textAlign: 'center', 
        border: '1px solid', 
        borderColor: 'secondary.main', // Different color for distinction
        borderRadius: 1 
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}>
        {data.label || 'Output Sink'}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '24px' /* to match switch height */ }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {/* Value will be determined by connected input during simulation */}
          {data.value ? '1' : '0'} 
        </Typography>
      </Box>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        id="input"
        style={{ background: '#555' }}
      />
    </Paper>
  );
};

export default OutputSinkNode;
