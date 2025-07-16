import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';

interface Step {
  id: string;
  content: string;
}

// Basic AlgorithmVisualization component (can be moved to a separate file later)
interface AlgorithmVisualizationProps {
  steps: Step[];
  currentStep: number;
}

const AlgorithmVisualization: React.FC<AlgorithmVisualizationProps> = ({ steps, currentStep }) => {
  return (
    <Box sx={{ mt: 4, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>Algorithm Visualization</Typography>
      {steps.map((step, index) => (
        <Card 
          key={step.id} 
          sx={{ 
            mb: 1, 
            backgroundColor: index === currentStep ? 'primary.light' : 'background.paper',
            border: index === currentStep ? '2px solid' : '1px solid',
            borderColor: index === currentStep ? 'secondary.main' : 'grey.700',
          }}
        >
          <CardContent>
            <Typography sx={{ color: index === currentStep ? 'common.black' : 'text.primary' }}>
              {index + 1}. {step.content}
            </Typography>
          </CardContent>
        </Card>
      ))}
      {steps.length === 0 && <Typography sx={{color: 'text.secondary'}}>No steps to visualize.</Typography>}
    </Box>
  );
};


const AlgorithmBuilderPage: React.FC = () => { // Changed function name
  const [steps, setSteps] = useState<Step[]>([]);
  const [newStep, setNewStep] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [llmInput, setLlmInput] = useState<string>('');
  const [debugInput, setDebugInput] = useState<string>('');

  const generateAlgorithm = () => {
    if (llmInput.trim() === '') return;

    const generatedSteps = llmInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
      .map((line, index) => ({ // Using uuidv4 for consistency with addStep
        id: uuidv4(), 
        content: line,
      }));

    if (generatedSteps.length > 0) {
      setSteps(generatedSteps); // Replace existing steps
    }
    setLlmInput(''); // Clear the input field
  };

  const addStep = () => {
    if (newStep.trim() === '') return;
    setSteps([...steps, { id: uuidv4(), content: newStep.trim() }]);
    setNewStep('');
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSteps(items);
  };

  const runAlgorithm = async () => {
    setIsRunning(true);
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate step execution
    }
    setIsRunning(false);
    setCurrentStep(-1);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'text.primary', textAlign: 'center' }}>
        Algorithm Builder
      </Typography>

      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="New Step Description"
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          sx={{ mr: 1 }}
          InputLabelProps={{ style: { color: 'text.secondary' } }}
          inputProps={{ style: { color: 'text.primary' } }}
        />
        <Button variant="contained" color="primary" onClick={addStep} sx={{height: '56px'}}>
          Add Step
        </Button>
      </Box>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <Box {...provided.droppableProps} ref={provided.innerRef} sx={{mb: 2, p:1, border: '1px solid grey.700', borderRadius: 1, minHeight: '100px'}}>
              {steps.length === 0 && <Typography sx={{color: 'text.secondary', textAlign: 'center', mt:2}}>Drag and drop steps here, or add new ones above.</Typography>}
              {steps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(providedDraggable, snapshot) => (
                    <Card
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      {...providedDraggable.dragHandleProps}
                      sx={{
                        mb: 1,
                        backgroundColor: snapshot.isDragging ? 'primary.dark' : 'background.paper',
                        border: '1px solid',
                        borderColor: snapshot.isDragging ? 'secondary.main' : 'grey.700',
                        opacity: snapshot.isDragging ? 0.8 : 1,
                      }}
                    >
                      <CardContent sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography sx={{ color: 'text.primary' }}>{index + 1}. {step.content}</Typography>
                        {/* Basic delete button, can be improved */}
                        <Button 
                            size="small" 
                            variant="outlined" 
                            color="secondary"
                            onClick={() => {
                                const newSteps = steps.filter(s => s.id !== step.id);
                                setSteps(newSteps);
                            }}
                            sx={{ml: 1}}
                        >
                            Delete
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        fullWidth
        variant="contained"
        color="secondary"
        onClick={runAlgorithm}
        disabled={isRunning || steps.length === 0}
        sx={{ mb: 2, height: '48px' }}
      >
        {isRunning ? 'Running Algorithm...' : 'Run Algorithm'}
      </Button>

      {steps.length > 0 && <AlgorithmVisualization steps={steps} currentStep={currentStep} />}

      {/* Placeholder LLM/Debug UI */}
      <Grid container spacing={2} sx={{ mt: 4, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>AI Tools</Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="Generate Algorithm with AI"
            value={llmInput}
            onChange={(e) => setLlmInput(e.target.value)}
            sx={{ mb: 1 }}
            InputLabelProps={{ style: { color: 'text.secondary' } }}
            inputProps={{ style: { color: 'text.primary' } }}
          />
          <Button fullWidth variant="outlined" color="primary" sx={{ mb: 2 }} onClick={generateAlgorithm}>
            Generate with AI
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>Debug Tools</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            label="Describe UI Issue for AI Debugger"
            value={debugInput}
            onChange={(e) => setDebugInput(e.target.value)}
            sx={{ mb: 1 }}
            InputLabelProps={{ style: { color: 'text.secondary' } }}
            inputProps={{ style: { color: 'text.primary' } }}
          />
          <Button fullWidth variant="outlined" color="warning">
            Debug with AI
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}; // Changed function name

export default AlgorithmBuilderPage; // Changed export
