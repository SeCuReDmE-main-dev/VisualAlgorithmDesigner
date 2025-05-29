# ReaAaS-N Frontend

## Overview

This project contains the frontend user interfaces for the ReaAaS-N (Reactive Algorithm and Automata Simulation - Next-gen) platform. It includes tools for visual algorithm building and classical digital circuit design and simulation. The frontend is built using React, TypeScript, Vite, and Material-UI.

## Features

### Algorithm Builder

*   **Description:** A tool for visually creating, managing, and simulating linear algorithms. Users can define steps, reorder them via drag-and-drop, and observe a step-by-step visualization of the algorithm's execution. It also supports generating algorithm steps from natural language input by parsing multiline text.
*   **User Guide:** For detailed usage instructions, see the [Algorithm Builder User Guide](./docs/AlgorithmBuilderGuide.md).

### Classical Circuit Designer

*   **Description:** A drag-and-drop interface for designing and simulating classical digital logic circuits. It supports basic logic gates (AND, OR, NOT), input sources (toggleable boolean values), and output sinks to observe results. The circuit state is simulated in real-time. Users can save their circuit designs to and load them from the browser's local storage.
*   **User Guide:** For detailed usage instructions, see the [Classical Circuit Designer User Guide](./docs/CircuitDesignerGuide.md).

## Getting Started

### Prerequisites

*   Node.js (version 18.x or higher recommended, as per project dependencies like Vite and React Router DOM v7)
*   npm (version 9.x or higher, typically comes with Node.js) or Yarn.

### Installation

1.  Clone the repository (if you haven't already).
2.  Navigate to the `ReaAaS-N-frontend` directory:
    ```bash
    cd ReaAaS-N-frontend
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```
    (or `yarn install` if you prefer Yarn)

### Running the Development Server

1.  Ensure you are in the `ReaAaS-N-frontend` directory.
2.  Start the Vite development server:
    ```bash
    npm run dev
    ```
    (or `yarn dev`)
3.  Open your browser and navigate to the local URL provided (usually `http://localhost:5173` or a similar port).

### Note on Backend

This frontend is designed to be served by the `ReaAaS-N-backend` server, which also provides API functionalities (though current features are client-side focused). For full application behavior as intended in a complete deployment, ensure the `ReaAaS-N-backend` server is also set up and running. The backend typically serves the built frontend application from its `dist` folder and can be started on a different port (e.g., 3001).

## Testing

Unit and component tests are implemented using [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

*   **Running Tests:**
    To run all tests in watch mode:
    ```bash
    npm test
    ```
    or
    ```bash
    npx vitest
    ```
    To run tests with a UI:
    ```bash
    npm run test:ui
    ```
    To generate a coverage report:
    ```bash
    npm run coverage
    ```

*   **End-to-End (E2E) Testing:**
    For guidelines on E2E testing scenarios and features to cover, please refer to the [E2E Test Scenarios document](./docs/E2E_Test_Scenarios.md).

## Project Structure

A brief overview of key directories within `ReaAaS-N-frontend`:

*   **`public/`**: Contains static assets that are directly copied to the build output (e.g., `index.html` template, favicons).
*   **`src/`**: Contains all the source code for the React application.
    *   **`components/`**: Reusable UI components.
        *   `CircuitDesigner/nodes/`: Custom node components for the Circuit Designer.
        *   `CircuitDesigner/PropertiesPanel.tsx`: The properties panel for the Circuit Designer.
    *   **`docs/`**: Contains user guides and design documents in Markdown format. (This is a project-specific documentation folder within `src` if it contains docs directly related to source, or at the root if more general. As created, it's in `ReaAaS-N-frontend/docs/` relative to the project root).
    *   **`pages/`**: Components representing full pages/views of the application (e.g., `AlgorithmBuilderPage.tsx`, `CircuitDesignerPage.tsx`).
    *   **`test/`**: Test setup files (e.g., `setup.ts` for Vitest).
    *   **`App.tsx`**: Main application component, handles routing and global layout.
    *   **`main.tsx`**: Entry point of the React application.
    *   **`theme.ts`**: MUI theme configuration.
*   **`vite.config.ts`**: Vite configuration file, including Vitest setup.
*   **`package.json`**: Project dependencies and scripts.
*   **`README.md`**: This file.

(Note: The actual `docs` folder was created at `ReaAaS-N-frontend/docs/`, so links like `./docs/AlgorithmBuilderGuide.md` are correct relative to this README in the same directory.)
```
