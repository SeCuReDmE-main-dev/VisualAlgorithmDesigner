import React, { DragEvent, useRef, useCallback, useState, useEffect } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, Divider, Button, Stack } from '@mui/material'; // Added Button, Stack
import {
  ReactFlowProvider,
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Node,
  Edge,
  Connection,
  addEdge,
  Viewport, // Added Viewport
} from '@xyflow/react';

import '@xyflow/react/dist/style.css'; 

import InputSourceNode, { InputSourceData } from '../components/CircuitDesigner/nodes/InputSourceNode';
import OutputSinkNode, { OutputSinkData } from '../components/CircuitDesigner/nodes/OutputSinkNode';
import AndGateNode, { AndGateData } from '../components/CircuitDesigner/nodes/AndGateNode';
import OrGateNode, { OrGateData } from '../components/CircuitDesigner/nodes/OrGateNode';
import NotGateNode, { NotGateData } from '../components/CircuitDesigner/nodes/NotGateNode';

import PropertiesPanel from '../components/CircuitDesigner/PropertiesPanel';

export type CircuitNodeData = InputSourceData | OutputSinkData | AndGateData | OrGateData | NotGateData;

const nodeTypes = {
  inputSource: InputSourceNode,
  outputSink: OutputSinkNode,
  andGate: AndGateNode,
  orGate: OrGateNode,
  notGate: NotGateNode,
};

const initialNodes: Node<CircuitNodeData>[] = []; 
const initialEdges: Edge[] = []; 

const PALETTE_WIDTH = 200;
const LOCAL_STORAGE_KEY = 'circuitDesignerSaveData';


const PaletteItem: React.FC<{ nodeType: string; label: string }> = ({ nodeType, label }) => {
  const onDragStart = (event: DragEvent, type: string) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <ListItem 
      draggable 
      onDragStart={(event) => onDragStart(event, nodeType)}
      sx={{ 
        cursor: 'grab', p: 1, border: '1px solid', borderColor: 'divider', 
        borderRadius: 1, mb: 1, bgcolor: 'background.paper',
        '&:hover': { bgcolor: 'action.hover' }
      }}
    >
      <ListItemText primary={label} />
    </ListItem>
  );
};

const defaultEdgeOptions = {
  animated: true,
  style: { stroke: '#00A99D', strokeWidth: 2 }, 
};

// calculateCircuitState remains the same as in the previous implementation
const calculateCircuitState = (currentNodes: Node<CircuitNodeData>[], currentEdges: Edge[]): Node<CircuitNodeData>[] => {
  const nodeOutputCache: Record<string, boolean> = {}; 

  currentNodes.forEach(node => {
    if (node.type === 'inputSource') {
      nodeOutputCache[node.id] = (node.data as InputSourceData).value;
    } else if (node.type === 'andGate' || node.type === 'orGate' || node.type === 'notGate') {
      nodeOutputCache[node.id] = (node.data as AndGateData | OrGateData | NotGateData).outputValue || false;
    }
  });
  
  const MAX_ITERATIONS = currentNodes.length * 2; 
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let changesMade = false;
    currentNodes.forEach(node => {
      if (node.type === 'andGate' || node.type === 'orGate' || node.type === 'notGate') {
        const incomingEdges = currentEdges.filter(edge => edge.target === node.id);
        let inputA = false;
        let inputB = false; 

        if (node.type === 'notGate') {
          const edge = incomingEdges.find(e => e.targetHandle === 'input' || !e.targetHandle);
          if (edge) inputA = nodeOutputCache[edge.source] || false;
        } else { 
          const edgeA = incomingEdges.find(e => e.targetHandle === 'a');
          if (edgeA) inputA = nodeOutputCache[edgeA.source] || false;
          const edgeB = incomingEdges.find(e => e.targetHandle === 'b');
          if (edgeB) inputB = nodeOutputCache[edgeB.source] || false;
        }
        
        let newOutputValue = false;
        if (node.type === 'andGate') newOutputValue = inputA && inputB;
        else if (node.type === 'orGate') newOutputValue = inputA || inputB;
        else if (node.type === 'notGate') newOutputValue = !inputA;

        if (nodeOutputCache[node.id] !== newOutputValue) {
          nodeOutputCache[node.id] = newOutputValue;
          changesMade = true;
        }
      }
    });
    if (!changesMade && i > 0) break; 
  }

  return currentNodes.map(node => {
    const data = { ...node.data };
    if (node.type === 'andGate' || node.type === 'orGate' || node.type === 'notGate') {
      (data as AndGateData | OrGateData | NotGateData).outputValue = nodeOutputCache[node.id] || false;
    } else if (node.type === 'outputSink') {
      const incomingEdge = currentEdges.find(edge => edge.target === node.id);
      (data as OutputSinkData).value = incomingEdge ? (nodeOutputCache[incomingEdge.source] || false) : false;
    }
    return { ...node, data };
  });
};


const CircuitDesignerFlow: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<CircuitNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges); 
  const { screenToFlowPosition, getNodes, getEdges, getViewport, setViewport, fitView } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<Node<CircuitNodeData> | null>(null);

  const handleInputNodeValueChange = useCallback((nodeId: string, newValue: boolean) => {
    setNodes((currentNodes) => {
      const updatedNodesWithUserChange = currentNodes.map(n => {
        if (n.id === nodeId && n.type === 'inputSource') {
          return { ...n, data: { ...(n.data as InputSourceData), value: newValue } };
        }
        return n;
      });
      return calculateCircuitState(updatedNodesWithUserChange, getEdges());
    });
  }, [setNodes, getEdges]);

  useEffect(() => {
    setNodes((currentNodes) => calculateCircuitState(currentNodes, getEdges()));
  }, [edges, onNodesChange, setNodes, getEdges]);


  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    if (!reactFlowWrapper.current) return;
    const type = event.dataTransfer.getData('application/reactflow');
    if (typeof type === 'undefined' || !type) return;

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    let newNodeData: CircuitNodeData;

    switch (type) {
      case 'inputSource':
        newNodeData = { label: 'Input Source', value: false, onValueChange: handleInputNodeValueChange };
        break;
      case 'outputSink':
        newNodeData = { label: 'Output Sink', value: false };
        break;
      case 'andGate':
        newNodeData = { label: 'AND Gate', outputValue: false };
        break;
      case 'orGate':
        newNodeData = { label: 'OR Gate', outputValue: false };
        break;
      case 'notGate':
        newNodeData = { label: 'NOT Gate', outputValue: false };
        break;
      default:
        newNodeData = { label: 'Unknown' } as any;
    }

    const newNode: Node<CircuitNodeData> = {
      id: `dndnode_${type}_${Date.now()}`, type, position, data: newNodeData,
    };
    setNodes((nds) => calculateCircuitState(nds.concat(newNode), getEdges()));
  };

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node<CircuitNodeData>) => {
    setSelectedNode(node);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleUpdateNodeLabel = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, label: newLabel } } : node
      )
    );
    setSelectedNode(prevNode => 
      prevNode && prevNode.id === nodeId ? { ...prevNode, data: { ...prevNode.data, label: newLabel } } : prevNode
    );
  }, [setNodes]);

  // Save and Load Handlers
  const handleSaveCircuit = useCallback(() => {
    const currentNodes = getNodes(); // Use getNodes() for freshest state
    const currentEdges = getEdges();
    const currentViewport = getViewport();
    const saveData = { nodes: currentNodes, edges: currentEdges, viewport: currentViewport };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveData));
    alert('Circuit saved!');
  }, [getNodes, getEdges, getViewport]);

  const handleLoadCircuit = useCallback(() => {
    const savedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDataString) {
      const loadedData: { nodes: Node<CircuitNodeData>[]; edges: Edge[]; viewport?: Viewport } = JSON.parse(savedDataString);
      
      const rehydratedNodes = loadedData.nodes.map(node => {
        if (node.type === 'inputSource') {
          return {
            ...node,
            data: {
              ...node.data,
              onValueChange: handleInputNodeValueChange 
            }
          };
        }
        return node;
      });

      const finalNodesToSet = calculateCircuitState(rehydratedNodes, loadedData.edges || []);
      setNodes(finalNodesToSet);
      setEdges(loadedData.edges || []);

      if (loadedData.viewport) {
        setViewport(loadedData.viewport);
      } else {
        fitView(); // Fallback if no viewport saved
      }
      alert('Circuit loaded!');
    } else {
      alert('No saved circuit found.');
    }
  }, [setNodes, setEdges, setViewport, fitView, handleInputNodeValueChange]);


  return (
    <Box sx={{ display: 'flex', flexGrow: 1, height: '100%' }}>
      <Box 
        ref={reactFlowWrapper} 
        sx={{ flexGrow: 1, height: '100%' }}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {/* Save/Load buttons are placed here, above the ReactFlow canvas, for context */}
        <Stack direction="row" spacing={1} sx={{ p: 1, position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
            <Button variant="contained" size="small" onClick={handleSaveCircuit}>Save Circuit</Button>
            <Button variant="contained" size="small" onClick={handleLoadCircuit}>Load Circuit</Button>
        </Stack>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes} 
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          attributionPosition="top-right"
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </Box>
      <PropertiesPanel 
        selectedNode={selectedNode as Node<{label: string}> | null} 
        onUpdateNodeLabel={handleUpdateNodeLabel} 
      />
    </Box>
  );
}


const CircuitDesignerPage: React.FC = () => {
  const paletteItems = [
    { type: 'inputSource', label: 'Input Source' },
    { type: 'outputSink', label: 'Output Sink' },
    { type: 'andGate', label: 'AND Gate' },
    { type: 'orGate', label: 'OR Gate' },
    { type: 'notGate', label: 'NOT Gate' },
  ];

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', width: '100%' }}>
      <ReactFlowProvider> 
        <Paper 
          elevation={3} 
          sx={{ 
            width: PALETTE_WIDTH, p: 2, overflowY: 'auto',
            height: '100%', borderRight: '1px solid', borderColor: 'divider',
            flexShrink: 0 
          }}
        >
          <Typography variant="h6" gutterBottom>Components</Typography>
          <Divider sx={{mb: 1}}/>
          {/* Buttons were moved into CircuitDesignerFlow for easier access to handlers */}
          <List>
            {paletteItems.map(item => (
              <PaletteItem key={item.type} nodeType={item.type} label={item.label} />
            ))}
          </List>
        </Paper>
        <CircuitDesignerFlow /> 
      </ReactFlowProvider>
    </Box>
  );
};

export default CircuitDesignerPage;
