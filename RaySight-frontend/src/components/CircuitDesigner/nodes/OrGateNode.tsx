import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Paper, Typography, Box } from '@mui/material'; // Added Box

// data prop for this node type
export interface OrGateData {
  label: string;
  outputValue: boolean; // Added for simulation output
}

const OrGateNode: React.FC<NodeProps<OrGateData>> = ({ data, isConnectable }) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 1.5, 
        width: 120, 
        minHeight: 80, // Use minHeight
        textAlign: 'center', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid grey',
        borderRadius: 1,
        bgcolor: data.outputValue ? 'success.light' : 'error.light', // Visual feedback
      }}
    >
      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
        {data.label || 'OR'}
      </Typography>
      <Typography variant="caption" sx={{ mt: 0.5 }}>
        Out: {data.outputValue ? '1' : '0'}
      </Typography>
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ top: '33%', background: '#555' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="b"
        style={{ top: '66%', background: '#555' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output" // Ensure handle ID is consistent
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </Paper>
  );
};

export default OrGateNode;
