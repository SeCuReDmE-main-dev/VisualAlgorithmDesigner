// src/theme.ts
import { createTheme } from '@mui/material/styles';

const paletteToken = {
  primary: '#3D8A88',
  secondary: '#E8856A',
  background: '#1A1B2E',
  paper: '#242540',
  text: '#DDE8EC',
  textMuted: '#9FE8FF',
  warning: '#C07A20',
  error: '#C0392B',
  success: '#1A8A5A',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
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
