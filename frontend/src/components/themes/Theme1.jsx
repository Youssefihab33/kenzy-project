import { createTheme, Fade } from '@mui/material';

const Theme1 = createTheme({
  typography: {
    fontFamily: 'Outfit, Cairo, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#AF913B', // Elegant gold
      light: '#D4AF37', // Bright metallic gold
      dark: '#7A6424', // Deep bronze-gold
      contrastText: '#ffffff', // White text on gold buttons
    },
    secondary: {
      main: '#707A8A', // Modern slate silver
      light: '#A6AEBB', // Platinum silver
      dark: '#414954', // Dark charcoal silver
      contrastText: '#ffffff',
    },
    background: {
      default: '#0c0e12', // Deep slate black
      paper: '#151821',   // Sleek slate charcoal for cards
    },
    text: {
      primary: '#f3f4f6', // Crisp off-white text
      secondary: '#9ca3af', // Soft silver gray text
    },
  },
  shape: {
    borderRadius: 12, // Clean modern rounded corners
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'radial-gradient(ellipse at top, #1e2235 0%, #0c0e12 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          margin: 0,
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        TransitionComponent: Fade,
        TransitionProps: { timeout: 300 },
        enterTouchDelay: 0,
        arrow: true,
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
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 600,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.4)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
          },
        },
      },
    },
  },
});

export default Theme1;