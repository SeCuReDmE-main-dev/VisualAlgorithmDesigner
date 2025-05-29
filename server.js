const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001; // Backend port

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// --- Serve Static React App ---
// Define the path to the React app's build directory
const frontendBuildPath = path.join(__dirname, '..', 'ReaAaS-N-frontend', 'dist'); 
// For Vite, the build output is 'dist'.

// Serve static files from the React app build directory
app.use(express.static(frontendBuildPath));

// --- API Endpoints ---
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// --- Catch-all for Frontend Routing ---
// For any other GET request, serve the React app's index.html
app.get('*', (req, res) => {
  const indexPath = path.join(frontendBuildPath, 'index.html');
  // Check if index.html exists. If not, it might mean the frontend hasn't been built.
  // This is a basic check; more robust error handling could be added.
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(
      'Frontend not found. Please build the ReaAaS-N-frontend app by running: ' +
      '<code>cd ../ReaAaS-N-frontend && npm run build</code>'
    );
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
