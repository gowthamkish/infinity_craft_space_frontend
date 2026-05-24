import { createTheme, alpha } from "@mui/material/styles";

// ── Brand design tokens ────────────────────────────────────────────────────
export const BRAND = {
  // Primary: Deep Rose / Maroon
  rose: {
    50:  "#fdf2f6",
    100: "#fce7ef",
    200: "#fad0e1",
    300: "#f5a8c6",
    400: "#ee77a3",
    500: "#de4a7e",
    600: "#c42b61",
    700: "#a51e50",
    800: "#8B1A4A",  // ← main brand primary
    900: "#6b1238",
  },
  // Secondary: Gold
  gold: {
    50:  "#fdfaed",
    100: "#faf2cc",
    200: "#f4e28b",
    300: "#edcc59",
    400: "#e2b535",
    500: "#C9A84C",  // ← main brand secondary
    600: "#b08930",
    700: "#8e6a24",
    800: "#745422",
    900: "#624620",
  },
  // Accent: Blush Pink
  blush: {
    50:  "#fff5f8",
    100: "#ffe4ed",
    200: "#fec9db",
    300: "#FDA4BE",
    400: "#F4A7B9",  // ← main accent
    500: "#e87898",
    600: "#d4567a",
    700: "#b13d60",
    800: "#93334f",
    900: "#7c2e45",
  },
  // Neutral: Warm charcoal
  charcoal: {
    50:  "#FDF6EC",  // ← main background (soft cream)
    100: "#F5EDE0",
    200: "#EAD9C5",
    300: "#D9C4A8",
    400: "#C0A882",
    500: "#A08060",
    600: "#7A5E42",
    700: "#5C4330",
    800: "#3D2C20",
    900: "#2C2C2C",  // ← main text
  },
};

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main:         BRAND.rose[800],
      dark:         BRAND.rose[900],
      light:        BRAND.rose[600],
      contrastText: "#ffffff",
    },
    secondary: {
      main:         BRAND.gold[500],
      dark:         BRAND.gold[600],
      light:        BRAND.gold[300],
      contrastText: "#ffffff",
    },
    error:   { main: "#c62828", dark: "#8e0000", light: "#ff5f52" },
    warning: { main: "#e65100", dark: "#ac1900", light: "#ff833a" },
    info:    { main: "#0277bd", dark: "#004c8c", light: "#58a5f0" },
    success: { main: "#2e7d32", dark: "#005005", light: "#60ad5e" },

    text: {
      primary:   BRAND.charcoal[900],
      secondary: BRAND.charcoal[600],
      disabled:  BRAND.charcoal[300],
    },
    background: {
      default: BRAND.charcoal[50],  // soft cream #FDF6EC
      paper:   "#FFFDF9",            // warm white
    },
    divider: BRAND.charcoal[200],

    // Custom tokens accessible via theme.palette.brand
    brand: {
      roseLight:    BRAND.rose[100],
      roseMid:      BRAND.rose[400],
      goldLight:    BRAND.gold[100],
      goldMid:      BRAND.gold[300],
      blush:        BRAND.blush[400],
      blushLight:   BRAND.blush[100],
      cream:        BRAND.charcoal[50],
      warmBorder:   BRAND.charcoal[200],
    },
  },

  typography: {
    fontFamily: "'Inter', 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.75rem)", letterSpacing: "-0.02em", lineHeight: 1.15 },
    h2: { fontWeight: 700, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", letterSpacing: "-0.015em", lineHeight: 1.2  },
    h3: { fontWeight: 700, fontSize: "clamp(1.25rem, 2.5vw, 1.875rem)", letterSpacing: "-0.01em", lineHeight: 1.25 },
    h4: { fontWeight: 700, fontSize: "clamp(1.1rem, 2vw, 1.5rem)", letterSpacing: "-0.008em", lineHeight: 1.3 },
    h5: { fontWeight: 600, fontSize: "clamp(1rem, 1.5vw, 1.25rem)", lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: "1rem", lineHeight: 1.4 },
    subtitle1: { fontWeight: 500, lineHeight: 1.6, letterSpacing: "0.005em" },
    subtitle2: { fontWeight: 600, fontSize: "0.875rem", lineHeight: 1.5, letterSpacing: "0.01em" },
    body1: { fontSize: "1rem", lineHeight: 1.7 },
    body2: { fontSize: "0.875rem", lineHeight: 1.65 },
    caption: { fontSize: "0.75rem", lineHeight: 1.5, color: BRAND.charcoal[600] },
    overline: { fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.01em" },
  },

  shape: { borderRadius: 12 },

  shadows: [
    "none",
    "0 1px 2px 0 rgba(139,26,74,0.04)",
    "0 1px 4px 0 rgba(139,26,74,0.06), 0 1px 2px -1px rgba(0,0,0,0.05)",
    "0 2px 8px -1px rgba(139,26,74,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)",
    "0 4px 12px -2px rgba(139,26,74,0.10), 0 2px 6px -2px rgba(0,0,0,0.07)",
    "0 8px 20px -4px rgba(139,26,74,0.12), 0 4px 8px -4px rgba(0,0,0,0.07)",
    "0 12px 28px -6px rgba(139,26,74,0.14), 0 6px 12px -4px rgba(0,0,0,0.08)",
    "0 16px 36px -8px rgba(139,26,74,0.15), 0 8px 16px -6px rgba(0,0,0,0.09)",
    "0 20px 48px -10px rgba(139,26,74,0.16)",
    "0 24px 60px -12px rgba(139,26,74,0.18)",
    "0 32px 72px -12px rgba(139,26,74,0.20)",
    "0 40px 80px -16px rgba(139,26,74,0.22)",
    ...Array(13).fill("none"),
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*, *::before, *::after": { boxSizing: "border-box" },
        html: {
          scrollBehavior: "smooth",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        body: {
          backgroundColor: BRAND.charcoal[50],
          color: BRAND.charcoal[900],
          fontFamily: "'Inter', 'Noto Sans', sans-serif",
        },
        a: { textDecoration: "none", color: "inherit" },
        ":focus-visible": {
          outline: "none",
        },
        "input:focus, textarea:focus, select:focus": {
          outline: "none",
        },
        "::selection": { background: alpha(BRAND.rose[800], 0.18) },
        "input[type=number]": { MozAppearance: "textfield" },
        "input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button": {
          WebkitAppearance: "none",
          margin: 0,
        },
        // Scrollbar
        "::-webkit-scrollbar": { width: "6px", height: "6px" },
        "::-webkit-scrollbar-track": { background: BRAND.charcoal[100] },
        "::-webkit-scrollbar-thumb": {
          background: BRAND.rose[300],
          borderRadius: "9999px",
          "&:hover": { background: BRAND.rose[600] },
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
          textTransform: "none",
          padding: "0.5rem 1.25rem",
          fontSize: "0.9rem",
          transition: "all 180ms cubic-bezier(0.4,0,0.2,1)",
        },
        sizeSmall: { padding: "0.3rem 0.875rem", fontSize: "0.8125rem" },
        sizeLarge: { padding: "0.7rem 1.75rem", fontSize: "1rem" },

        // Primary contained: Rose gradient
        containedPrimary: {
          background: `linear-gradient(135deg, ${BRAND.rose[700]} 0%, ${BRAND.rose[900]} 100%)`,
          boxShadow: `0 4px 14px ${alpha(BRAND.rose[800], 0.35)}`,
          "&:hover": {
            background: `linear-gradient(135deg, ${BRAND.rose[800]} 0%, ${BRAND.rose[900]} 100%)`,
            boxShadow: `0 6px 20px ${alpha(BRAND.rose[800], 0.45)}`,
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0)" },
        },

        // Secondary contained: Gold gradient
        containedSecondary: {
          background: `linear-gradient(135deg, ${BRAND.gold[400]} 0%, ${BRAND.gold[600]} 100%)`,
          boxShadow: `0 4px 14px ${alpha(BRAND.gold[500], 0.35)}`,
          color: "#fff",
          "&:hover": {
            background: `linear-gradient(135deg, ${BRAND.gold[500]} 0%, ${BRAND.gold[700]} 100%)`,
            boxShadow: `0 6px 20px ${alpha(BRAND.gold[500], 0.45)}`,
            transform: "translateY(-1px)",
          },
        },

        outlinedPrimary: {
          borderColor: alpha(BRAND.rose[800], 0.5),
          color: BRAND.rose[800],
          "&:hover": {
            borderColor: BRAND.rose[800],
            background: alpha(BRAND.rose[800], 0.05),
          },
        },

        outlinedSecondary: {
          borderColor: alpha(BRAND.gold[500], 0.6),
          color: BRAND.gold[600],
          "&:hover": {
            borderColor: BRAND.gold[500],
            background: alpha(BRAND.gold[500], 0.06),
          },
        },

        textPrimary: {
          color: BRAND.rose[800],
          "&:hover": { background: alpha(BRAND.rose[800], 0.06) },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: "all 180ms ease",
          "&:hover": { transform: "translateY(-1px)" },
        },
        colorPrimary: {
          color: BRAND.rose[800],
          "&:hover": { background: alpha(BRAND.rose[800], 0.08) },
        },
      },
    },

    MuiTextField: {
      defaultProps: { variant: "outlined", size: "small" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: "#FFFDF9",
            transition: "box-shadow 180ms ease",
            "& fieldset": {
              borderColor: BRAND.charcoal[200],
              transition: "border-color 180ms ease",
            },
            "&:hover fieldset": { borderColor: BRAND.charcoal[400] },
            "&.Mui-focused fieldset": {
              borderColor: BRAND.rose[800],
              borderWidth: "1.5px",
            },
          },
          "& .MuiInputLabel-root.Mui-focused": { color: BRAND.rose[800] },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "& fieldset": { borderColor: BRAND.charcoal[200] },
          "&:hover fieldset": { borderColor: BRAND.charcoal[400] },
          "&.Mui-focused fieldset": {
            borderColor: BRAND.rose[800],
            borderWidth: "1.5px",
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          "&.Mui-focused": { color: BRAND.rose[800] },
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: { fontSize: "0.75rem", marginLeft: 4 },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: `0 1px 4px 0 ${alpha(BRAND.rose[800], 0.06)}, 0 1px 2px -1px rgba(0,0,0,0.05)`,
          border: `1px solid ${BRAND.charcoal[200]}`,
          backgroundColor: "#FFFDF9",
          transition: "box-shadow 200ms ease, transform 200ms ease",
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "20px",
          "&:last-child": { paddingBottom: "20px" },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 14, backgroundColor: "#FFFDF9" },
        elevation1: {
          boxShadow: `0 1px 4px 0 ${alpha(BRAND.rose[800], 0.06)}`,
          border: `1px solid ${BRAND.charcoal[200]}`,
        },
        elevation2: {
          boxShadow: `0 4px 12px -2px ${alpha(BRAND.rose[800], 0.10)}`,
          border: `1px solid ${BRAND.charcoal[200]}`,
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: `0 24px 60px ${alpha(BRAND.rose[800], 0.22)}`,
          border: `1px solid ${BRAND.charcoal[200]}`,
          backgroundColor: "#FFFDF9",
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: "1.125rem",
          padding: "20px 24px 12px",
          color: BRAND.rose[900],
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: { padding: "8px 24px 16px" },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: { padding: "12px 24px 20px", gap: 8 },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, fontSize: "0.75rem" },
        colorPrimary: {
          backgroundColor: alpha(BRAND.rose[800], 0.10),
          color: BRAND.rose[800],
          "&:hover": { backgroundColor: alpha(BRAND.rose[800], 0.18) },
        },
        colorSecondary: {
          backgroundColor: alpha(BRAND.gold[500], 0.12),
          color: BRAND.gold[700],
          "&:hover": { backgroundColor: alpha(BRAND.gold[500], 0.22) },
        },
        colorSuccess: {
          backgroundColor: alpha("#2e7d32", 0.1),
          color: "#1b5e20",
        },
        colorError: {
          backgroundColor: alpha("#c62828", 0.1),
          color: "#8e0000",
        },
        colorWarning: {
          backgroundColor: alpha("#e65100", 0.1),
          color: "#ac1900",
        },
        colorInfo: {
          backgroundColor: alpha(BRAND.blush[400], 0.15),
          color: BRAND.blush[700],
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            fontWeight: 700,
            fontSize: "0.72rem",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: BRAND.charcoal[600],
            backgroundColor: BRAND.charcoal[100],
            borderBottom: `2px solid ${BRAND.charcoal[200]}`,
            whiteSpace: "nowrap",
          },
        },
      },
    },

    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root": {
            transition: "background-color 150ms ease",
            "&:hover": { backgroundColor: alpha(BRAND.rose[800], 0.03) },
            "&:last-child td": { borderBottom: 0 },
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${BRAND.charcoal[100]}`,
          padding: "12px 16px",
          fontSize: "0.875rem",
        },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${BRAND.charcoal[200]}`,
          overflow: "hidden",
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10, fontSize: "0.875rem" },
        standardInfo:    { backgroundColor: alpha(BRAND.blush[400], 0.12), "& .MuiAlert-icon": { color: BRAND.blush[600] } },
        standardSuccess: { backgroundColor: alpha("#2e7d32", 0.08), "& .MuiAlert-icon": { color: "#2e7d32" } },
        standardWarning: { backgroundColor: alpha(BRAND.gold[500], 0.12), "& .MuiAlert-icon": { color: BRAND.gold[700] } },
        standardError:   { backgroundColor: alpha("#c62828", 0.08), "& .MuiAlert-icon": { color: "#c62828" } },
      },
    },

    MuiPagination: {
      styleOverrides: {
        root: {
          "& .MuiPaginationItem-root": {
            borderRadius: 8,
            fontWeight: 600,
            border: `1px solid ${BRAND.charcoal[200]}`,
            "&.Mui-selected": {
              backgroundColor: BRAND.rose[800],
              color: "#fff",
              border: "none",
              "&:hover": { backgroundColor: BRAND.rose[900] },
            },
          },
        },
      },
    },

    MuiBreadcrumbs: {
      styleOverrides: {
        root: { fontSize: "0.875rem" },
        separator: { color: BRAND.charcoal[400] },
        li: {
          "& a, & .MuiBreadcrumbs-link": {
            color: BRAND.rose[700],
            "&:hover": { color: BRAND.rose[900] },
          },
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 9999, height: 6, backgroundColor: BRAND.charcoal[100] },
        barColorPrimary: { backgroundColor: BRAND.rose[600] },
        bar: { borderRadius: 9999 },
      },
    },

    MuiCircularProgress: {
      defaultProps: { size: 24 },
      styleOverrides: {
        colorPrimary: { color: BRAND.rose[800] },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: "0.78rem",
          fontWeight: 500,
          backgroundColor: BRAND.charcoal[900],
          padding: "6px 10px",
        },
        arrow: { color: BRAND.charcoal[900] },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${BRAND.charcoal[200]}` },
        indicator: {
          backgroundColor: BRAND.rose[800],
          height: 3,
          borderRadius: "3px 3px 0 0",
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          color: BRAND.charcoal[600],
          minWidth: 0,
          padding: "10px 16px",
          transition: "color 150ms ease",
          "&.Mui-selected": { color: BRAND.rose[800] },
          "&:hover": { color: BRAND.charcoal[900] },
        },
      },
    },

    MuiStepper: {
      styleOverrides: { root: { padding: 0 } },
    },

    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontSize: "0.875rem",
          fontWeight: 500,
          "&.Mui-active": { fontWeight: 700, color: BRAND.rose[800] },
          "&.Mui-completed": { fontWeight: 600, color: "#2e7d32" },
        },
      },
    },

    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: BRAND.charcoal[300],
          "&.Mui-active": { color: BRAND.rose[800] },
          "&.Mui-completed": { color: "#2e7d32" },
        },
      },
    },

    MuiSkeleton: {
      defaultProps: { animation: "wave" },
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: BRAND.charcoal[100],
          "&::after": {
            background: `linear-gradient(90deg, transparent, ${alpha(BRAND.rose[800], 0.06)}, transparent)`,
          },
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: BRAND.charcoal[200] },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&.Mui-selected": {
            backgroundColor: alpha(BRAND.rose[800], 0.10),
            color: BRAND.rose[800],
            "&:hover": { backgroundColor: alpha(BRAND.rose[800], 0.15) },
          },
          "&:hover": { backgroundColor: alpha(BRAND.charcoal[900], 0.05) },
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: "2px 4px",
          fontSize: "0.875rem",
          "&.Mui-selected": {
            backgroundColor: alpha(BRAND.rose[800], 0.10),
            color: BRAND.rose[800],
            "&:hover": { backgroundColor: alpha(BRAND.rose[800], 0.15) },
          },
        },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        root: { padding: 8 },
        switchBase: {
          "&.Mui-checked": {
            color: BRAND.rose[800],
            "& + .MuiSwitch-track": {
              backgroundColor: BRAND.rose[800],
              opacity: 1,
            },
          },
        },
        track: {
          borderRadius: 11,
          backgroundColor: BRAND.charcoal[300],
          opacity: 1,
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          "&.Mui-checked": { color: BRAND.rose[800] },
          "&:hover": { backgroundColor: alpha(BRAND.rose[800], 0.06) },
        },
      },
    },

    MuiRadio: {
      styleOverrides: {
        root: {
          "&.Mui-checked": { color: BRAND.rose[800] },
          "&:hover": { backgroundColor: alpha(BRAND.rose[800], 0.06) },
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 700, fontSize: "0.9rem" },
        colorDefault: {
          backgroundColor: alpha(BRAND.rose[800], 0.12),
          color: BRAND.rose[800],
        },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: {
          fontSize: "0.65rem",
          minWidth: 18,
          height: 18,
          padding: "0 4px",
          fontWeight: 700,
        },
        colorPrimary: { backgroundColor: BRAND.rose[800] },
        colorError:   { backgroundColor: "#c62828" },
      },
    },

    MuiSnackbar: {
      defaultProps: { anchorOrigin: { vertical: "bottom", horizontal: "center" } },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: "12px !important",
          border: `1px solid ${BRAND.charcoal[200]}`,
          backgroundColor: "#FFFDF9",
          boxShadow: "none",
          "&:before": { display: "none" },
          "&.Mui-expanded": { margin: "8px 0" },
        },
      },
    },

    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          "&.Mui-expanded": { minHeight: 48 },
          "& .MuiAccordionSummary-expandIconWrapper": {
            color: BRAND.rose[700],
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: `0 1px 0 ${BRAND.charcoal[200]}, 0 4px 16px ${alpha(BRAND.rose[800], 0.08)}`,
        },
      },
    },
  },
});

export default muiTheme;
