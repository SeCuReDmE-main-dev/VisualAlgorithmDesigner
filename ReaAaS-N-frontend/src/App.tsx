import React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

// Import pages
import AlgorithmBuilderPage from './pages/AlgorithmBuilderPage';
import CircuitDesignerPage from './pages/CircuitDesignerPage';

const App: React.FC = () => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ReaAaS-N
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            Algorithm Builder
          </Button>
          <Button color="inherit" component={RouterLink} to="/circuit-designer">
            Circuit Designer
          </Button>
        </Toolbar>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1 /*, p: 3 // Optional padding */ }}>
        {/* Toolbar spacer if using fixed AppBar and content needs to be pushed down */}
        {/* <Toolbar />  */}
        <Routes>
          <Route path="/" element={<AlgorithmBuilderPage />} />
          <Route path="/circuit-designer" element={<CircuitDesignerPage />} />
          {/* Add other routes here */}
        </Routes>
      </Box>
    </>
  );
};

export default App;
