import { render, screen } from '@testing-library/react';
import App from './App'; 
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles'; // Import ThemeProvider
import theme from './theme'; // Import your theme

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => undefined)));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('redirects the root route to the designer foundation', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /Algorithm Designer/i })).toBeInTheDocument();
  });

  it('keeps the legacy builder available on /builder', () => {
    render(
      <MemoryRouter initialEntries={['/builder']}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /Algorithm Builder/i })).toBeInTheDocument();
  });
});
