# Classical Circuit Designer User Guide

## Overview

Welcome to the Classical Circuit Designer! This tool allows you to visually create, simulate, and manage digital logic circuits. You can build circuits using standard logic gates, input sources, and output sinks, then observe their behavior in real-time. You can also save your designs to your browser's local storage and load them back later.

## Accessing the Circuit Designer

To access the Classical Circuit Designer:
1.  Open the ReaAaS-N application in your web browser.
2.  Click on the **"Circuit Designer"** link, typically found in the main navigation bar at the top of the page.

## Interface Overview

The Circuit Designer interface is primarily composed of three main areas, along with save/load controls:

*   **Component Palette:**
    *   Located on the **left sidebar**.
    *   This palette lists the available classical logic components you can use to build your circuit:
        *   **Input Source:** Provides a boolean input (0 or 1, LOW or HIGH) that you can toggle.
        *   **Output Sink:** Displays a boolean output value from the circuit.
        *   **AND Gate:** Performs a logical AND operation.
        *   **OR Gate:** Performs a logical OR operation.
        *   **NOT Gate:** Performs a logical NOT (inversion) operation.
*   **Canvas:**
    *   The large central area of the page.
    *   This is your main workspace where you drag components and draw wires to build your circuit.
    *   You can pan (move around) and zoom within the canvas.
*   **Properties Panel:**
    *   Located on the **right sidebar**.
    *   When you select a component (node) on the canvas, this panel displays its properties, such as its ID, type, and an editable **Label**.
*   **Save/Load Buttons:**
    *   Located at the top-left of the canvas area.
    *   **"Save Circuit" Button:** Saves your current circuit design.
    *   **"Load Circuit" Button:** Loads a previously saved circuit design.

## Building Your Circuit

### Adding Components

1.  Locate the desired component in the **Component Palette** on the left.
2.  Click and hold the mouse button down on the component in the palette.
3.  Drag the component from the palette onto the **Canvas**.
4.  Release the mouse button to place the component on the canvas.
5.  You can add multiple instances of any component.

### Wiring Components (Creating Edges)

Components are connected using wires (also called edges) between their connection points (handles).

1.  Identify the components you want to connect on the canvas.
2.  Hover your mouse over a component; small circular **handles** will appear on its sides.
    *   Output handles (typically on the right side of a node) are where a signal originates.
    *   Input handles (typically on the left side of a node) are where a signal is received.
3.  Click and hold the mouse button on an output handle of one component.
4.  Drag the mouse to an input handle of another component.
5.  Release the mouse button when the target handle is highlighted (or when your cursor is over it).
6.  A wire will be drawn connecting the two handles. Wires are animated and typically colored (e.g., teal).

### Interacting with Components

*   **Selecting Nodes/Wires:**
    *   Click on any component (node) or wire (edge) on the canvas to select it.
    *   Selected elements are usually highlighted. When a node is selected, its details appear in the **Properties Panel**.
*   **Moving Nodes:**
    *   Click and drag any component (node) on the canvas to move it to a new position.
*   **Deleting Nodes/Wires:**
    1.  Select the node or wire you wish to delete by clicking on it.
    2.  Press the **Delete** key or the **Backspace** key on your keyboard.
    3.  The selected element will be removed. If you delete a node, any wires connected to it will also be automatically removed.

### Editing Component Labels

Each component on the canvas can have a custom label.

1.  Click on a component (node) on the canvas to select it.
2.  The **Properties Panel** on the right will update to show the properties of the selected node.
3.  Locate the **"Label"** field in the Properties Panel.
4.  Click into the "Label" text field and type your desired label (e.g., "Main Input A", "Final Output").
5.  The label change is saved automatically as you type. This label is part of the data saved with your circuit. (Note: The visual display of this label on the node itself depends on the specific custom node's design; currently, most nodes display their type or value rather than this editable data label).

## Simulating Your Circuit

The circuit simulation runs in real-time as you build and interact with it.

*   **Using `InputSourceNode`:**
    *   The `InputSourceNode` is your primary way to provide input to the circuit.
    *   It displays its current boolean value (0 for LOW/false, 1 for HIGH/true).
    *   Click the **Switch** control on the `InputSourceNode` to toggle its value between 0 and 1.
*   **Automatic Propagation:**
    *   When you change the value of an `InputSourceNode`, the change automatically propagates through the connected wires and logic gates.
*   **Observing the Simulation:**
    *   **`OutputSinkNode`:** Displays the final boolean value (0 or 1) it receives from its connected input. Its background color also changes (e.g., to a light green for '1' and light red for '0') to indicate its state.
    *   **Logic Gates (`AND`, `OR`, `NOT`):** These gates also visually indicate their current output value. They will display text like "Out: 1" or "Out: 0" and their background color will change similarly to the `OutputSinkNode` to reflect their output state.
    *   **Wires (Edges):** Wires are animated to suggest signal flow but do not change color based on the boolean value they carry.

By toggling input sources and observing the outputs and intermediate gate states, you can test and verify the logic of your circuit design.

## Saving and Loading Your Work

You can save your circuit designs to your browser's local storage and load them back later.

### Saving a Circuit

1.  Once you are happy with your circuit design, click the **"Save Circuit"** button located at the top-left of the canvas area.
2.  An alert message (e.g., "Circuit saved!") will appear to confirm that your circuit has been saved.
3.  Your circuit design, including the positions of all nodes, their connections (wires), their current data (like labels and input source values), and the current viewport (zoom and pan settings), is saved in your browser's local storage.

### Loading a Circuit

1.  To load a previously saved circuit, click the **"Load Circuit"** button, also located at the top-left of the canvas area.
2.  If a saved circuit is found in your browser's local storage, it will be loaded onto the canvas.
    *   The nodes, wires, and their states will be restored.
    *   The viewport (pan and zoom) will also be restored to how it was when saved.
    *   An alert message (e.g., "Circuit loaded!") will confirm the load.
3.  If no saved circuit data is found, an alert message (e.g., "No saved circuit found.") will be displayed.
4.  After loading, the circuit is fully interactive, and the simulation will be active.

This allows you to persist your work between sessions on the same browser.
```
