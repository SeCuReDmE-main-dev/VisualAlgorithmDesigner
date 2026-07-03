# Classical Circuit Designer User Guide

## Overview

The Classical Circuit Designer is the logic-circuit tool inside Visual Algorithm Designer. It helps students connect boolean inputs, gates, and outputs, then see how simple digital logic behaves.

## Accessing The Circuit Designer

1. Open the VAD application in your browser.
2. Select **Circuit Designer** from the main navigation.

## Interface

* **Component Palette:** input sources, output sinks, AND gates, OR gates, and NOT gates.
* **Canvas:** the central workspace where components are placed and wired.
* **Properties Panel:** shows editable details for the selected node.
* **Save/Load:** stores and restores a circuit in browser local storage.

## Building A Circuit

1. Drag a component from the left palette onto the canvas.
2. Repeat until the needed inputs, gates, and outputs are present.
3. Move nodes on the canvas to keep the circuit readable.

## Wiring Components

1. Hover a component to reveal its handles.
2. Drag from an output handle to an input handle.
3. Release on the highlighted target handle.

## Simulating Logic

Toggle an input source between `0` and `1`. VAD propagates the signal through connected gates and updates output sinks in real time.

## Saving And Loading

Use **Save Circuit** to store the current circuit locally. Use **Load Circuit** to restore the saved nodes, edges, labels, values, and viewport.
