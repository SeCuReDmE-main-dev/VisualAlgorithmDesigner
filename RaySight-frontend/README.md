# VAD Frontend

## Overview

This directory contains the Visual Algorithm Designer frontend. VAD is the product surface; RaySight is the mascot and learning guide used inside the interface. The frontend includes the visual algorithm canvas, starter-kit library, lesson inspector, RaySight guide panel, and the classical circuit designer.

The required brand attribution is `Powered by H2O`. H2O-3 data remains a backend/data annex and should not become the student-facing product theme.

## Features

### Visual Algorithm Designer

* **Explore:** Search teen-readable algorithm blocks such as sorting, search, pathfinding, recommendation, classification, clustering, encryption, compression, scheduling, and neural networks.
* **Build:** Drag learning blocks or starter kits onto the React Flow canvas.
* **Connect:** Link node handles to show inputs, outputs, and flow between algorithm ideas.
* **Explain:** Select a node and use RaySight to explain purpose, example, history, inputs, outputs, and why it matters.
* **History:** Keep lightweight context for algorithm stories, including Turing, Lovelace, Shannon, Dijkstra, and PageRank.

### Algorithm Builder

* **Description:** A linear step builder for creating and simulating ordered algorithms. Users can add steps, reorder them with drag-and-drop, and watch step-by-step execution.
* **User Guide:** See [Algorithm Builder User Guide](./docs/AlgorithmBuilderGuide.md).

### Classical Circuit Designer

* **Description:** A drag-and-drop interface for building and simulating digital logic circuits with input sources, output sinks, and AND/OR/NOT gates.
* **User Guide:** See [Classical Circuit Designer User Guide](./docs/CircuitDesignerGuide.md).

## Getting Started

### Prerequisites

* Node.js 20 or higher.
* npm 10 or higher.

### Installation

```bash
cd RaySight-frontend
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### Backend

The frontend is normally served with the `RaySight-backend` directory in this branch. That backend provides `/api/ai/*`, `/api/memory/*`, `/api/ml/*`, and `/api/health` routes. The public product name remains Visual Algorithm Designer.

## Testing

```bash
npm test
npm run build
```

End-to-end coverage guidance is in [E2E Test Scenarios](./docs/E2E_Test_Scenarios.md).

## Project Structure

* `src/components/AlgorithmDesigner/`: VAD canvas, palette, nodes, inspector, guide panel, and starter kits.
* `src/components/Brand/`: optimized VAD/RaySight brand assets derived from the final user-provided assets.
* `src/components/CircuitDesigner/`: circuit canvas and custom logic-gate nodes.
* `src/services/`: API client, learning algorithm catalog, starter-kit catalog, review reports, and validation catalogs.
* `src/styles/`: VAD palette, canvas, edge, and inspector styling.
* `docs/`: user guides and E2E scenario notes.
