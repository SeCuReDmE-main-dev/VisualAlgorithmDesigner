import { render, screen } from '@testing-library/react';
import App from './App'; 
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles'; // Import ThemeProvider
import theme from './theme'; // Import your theme

describe('App', () => {
  it('renders the AppBar with the application title "ReaAaS-N"', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}> {/* Wrap with ThemeProvider */}
          <App />
        </ThemeProvider>
      </BrowserRouter>
    );
    // Check for the AppBar title "ReaAaS-N"
    // This text is within a Typography component in the AppBar
    expect(screen.getByText(/ReaAaS-N/i)).toBeInTheDocument();
  });
});
