# Visual Algorithm Designer

Visual Algorithm Designer is a React application that allows users to create, visualize, and execute algorithms using a drag-and-drop interface. The application also integrates with a language model (LLM) to generate algorithms and debug visual problems.

## Features

- Create and manage algorithm steps
- Drag-and-drop functionality to reorder steps
- Execute algorithms step-by-step with visualization
- Generate algorithms using a language model (LLM)
- Debug visual problems using a language model (LLM)

## Getting Started

Follow these instructions to set up the project and run the development server.

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher) or yarn (v1.22 or higher)
- Python 3.10.11

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/githubnext/workspace-blank.git
   cd workspace-blank
   ```

2. Install the dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up the Python virtual environment:

   ```bash
   python3.10 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

### Running the Development Server

1. Start the development server:

   ```bash
   npm start
   # or
   yarn start
   ```

2. Open your browser and navigate to `http://localhost:3000` to see the application.

## Usage

### Creating Algorithm Steps

1. Enter a new step in the input field and click the "Add Step" button.
2. Drag and drop steps to reorder them as needed.

### Executing the Algorithm

1. Click the "Run Algorithm" button to execute the algorithm step-by-step.
2. The current step will be highlighted during execution.

### Generating Algorithms with AI

1. Enter a description of the algorithm in the input field under "Generate Algorithm with AI".
2. Click the "Generate Algorithm" button to generate algorithm steps using the language model (LLM).

### Debugging Visual Issues with AI

1. Describe the visual problem you're experiencing in the textarea under "Debug Visual Issues with AI".
2. Click the "Debug Issue" button to receive suggestions for debugging the issue using the language model (LLM).

## Contributing

We welcome contributions to the Visual Algorithm Designer project! To contribute, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with clear and concise commit messages.
4. Push your changes to your forked repository.
5. Create a pull request to the main repository.

Please ensure that your code follows the project's coding standards and includes appropriate tests.

Thank you for contributing!
