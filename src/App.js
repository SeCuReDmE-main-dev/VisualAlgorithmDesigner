import * as React from "react";
import { SparkApp, PageContainer, Button, Input, Card, Textarea } from "@github/spark/components";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useKV } from "@github/spark/hooks";
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Visualization component for algorithm execution
function AlgorithmVisualization({ steps, currentStep }) {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Algorithm Execution</h2>
      {steps.map((step, index) => (
        <Card
          key={step.id}
          className={`mb-2 p-2 ${index === currentStep ? 'bg-accent-5' : 'bg-neutral-1'}`}
        >
          {step.content}
        </Card>
      ))}
    </div>
  );
}

// Main App component
function App() {
  // State for algorithm steps and LLM input/output
  const [steps, setSteps] = useKV("algorithm-steps", []);
  const [newStep, setNewStep] = React.useState("");
  const [llmInput, setLlmInput] = React.useState("");
  const [llmOutput, setLlmOutput] = React.useState("");
  const [isRunning, setIsRunning] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(-1);

  // State for debugging visual problems
  const [debugInput, setDebugInput] = React.useState("");
  const [debugOutput, setDebugOutput] = React.useState("");

  // Function to add a new step
  const addStep = () => {
    if (newStep.trim()) {
      setSteps([...steps, { id: `step-${Date.now()}`, content: newStep.trim() }]);
      setNewStep("");
    }
  };

  // Function to handle drag end
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newSteps = Array.from(steps);
    const [reorderedItem] = newSteps.splice(result.source.index, 1);
    newSteps.splice(result.destination.index, 0, reorderedItem);
    setSteps(newSteps);
  };

  // Function to run the algorithm
  const runAlgorithm = async () => {
    setIsRunning(true);
    setCurrentStep(-1);
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setIsRunning(false);
    setCurrentStep(-1);
  };

  // Function to generate algorithm using LLM
  const generateAlgorithm = async () => {
    const prompt = spark.llmPrompt`Hey AI, can you help me make an algorithm? Here's what I want it to do: ${llmInput}. Please give me each step on a new line.`;
    const response = await spark.llm(prompt);
    setLlmOutput(response);
    // Parse the response and add steps
    const generatedSteps = response.split('\n').filter(step => step.trim());
    setSteps(generatedSteps.map((step, index) => ({ id: `step-${Date.now()}-${index}`, content: step.trim() })));
  };

  // Function to debug visual problems using LLM
  const debugVisualProblem = async () => {
    const prompt = spark.llmPrompt`Hey AI, I'm having a problem with my app's visuals. Here's what's wrong: ${debugInput}. Can you help me fix it? Please give me a simple explanation and the code changes I need to make.`;
    const response = await spark.llm(prompt);
    setDebugOutput(response);
  };

  return (
    <SparkApp>
      <PageContainer>
        <h1 className="text-2xl font-bold mb-4">Algorithm Builder</h1>

        {/* Input for new steps */}
        <div className="mb-4 flex">
          <Input
            type="text"
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            placeholder="Type a new step here"
            className="mr-2"
          />
          <Button onClick={addStep}>Add Step</Button>
        </div>

        {/* Drag and drop area */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="steps">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="mb-4">
                {steps.map((step, index) => (
                  <Draggable key={step.id} draggableId={step.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`mb-2 p-2 ${snapshot.isDragging ? 'bg-accent-3' : 'bg-neutral-1'}`}
                      >
                        {step.content}
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Run Algorithm button */}
        <Button onClick={runAlgorithm} disabled={isRunning || steps.length === 0}>
          {isRunning ? "Running..." : "Run Algorithm"}
        </Button>

        {/* Algorithm Visualization */}
        {steps.length > 0 && (
          <AlgorithmVisualization steps={steps} currentStep={currentStep} />
        )}

        {/* LLM-assisted algorithm generation */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Generate Algorithm with AI</h2>
          <Input
            type="text"
            value={llmInput}
            onChange={(e) => setLlmInput(e.target.value)}
            placeholder="Describe what you want the algorithm to do"
            className="mb-2"
          />
          <Button onClick={generateAlgorithm}>Generate Algorithm</Button>
          {llmOutput && (
            <Card className="mt-4 p-2">
              <h3 className="font-semibold">Generated Algorithm:</h3>
              <pre className="whitespace-pre-wrap">{llmOutput}</pre>
            </Card>
          )}
        </div>

        {/* LLM-assisted debugging of visual problems */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Debug Visual Issues with AI</h2>
          <Textarea
            value={debugInput}
            onChange={(e) => setDebugInput(e.target.value)}
            placeholder="Describe the visual problem you're having"
            rows={4}
            className="mb-2"
          />
          <Button onClick={debugVisualProblem}>Debug Issue</Button>
          {debugOutput && (
            <Card className="mt-4 p-2">
              <h3 className="font-semibold">Debugging Suggestions:</h3>
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: spark.markdownToHtml(debugOutput) }}
              />
            </Card>
          )}
        </div>

      </PageContainer>
    </SparkApp>
  );
}

export default App;
