// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00A99D', // Teal
    },
    secondary: {
      main: '#F76C6C', // Orange - Alert / Emotional
    },
    background: {
      default: '#1B263B', // Deep Blue
      paper: '#000000',    // Pure Black
    },
    text: {
      primary: '#4F5D75',   // Metallic Silver
      secondary: '#9FFFFF', // Light Cyan - Light Glow Variant
    },
    warning: { // Using warning for the Electric Purple Glow as an example
      main: '#B45EFF', 
    },
    // You might want to add more specific color definitions here if needed
    // e.g., for code/brain inspired, or other specific UI elements
  },
  typography: {
    fontFamily: 'Source Sans Pro, sans-serif', // Ensure this font is available or add a fallback
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 600,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#00A99D', // Teal
            color: '#000000',          // Pure Black for text on hover
          },
        },
      },
    },
    // You can add more component overrides here
  },
});

export default theme;
