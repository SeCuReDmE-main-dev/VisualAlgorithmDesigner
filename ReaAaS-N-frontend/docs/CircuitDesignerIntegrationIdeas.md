# Integration Ideas: Circuit Designer & Algorithm Builder

This document outlines potential concepts for integrating the Classical Circuit Designer with the linear Algorithm Builder within the ReaAaS-N application.

## 1. Circuit as a Custom Algorithm Step (Function Call)

*   **Description:**
    A user could define a specific step type in the linear Algorithm Builder that represents an "execution" of a saved circuit from the Circuit Designer.
    - When defining this step, the user would select a saved circuit.
    - The UI would then allow mapping variables from the linear algorithm's current scope to the `InputSourceNode`s of the selected circuit.
    - Upon execution of this step, the circuit simulation would run with the provided input values.
    - The values from the circuit's `OutputSinkNode`s would then be mapped back to specified variables in the linear algorithm's scope.
    - This effectively allows a circuit to act like a reusable function or a complex custom operation within the linear flow.

*   **Key Considerations/Challenges:**
    *   **Data Mapping UI:** Designing an intuitive UI to map algorithm variables to circuit inputs and circuit outputs back to algorithm variables. This could involve dropdowns, drag-and-drop, or a naming convention.
    *   **Circuit Identification:** How to reference/load saved circuits (e.g., by name, ID). Requires a save/load mechanism for circuits that is accessible to the Algorithm Builder.
    *   **Synchronous/Asynchronous Execution:** Decide if the circuit execution blocks the linear algorithm or if it can run asynchronously (more complex, but potentially useful for long-running simulations). For classical logic, synchronous is likely sufficient.
    *   **Parameter Passing:** Handling data types and ensuring compatibility between algorithm variables and circuit inputs/outputs (e.g., boolean for classical logic).
    *   **Error Handling:** What happens if a circuit fails to load or produces unexpected output?
    *   **Circuit Versioning:** If a saved circuit is updated, how does it affect algorithm steps that use it?

## 2. Circuit for Conditional Logic ("If" Step Condition)

*   **Description:**
    An "If" or "Conditional" step in the linear Algorithm Builder could use a classical circuit to determine its true/false condition.
    - The user would select a saved circuit to act as the condition.
    - One or more `OutputSinkNode`s in the circuit would be designated as the "result" or "condition met" output (e.g., a specific named sink, or the first sink).
    - Inputs to this conditional circuit could be derived from algorithm variables or be constants defined within the circuit itself for the condition.
    - When the "If" step is encountered, the circuit is simulated. If the designated output sink(s) evaluate to `true`, the "true" branch of the algorithm is taken; otherwise, the "false" branch (if it exists) is taken.

*   **Key Considerations/Challenges:**
    *   **Defining "Main" Output:** A clear way to specify which `OutputSinkNode`(s) in the circuit determine the conditional result (e.g., a single, specially named output like "conditional_out").
    *   **Real-time Evaluation:** The circuit would need to be evaluated efficiently each time the conditional step is reached.
    *   **Complexity of Condition:** This allows for very complex, multi-input boolean conditions to be visually designed and managed.
    *   **UI for Conditional Step:** The "If" step UI in the Algorithm Builder would need to accommodate circuit selection and potentially input mapping for the conditional circuit.
    *   **Debugging:** Visualizing the state of the conditional circuit during algorithm debugging would be beneficial.

## 3. Global Signal Bus / Shared State

*   **Description:**
    Introduce a "Global Signal Bus" or a shared state manager that both the Algorithm Builder and the Circuit Designer can interact with.
    - **Algorithm Builder:** Steps in the linear algorithm could read the current state of named signals or write new values to them.
    - **Circuit Designer:**
        - `InputSourceNode`s could be configured to "subscribe" to a named signal on the bus, automatically updating their value when the signal changes.
        - `OutputSinkNode`s could be configured to "publish" their value to a named signal on the bus whenever their simulated state changes.
    - This allows for a looser coupling, where the Algorithm Builder might set up conditions or inputs, and the Circuit Designer reacts to them (or vice-versa) without a direct "call."

*   **Key Considerations/Challenges:**
    *   **State Management Complexity:** Managing a global state accessible by two distinct tools can become complex. Need a robust state management solution (e.g., Zustand, Redux, or a custom context).
    *   **Naming Conventions & Collisions:** Requires strict naming conventions for signals to avoid collisions.
    *   **Debugging & Traceability:** Understanding data flow and debugging issues can be harder with this indirect interaction compared to direct calls. Visual tools to inspect signal states would be essential.
    *   **Race Conditions/Update Loops:** Potential for creating unintended update loops if, for example, a circuit output updates a signal that then feeds back into its own input via the algorithm. Careful design of update propagation is needed.
    *   **User Interface:** UI elements would be needed to configure signal subscriptions/publications for nodes and algorithm steps.

## 4. Event-Driven Execution via Circuit Triggers

*   **Description:**
    Specific `OutputSinkNode`s in a circuit could be designated as "trigger" outputs. When such an output changes its state (e.g., goes from `false` to `true`), it emits an event.
    - The Algorithm Builder could have "Event Listener" steps that wait for specific events (emitted by circuit triggers) to proceed.
    - This allows a circuit to signal the linear algorithm to perform actions or continue its flow based on internal circuit logic reaching a certain state.
    - For example, a circuit might monitor several inputs, and only when a complex condition is met (triggering a specific output sink), does the linear algorithm advance.

*   **Key Considerations/Challenges:**
    *   **Event Naming and Management:** A system for defining and managing event names.
    *   **Listener Configuration:** UI for Algorithm Builder steps to subscribe to specific circuit events.
    *   **Circuit State Persistence:** The circuit might need to maintain its state independently for triggers to be meaningful over time.
    *   **Multiple Triggers:** Handling scenarios where multiple triggers might fire, or the order of events matters.
    *   **Debugging:** Tracing event flows and understanding why an algorithm did or did not proceed.

## 5. Direct Visual Embedding of Circuit Logic

*   **Description:**
    A step in the linear Algorithm Builder could allow for the direct embedding of a small, self-contained classical circuit.
    - Instead of "calling" a saved circuit, the user would design or paste a small circuit directly into a modal or expanded view associated with that algorithm step.
    - This circuit would have clearly defined input and output connection points that map to the algorithm step's local variables or flow.
    - This is suitable for small, step-specific logic that benefits from visual representation but doesn't warrant a full, separate, saved circuit.

*   **Key Considerations/Challenges:**
    *   **UI Complexity:** Embedding a fully interactive React Flow canvas within another UI (the Algorithm Builder step) can be complex to implement and manage.
    *   **Performance:** Multiple embedded React Flow instances could impact performance if not carefully managed.
    *   **Scope and Reusability:** These embedded circuits would likely be less reusable than globally saved circuits.
    *   **Data Serialization:** The definition of this embedded circuit would need to be saved as part of the algorithm step's data.
    *   **Interaction Model:** Defining how the user interacts with the embedded mini-designer versus the main algorithm builder.
