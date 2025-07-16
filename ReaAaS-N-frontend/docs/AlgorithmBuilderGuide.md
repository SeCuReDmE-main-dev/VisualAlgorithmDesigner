# Algorithm Builder User Guide

## Overview

Welcome to the Algorithm Builder! This tool is designed to help you create, visualize, and simulate linear algorithms step-by-step. You can define the logic of your algorithm, reorder steps, and watch a visual representation of its execution.

## Accessing the Algorithm Builder

To access the Algorithm Builder:
1.  Open the ReaAaS-N application in your web browser.
2.  Click on the **"Algorithm Builder"** link, typically found in the main navigation bar at the top of the page. This is usually the default page when the application loads.

## Interface Overview

The Algorithm Builder interface is composed of several key areas:

*   **New Step Input Field:**
    *   Located at the top of the main content area, labeled **"New Step Description"**.
    *   This is where you type the textual description for a new algorithm step.
*   **"Add Step" Button:**
    *   Positioned next to the "New Step Description" input field.
    *   Clicking this button adds the text from the input field as a new step to your algorithm.
*   **Algorithm Steps List:**
    *   This central area displays all the steps you've added to your algorithm.
    *   Each step is shown as a card with its sequential number and description.
    *   You can **drag-and-drop** these cards to reorder the steps.
    *   Each step card has a **"Delete"** button to remove it from the algorithm.
*   **Natural Language Input Area (AI Tools):**
    *   Labeled **"Generate Algorithm with AI"**. This is a text area where you can input multiple steps at once, typically by writing each step on a new line.
    *   The **"Generate with AI"** button below this text area processes the input. (Currently, this replaces all existing steps with the new ones from the text area).
*   **"Run Algorithm" Button:**
    *   A prominent button, usually below the steps list.
    *   Clicking this button starts the simulation of your algorithm.
*   **Algorithm Visualization Area:**
    *   Appears when you run an algorithm.
    *   This section displays the steps of your algorithm, highlighting the currently executing step.

## Working with Algorithm Steps

### Adding Steps Manually

1.  Locate the input field labeled **"New Step Description"**.
2.  Type the description of your algorithm step into this field (e.g., "Initialize variable X to 0").
3.  Click the **"Add Step"** button.
4.  The new step will appear in the Algorithm Steps List below, automatically numbered. The input field will be cleared, ready for your next step.

### Reordering Steps

1.  In the Algorithm Steps List, identify the step you wish to move.
2.  Click and hold the mouse button down on the step card.
3.  Drag the card up or down to the desired new position in the list.
4.  Release the mouse button.
5.  The steps will re-number themselves automatically to reflect the new order.

### Deleting Steps

1.  In the Algorithm Steps List, find the step you want to remove.
2.  On the right side of the step card, click the **"Delete"** button.
3.  The step will be removed from the list, and the remaining steps will be re-numbered.

## Using Natural Language Input

The Algorithm Builder provides a way to quickly create multiple steps using the "Generate Algorithm with AI" feature.

1.  Locate the text area labeled **"Generate Algorithm with AI"** (usually found under the "AI Tools" section).
2.  Type or paste your algorithm steps into this area. Each line of text you enter will become a distinct step.
    *Example Input:*
    ```
    Start
    Read input A
    Read input B
    If A > B, then print A
    Else, print B
    End
    ```
3.  Click the **"Generate with AI"** button.
4.  **Important:** Currently, this action will **replace all existing steps** in your algorithm with the ones generated from the text area. Empty lines in your input will be ignored.
5.  The text area will be cleared after the steps are generated.

## Running and Visualizing Your Algorithm

Once you have defined the steps of your algorithm, you can simulate its execution:

1.  Ensure your algorithm steps are in the desired order.
2.  Click the **"Run Algorithm"** button.
3.  The button's text will change to **"Running Algorithm..."** (or similar) and it may become disabled during execution.
4.  The **Algorithm Visualization** area will become active.
    *   Each step of your algorithm will be highlighted sequentially as it "executes".
    *   There is a short delay between steps to allow you to observe the flow.
5.  Once the simulation completes (all steps have been highlighted):
    *   The **"Run Algorithm"** button will return to its original state and become enabled again.
    *   The highlighting in the visualization area will reset.

This allows you to visually trace the flow of your algorithm and verify its logic. Happy building!
```
