import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react'; // Removed useReactFlow, Node as it's not needed here
import { Paper, Typography, Box, Switch } from '@mui/material';

// data prop for this node type
export interface InputSourceData {
  label: string;
  value: boolean;
  onValueChange: (id: string, value: boolean) => void; // Added for simulation trigger
}

const InputSourceNode: React.FC<NodeProps<InputSourceData>> = ({ id, data, isConnectable }) => {
  // No need for setNodes here, use the passed callback
  // const { setNodes } = useReactFlow(); 

  const onToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    // Call the callback passed in data to update the node and trigger simulation
    if (data.onValueChange) {
      data.onValueChange(id, newValue);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 1.5, 
        width: 150, 
        textAlign: 'center', 
        border: '1px solid', 
        borderColor: 'primary.main',
        borderRadius: 1
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}>
        {data.label || 'Input Source'}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          {data.value ? '1' : '0'}
        </Typography>
        <Switch checked={data.value} onChange={onToggleChange} size="small" color="primary" />
      </Box>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        id="output" // Ensure handle ID is consistent
        style={{ background: '#555' }}
      />
    </Paper>
  );
};

export default InputSourceNode;
