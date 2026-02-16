import { createTheme } from "@mui/material/styles";

// Create MUI theme matching existing design tokens from the app
// Colors derived from CSS variables and existing Bootstrap theme
const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#10b981", // --primary-color (emerald-500)
      light: "#34d399",
      dark: "#059669",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#10b981", // --secondary-color matches primary in current design
      light: "#34d399",
      dark: "#059669",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ef4444", // red-500
      light: "#f87171",
      dark: "#dc2626",
    },
    warning: {
      main: "#f59e0b", // amber-500
      light: "#fbbf24",
      dark: "#d97706",
    },
    info: {
      main: "#3b82f6", // blue-500
      light: "#60a5fa",
      dark: "#2563eb",
    },
    success: {
      main: "#10b981", // emerald-500
      light: "#34d399",
      dark: "#059669",
    },
    background: {
      default: "#f9fafb", // --bg-primary
      paper: "#ffffff", // --bg-secondary
    },
    text: {
      primary: "#1f2937", // --text-primary
      secondary: "#6b7280", // --text-secondary
    },
    divider: "#e5e7eb", // --border-color
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12, // --border-radius from the app
  },
  shadows: [
    "none",
    "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)", // --shadow-sm
    "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)", // --shadow-md
    "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)", // --shadow-lg
    "0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04)", // --shadow-xl
    "0 1px 3px rgba(0, 0, 0, 0.12)",
    "0 3px 6px rgba(0, 0, 0, 0.15)",
    "0 10px 20px rgba(0, 0, 0, 0.15)",
    "0 15px 25px rgba(0, 0, 0, 0.15)",
    "0 20px 40px rgba(0, 0, 0, 0.2)",
    ...Array(15).fill("0 20px 40px rgba(0, 0, 0, 0.2)"),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Disable uppercase transformation
          fontWeight: 600,
          borderRadius: 12,
          padding: "10px 20px",
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #10b981 0%, #34d399 100%)",
          "&:hover": {
            background: "linear-gradient(45deg, #059669 0%, #10b981 100%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow:
            "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default muiTheme;
