# Visual Algorithm Designer 🎨🤖

Visual Algorithm Designer is a fun and easy-to-use app that lets you create, see, and run algorithms using a drag-and-drop interface. You can also use AI to help you make algorithms and fix visual problems. 😃✨

## Cool Features 🎉

- Make and manage algorithm steps
- Drag and drop steps to put them in order
- Run algorithms step-by-step and watch them in action
- Use AI to create algorithms
- Use AI to fix visual problems

## How to Start 🚀

Follow these steps to set up the project and run the development server.

### What You Need 🛠️

- Node.js (v14 or higher)
- npm (v6 or higher) or yarn (v1.22 or higher)
- Python 3.10.11

### Installation 📥

1. Clone the repository:

   ```bash
   git clone https://github.com/Celebrum/VisualAlgorithmDesigner.git
   cd VisualAlgorithmDesigner
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

### Running the Development Server 🖥️

1. Start the development server:

   ```bash
   npm start
   # or
   yarn start
   ```

2. Open your browser and go to `http://localhost:3000` to see the app.

## How to Use 🕹️

### Making Algorithm Steps 🧩

1. Type a new step in the input box and click the "Add Step" button.
2. Drag and drop steps to put them in the right order.

### Running the Algorithm 🏃‍♂️

1. Click the "Run Algorithm" button to run the algorithm step-by-step.
2. The current step will be highlighted while running.

### Creating Algorithms with AI 🤖

1. Describe your algorithm in the input box under "Generate Algorithm with AI".
2. Click the "Generate Algorithm" button to let the AI create algorithm steps for you.

### Fixing Visual Problems with AI 🐞

1. Describe the visual problem you're having in the textarea under "Debug Visual Issues with AI".
2. Click the "Debug Issue" button to get suggestions from the AI to fix the problem.

## Integrating PandaAI for Data Analysis 🐼

To integrate PandaAI for data analysis and make it easy to use, follow these steps:

* **Set up PandaAI** 🐼
  * Install the `pandasai` package using `pip install pandasai`. 📦
  * Set your PandaAI API key using `pai.api_key.set("PAI-********************************")`. 🔑

* **Load and push data** 📊
  * Use `pai.load("your-data-path")` to load your data. 📂
  * Push the data to PandaAI using `df.push()`. 🚀

* **Auto-generated dashboards** 📈
  * PandaAI will automatically generate relevant questions, charts, and visualizations for your data. 🎨
  * Access the pre-built dashboard with key insights and a conversational agent for dynamic analysis. 🗣️

* **Conversational data analysis** 💬
  * Interact with your data using natural language through the chat interface. 🗨️
  * Ask questions and get instant answers with explanatory visualizations. 📊

* **Dynamic analysis** 🔄
  * Your dashboards and conversational agent stay synchronized with your data sources through code execution. 🧩
  * Ensure results are always current by running code on live data. 🕒

## Troubleshooting Common Installation Issues 🛠️

### Common issues and solutions 🛠️
* If you encounter an error during `npm install` or `yarn install`, make sure you have the correct versions of Node.js and npm/yarn installed. 📦
* If the Python virtual environment setup fails, ensure you have Python 3.10.11 installed and that the `python3.10` command is available in your terminal. 🐍
* If you see a "Module not found" error, double-check that all dependencies are listed in `requirements.txt` and installed correctly. 📜

### Environment setup 🌍
* Ensure that you have activated the virtual environment by running `source .venv/bin/activate` before installing Python dependencies. 🔄
* If you encounter issues with environment variables, make sure you have a `.env` file with the necessary configurations. 🔧

### Running the development server 🚀
* If the development server doesn't start, check for any error messages in the terminal and ensure all dependencies are installed. 🖥️
* Make sure you are in the correct directory (`VisualAlgorithmDesigner`) before running `npm start` or `yarn start`. 📂

### Browser issues 🌐
* If the app doesn't load in the browser, try clearing the browser cache or using a different browser. 🧹
* Ensure that you are accessing the correct URL: `http://localhost:3000`. 🔗

## Fun Challenges and Projects 🏆

Here are some fun challenges and projects you can try with the Visual Algorithm Designer:

1. **Create a Sorting Algorithm**: Design and visualize a sorting algorithm like Bubble Sort or Quick Sort. 🧩
2. **Build a Calculator**: Create a simple calculator that can perform basic arithmetic operations. ➕➖
3. **Maze Solver**: Design an algorithm to solve a maze. 🧩
4. **Tic-Tac-Toe Game**: Create a Tic-Tac-Toe game and visualize the game logic. ❌⭕
5. **Weather App**: Build a weather app that fetches and displays weather data. 🌦️

## Additional Resources 📚

Here are some additional resources to help you learn more and explore further:

* [Video Tutorials](https://www.example.com/video-tutorials) 🎥
* [Interactive Demos](https://www.example.com/interactive-demos) 🖥️
* [Live Version of the App](https://www.example.com/live-version) 🌐

## Contributing ❤️

We love contributions to the Visual Algorithm Designer project! To contribute, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with clear and concise commit messages.
4. Push your changes to your forked repository.
5. Create a pull request to the main repository.

Please make sure your code follows the project's coding standards and includes appropriate tests.

Thank you for contributing!
