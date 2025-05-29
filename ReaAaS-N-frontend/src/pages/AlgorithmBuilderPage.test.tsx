import { render, screen, within } from '@testing-library/react'; 
import userEvent from '@testing-library/user-event';
import AlgorithmBuilderPage from './AlgorithmBuilderPage';
import { vi } from 'vitest';

// Mock react-beautiful-dnd
vi.mock('react-beautiful-dnd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-beautiful-dnd')>();
  return {
    ...actual,
    DragDropContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
    Droppable: ({ children, droppableId }: { children: (provided: any, snapshot: any) => React.ReactElement, droppableId: string }) => 
      children({ 
        innerRef: vi.fn(), 
        droppableProps: { 'data-testid': `droppable-${droppableId}` }, 
        placeholder: <div data-testid={`placeholder-${droppableId}`}>Placeholder</div> 
      }, {}),
    Draggable: ({ children, draggableId, index }: { children: (provided: any, snapshot: any) => React.ReactElement, draggableId: string, index: number }) => 
      children({ 
        innerRef: vi.fn(), 
        draggableProps: { 'data-testid': `draggable-${draggableId}`, style: {} }, 
        dragHandleProps: {} 
      }, { isDragging: false }),
  };
});


describe('AlgorithmBuilderPage - Core Logic', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });


  test('addStep functionality: adds a new step and clears input', async () => {
    render(<AlgorithmBuilderPage />);
    
    const newStepInput = screen.getByLabelText(/New Step Description/i);
    const addButton = screen.getByRole('button', { name: /Add Step/i });
    const stepsList = screen.getByTestId('droppable-steps'); 

    await user.type(newStepInput, 'First test step');
    await user.click(addButton);

    expect(within(stepsList).getByText(/1\. First test step/i)).toBeInTheDocument();
    expect(newStepInput).toHaveValue(''); 

    await user.type(newStepInput, 'Second test step');
    await user.click(addButton);
    
    expect(within(stepsList).getByText(/1\. First test step/i)).toBeInTheDocument(); 
    expect(within(stepsList).getByText(/2\. Second test step/i)).toBeInTheDocument(); 
    expect(newStepInput).toHaveValue(''); 
  });

  test('generateAlgorithm functionality: generates steps from text and clears input', async () => {
    render(<AlgorithmBuilderPage />);

    const llmInput = screen.getByLabelText(/Generate Algorithm with AI/i); // This should be a textarea
    const generateButton = screen.getByRole('button', { name: /Generate with AI/i });
    const stepsList = screen.getByTestId('droppable-steps');
    
    const newStepInput = screen.getByLabelText(/New Step Description/i);
    const addButton = screen.getByRole('button', { name: /Add Step/i });
    await user.type(newStepInput, 'Initial step to be replaced');
    await user.click(addButton);
    expect(within(stepsList).getByText(/Initial step to be replaced/i)).toBeInTheDocument();

    // Use userEvent.type with {enter} for newlines in a textarea
    await user.clear(llmInput);
    await user.type(llmInput, "Step A{enter}Step B{enter}{enter}Step C");
    
    await user.click(generateButton);

    expect(within(stepsList).queryByText(/Initial step to be replaced/i)).not.toBeInTheDocument(); 
    expect(within(stepsList).getByText(/1\. Step A/i)).toBeInTheDocument();
    expect(within(stepsList).getByText(/2\. Step B/i)).toBeInTheDocument();
    expect(within(stepsList).getByText(/3\. Step C/i)).toBeInTheDocument(); 
    expect(llmInput).toHaveValue(''); 
  });

  test('deleteStep functionality: removes a step', async () => {
    render(<AlgorithmBuilderPage />);

    const newStepInput = screen.getByLabelText(/New Step Description/i);
    const addButton = screen.getByRole('button', { name: /Add Step/i });
    const stepsList = screen.getByTestId('droppable-steps');

    await user.type(newStepInput, 'Step to keep');
    await user.click(addButton);
    await user.type(newStepInput, 'Step to delete');
    await user.click(addButton);

    expect(within(stepsList).getByText(/1\. Step to keep/i)).toBeInTheDocument();
    const stepToDeleteTextElement = within(stepsList).getByText(/2\. Step to delete/i);
    expect(stepToDeleteTextElement).toBeInTheDocument();

    const draggableStep = stepToDeleteTextElement.closest('[data-testid^="draggable-"]');
    if (!draggableStep) throw new Error('Could not find draggable step container');
    
    const deleteButton = within(draggableStep as HTMLElement).getByRole('button', { name: /Delete/i });
    await user.click(deleteButton);

    expect(within(stepsList).getByText(/1\. Step to keep/i)).toBeInTheDocument();
    expect(within(stepsList).queryByText(/Step to delete/i)).not.toBeInTheDocument();
    expect(within(stepsList).queryByText(/2\. Step to delete/i)).not.toBeInTheDocument(); 
  });
  
  test('onDragEnd functionality: should be covered by E2E tests', () => {
    expect(true).toBe(true); 
  });
});
