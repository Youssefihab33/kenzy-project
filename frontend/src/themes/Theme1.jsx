import { createTheme, Fade } from '@mui/material';

const Theme1 = createTheme({
  typography: {
    fontFamily: 'Cairo, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#AF913B', // Rich, elegant gold (toned for high accessibility and contrast)
      light: '#D4AF37', // Bright metallic gold
      dark: '#7A6424', // Deep, bronze-gold
      contrastText: '#ffffff', // Crisp white text on gold buttons
    },
    secondary: {
      main: '#707A8A', // Sleek, modern slate silver
      light: '#A6AEBB', // Light platinum silver
      dark: '#414954', // Dark charcoal silver
      contrastText: '#ffffff',
    },
    background: {
      default: '#F9FAFB', // Ultra-clean, cool off-white background
      paper: '#ffffff',
    },
    text: {
      primary: '#1C1F24', // Dark charcoal instead of pure black for a premium feel
      secondary: '#606977',
    },
  },
  shape: {
    borderRadius: 8, // Clean, modern rounded corners across components
  },
  components: {
    MuiTooltip: {
      defaultProps: {
        TransitionComponent: Fade,
        TransitionProps: { timeout: 300 },
        enterTouchDelay: 0,
        arrow: true, // Adds a sleek arrow indicator to tooltips
      },
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1a1a1a',
          fontSize: '0.85rem',
          padding: '8px 12px',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true, // Removes harsh shadows for a flat, clean look
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '6px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // Subtle, premium shadow
          borderRadius: 12,
        },
      },
    },
  },
});

export default Theme1;