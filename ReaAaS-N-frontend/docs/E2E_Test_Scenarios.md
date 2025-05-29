# End-to-End Test Scenarios

This document outlines End-to-End (E2E) test scenarios for the ReaAaS-N frontend application, covering the Algorithm Builder and the Circuit Designer.

## Algorithm Builder

### Scenario: Manual Step Management

*   **Title:** User can add, reorder, and delete algorithm steps manually.
*   **Steps to Perform:**
    1.  Navigate to the Algorithm Builder.
    2.  In the "New Step Description" input, type "Step 1" and click "Add Step".
    3.  Type "Step 2" and click "Add Step".
    4.  Type "Step 3" and click "Add Step".
    5.  Verify "Step 1", "Step 2", "Step 3" appear in order.
    6.  Drag "Step 3" and drop it before "Step 2".
    7.  Verify the order is now "Step 1", "Step 3", "Step 2".
    8.  Click the "Delete" button for "Step 3" (which is now in the middle).
    9.  Verify the order is now "Step 1", "Step 2" and "Step 3" is gone.
    10. Click the "Delete" button for "Step 2" (which is now the last step).
    11. Verify only "Step 1" remains.
    12. Add "Step 4". Click the "Delete" button for "Step 1".
    13. Verify only "Step 4" (now numbered as "1. Step 4") remains.
*   **Expected Outcomes:**
    *   Steps are added to the list with correct numbering and content.
    *   Input field clears after adding a step.
    *   Steps can be reordered via drag-and-drop, and the numbering updates.
    *   Specific steps are removed when their delete button is clicked, and the list re-numbers correctly.

### Scenario: Natural Language Step Generation (Multiline)

*   **Title:** User can generate multiple algorithm steps from multiline text input.
*   **Steps to Perform:**
    1.  Navigate to the Algorithm Builder.
    2.  Add a few initial steps manually (e.g., "Old Step 1", "Old Step 2").
    3.  In the "Generate Algorithm with AI" text area, enter the following text (including newlines and empty lines):
        ```
        First generated step
        Second generated step

        Third generated step
        ```
    4.  Click the "Generate with AI" button.
*   **Expected Outcomes:**
    *   The existing "Old Step 1" and "Old Step 2" are removed from the list.
    *   The new steps are populated as:
        1.  "First generated step"
        2.  "Second generated step"
        3.  "Third generated step"
    *   Empty lines from the input are ignored.
    *   The "Generate Algorithm with AI" text area is cleared after generation.

### Scenario: Algorithm Execution and Visualization

*   **Title:** User can run an algorithm and see the execution visualized.
*   **Steps to Perform:**
    1.  Navigate to the Algorithm Builder.
    2.  Add three steps: "Step A", "Step B", "Step C".
    3.  Click the "Run Algorithm" button.
*   **Expected Outcomes:**
    *   The "Run Algorithm" button text changes to "Running Algorithm..." and becomes disabled.
    *   The "Algorithm Visualization" area shows "Step A" highlighted (e.g., different background color).
    *   After a short delay (e.g., 1 second), "Step B" is highlighted, and "Step A" returns to normal.
    *   After another delay, "Step C" is highlighted, and "Step B" returns to normal.
    *   After the final step, all steps return to normal highlighting.
    *   The "Run Algorithm" button text reverts to "Run Algorithm" and becomes enabled.
    *   The `currentStep` state (if observable through dev tools or specific UI indicators not yet present) should cycle through 0, 1, 2, then -1.

## Circuit Designer

### Scenario: Full Circuit Creation and Simulation (AND Gate)

*   **Title:** User can create, wire, and simulate a simple AND gate circuit.
*   **Steps to Perform:**
    1.  Navigate to the Circuit Designer page.
    2.  Drag an "Input Source" component from the palette onto the canvas.
    3.  Drag another "Input Source" component onto the canvas.
    4.  Drag an "AND Gate" component onto the canvas.
    5.  Drag an "Output Sink" component onto the canvas.
    6.  Connect the first Input Source's output handle to the 'a' input handle of the AND gate.
    7.  Connect the second Input Source's output handle to the 'b' input handle of the AND gate.
    8.  Connect the AND gate's output handle to the Output Sink's input handle.
    9.  Verify initial state: Input Sources show "0", AND gate output shows "0", Output Sink shows "0".
    10. Toggle the first Input Source to "1". Verify Output Sink still shows "0".
    11. Toggle the first Input Source back to "0". Toggle the second Input Source to "1". Verify Output Sink still shows "0".
    12. Toggle the first Input Source to "1" (so both inputs are "1"). Verify Output Sink now shows "1".
    13. Toggle the second Input Source to "0". Verify Output Sink returns to "0".
    14. Select the first Input Source node. In the Properties Panel, change its label to "Input A". Verify the label updates (if custom nodes display labels, otherwise this verifies data update).
*   **Expected Outcomes:**
    *   Nodes are correctly placed on the canvas.
    *   Edges (wires) can be drawn and connect to the correct handles.
    *   The Input Source nodes correctly display their value (0/1) and can be toggled.
    *   The AND gate node displays its calculated output value.
    *   The Output Sink node displays the final value from the AND gate.
    *   The circuit correctly implements AND logic for all four input combinations (00->0, 01->0, 10->0, 11->1).
    *   Node labels can be edited in the Properties Panel, and the changes are reflected in the node's data.

### Scenario: Deleting Elements

*   **Title:** User can delete nodes and edges from the circuit.
*   **Steps to Perform:**
    1.  Navigate to the Circuit Designer.
    2.  Create a simple circuit (e.g., Input -> NOT -> Output).
    3.  Select the edge between the Input Source and the NOT gate. Press the "Delete" or "Backspace" key.
    4.  Verify the edge is removed.
    5.  Select the NOT gate node. Press the "Delete" or "Backspace" key.
    6.  Verify the NOT gate node is removed.
    7.  Verify any edges connected to the deleted NOT gate are also removed.
*   **Expected Outcomes:**
    *   Selected edges are removed using keyboard delete.
    *   Selected nodes are removed using keyboard delete.
    *   When a node is deleted, all edges connected to it are automatically removed.

### Scenario: Save and Load Circuit

*   **Title:** User can save a circuit to local storage and load it back.
*   **Steps to Perform:**
    1.  Navigate to the Circuit Designer.
    2.  Create a circuit (e.g., two Input Sources, one OR gate, one Output Sink, wired appropriately). Label one input "MyInput1". Toggle its value to "1".
    3.  Adjust the zoom and pan (viewport).
    4.  Click the "Save Circuit" button.
    5.  (Conceptually, refresh the page or clear current state by deleting all nodes/edges if no hard refresh E2E command is available). For a test, this might involve re-navigating or triggering a component reset.
    6.  Click the "Load Circuit" button.
    7.  Verify the circuit (nodes with their labels and values, edges, viewport position/zoom) is restored to the saved state.
    8.  Toggle the "MyInput1" (which should be "1"). Verify it changes to "0" and the OR gate simulation updates correctly.
*   **Expected Outcomes:**
    *   An alert "Circuit saved!" appears after saving.
    *   An alert "Circuit loaded!" appears after loading.
    *   The exact same nodes, their positions, their data (including labels and current values for Input Sources), and edges are restored.
    *   The viewport (pan and zoom) is restored.
    *   The loaded circuit is fully interactive, and the simulation works correctly (e.g., toggling an input propagates changes).

### Scenario: Complex Propagation

*   **Title:** Simulation correctly propagates signals through a chain of multiple logic gates.
*   **Steps to Perform:**
    1.  Navigate to the Circuit Designer.
    2.  Create the following circuit:
        *   Input Source A (INA)
        *   Input Source B (INB)
        *   Input Source C (INC)
        *   NOT Gate (NOT1) connected to INA.
        *   AND Gate (AND1) with inputs from NOT1 (output) and INB.
        *   OR Gate (OR1) with inputs from AND1 (output) and INC.
        *   Output Sink (OUT1) connected to OR1 (output).
    3.  Test various input combinations for INA, INB, INC and verify OUT1:
        *   INA=0, INB=0, INC=0: (NOT1=1, AND1(1,0)=0, OR1(0,0)=0) -> OUT1=0
        *   INA=1, INB=1, INC=0: (NOT1=0, AND1(0,1)=0, OR1(0,0)=0) -> OUT1=0
        *   INA=0, INB=1, INC=0: (NOT1=1, AND1(1,1)=1, OR1(1,0)=1) -> OUT1=1
        *   INA=0, INB=1, INC=1: (NOT1=1, AND1(1,1)=1, OR1(1,1)=1) -> OUT1=1
        *   INA=1, INB=0, INC=1: (NOT1=0, AND1(0,0)=0, OR1(0,1)=1) -> OUT1=1
*   **Expected Outcomes:**
    *   The OUT1 Output Sink displays the correct final boolean value for each combination of inputs, demonstrating correct signal propagation through the chain of NOT, AND, and OR gates.
    *   Intermediate gate outputs (if made visible or inferable) should also be correct.

## General Navigation

### Scenario: Navigation Between Tools

*   **Title:** User can navigate between the Algorithm Builder and Circuit Designer pages.
*   **Steps to Perform:**
    1.  Start on the Algorithm Builder page (e.g., root URL).
    2.  Verify unique content of Algorithm Builder is visible.
    3.  Click the "Circuit Designer" navigation link/button in the AppBar.
    4.  Verify the Circuit Designer page is displayed (e.g., palette, React Flow canvas).
    5.  Click the "Algorithm Builder" navigation link/button in the AppBar.
    6.  Verify the Algorithm Builder page is displayed again.
*   **Expected Outcomes:**
    *   The application correctly navigates to the selected page.
    *   The content specific to each page (Algorithm Builder UI or Circuit Designer UI) is rendered.
    *   **Advanced/Optional:** The state of each tool (e.g., steps in Algorithm Builder, nodes/edges in Circuit Designer) is preserved when navigating away and then back to it during the same session. (This might depend on implementation details like Redux, Zustand, or component state persistence strategies).

```
