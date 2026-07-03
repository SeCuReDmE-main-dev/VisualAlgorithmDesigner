// src/theme.ts
import { createTheme } from '@mui/material/styles';

const paletteToken = {
  primary: '#1769E8',
  secondary: '#7C3AED',
  background: '#FFFFFF',
  paper: '#F5F8FF',
  text: '#14213D',
  textMuted: '#5B6B86',
  warning: '#B26A00',
  error: '#C62828',
  success: '#168A4A',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: paletteToken.primary,
    },
    secondary: {
      main: paletteToken.secondary,
    },
    background: {
      default: paletteToken.background,
      paper: paletteToken.paper,
    },
    text: {
      primary: paletteToken.text,
      secondary: paletteToken.textMuted,
    },
    warning: {
      main: paletteToken.warning,
    },
    error: {
      main: paletteToken.error,
    },
    success: {
      main: paletteToken.success,
    },
  },
  typography: {
    fontFamily: 'Inter, Source Sans Pro, Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
