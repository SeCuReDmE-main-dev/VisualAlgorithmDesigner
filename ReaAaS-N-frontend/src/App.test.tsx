import { render, screen } from '@testing-library/react';
import App from './App'; 
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles'; // Import ThemeProvider
import theme from './theme'; // Import your theme

describe('App', () => {
  it('renders the algorithm builder screen', () => {
    render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    );
    expect(screen.getByRole('heading', { name: /Algorithm Builder/i })).toBeInTheDocument();
  });
});
