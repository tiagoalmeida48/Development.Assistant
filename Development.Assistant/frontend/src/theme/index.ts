import { alpha, createTheme, ThemeOptions } from "@mui/material/styles";

const radius = 8;

const baseThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: [
      "Inter",
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
      fontWeight: 800,
      lineHeight: 1.12,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 800,
      lineHeight: 1.16,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 760,
      lineHeight: 1.22,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 760,
      lineHeight: 1.28,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 720,
      lineHeight: 1.36,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 700,
      lineHeight: 1.5,
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: radius,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          minHeight: "100vh",
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(180deg, #f7f9fb 0%, #eef4f1 48%, #f8faf9 100%)"
              : "linear-gradient(180deg, #101010 0%, #171717 52%, #111111 100%)",
        },
        "*": {
          scrollbarWidth: "thin",
          scrollbarColor:
            theme.palette.mode === "light" ? "#a7b2ad transparent" : "#555 transparent",
        },
        "*::-webkit-scrollbar": {
          width: 8,
          height: 8,
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.mode === "light" ? "#a7b2ad" : "#555",
          borderRadius: 8,
        },
      }),
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          width: "100%",
        },
        maxWidthXs: {
          maxWidth: "100%",
        },
        maxWidthSm: {
          maxWidth: "100%",
        },
        maxWidthMd: {
          "@media (min-width: 900px)": {
            maxWidth: "95%",
          },
        },
        maxWidthLg: {
          "@media (min-width: 1200px)": {
            maxWidth: "90%",
          },
        },
        maxWidthXl: {
          "@media (min-width: 1536px)": {
            maxWidth: "86%",
          },
          "@media (min-width: 2000px)": {
            maxWidth: "80%",
          },
          "@media (min-width: 2560px)": {
            maxWidth: "74%",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radius,
          padding: "9px 18px",
          fontWeight: 700,
          letterSpacing: 0,
          boxShadow: "none",
        },
        contained: ({ theme }) => ({
          boxShadow: `0 12px 26px ${alpha(theme.palette.primary.main, 0.22)}`,
          "&:hover": {
            boxShadow: `0 16px 34px ${alpha(theme.palette.primary.main, 0.3)}`,
            transform: "translateY(-1px)",
          },
        }),
        outlined: ({ theme }) => ({
          borderColor: alpha(theme.palette.text.primary, 0.14),
          backgroundColor: alpha(theme.palette.background.paper, 0.38),
          "&:hover": {
            borderColor: alpha(theme.palette.primary.main, 0.45),
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: radius,
          border: `1px solid ${alpha(theme.palette.text.primary, theme.palette.mode === "light" ? 0.08 : 0.12)}`,
          backgroundColor: theme.palette.mode === "light" ? "#ffffff" : "#1f1f1f",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 18px 55px rgba(32, 42, 38, 0.1)"
              : "0 18px 55px rgba(0, 0, 0, 0.28)",
          backgroundImage: "none",
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: radius,
          backgroundImage: "none",
          backgroundColor: theme.palette.mode === "light" ? "#ffffff" : "#1f1f1f",
        }),
        elevation1: ({ theme }) => ({
          boxShadow:
            theme.palette.mode === "light"
              ? "0 14px 38px rgba(32, 42, 38, 0.08)"
              : "0 14px 38px rgba(0, 0, 0, 0.26)",
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiOutlinedInput-root": {
            borderRadius: radius,
            backgroundColor:
              theme.palette.mode === "light"
                ? alpha(theme.palette.common.white, 0.78)
                : alpha(theme.palette.common.black, 0.16),
            transition: "box-shadow 160ms ease, background-color 160ms ease",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha(theme.palette.common.white, 0.94)
                  : alpha(theme.palette.common.black, 0.22),
            },
            "&.Mui-focused": {
              boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.14)}`,
            },
          },
        }),
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor:
            theme.palette.mode === "light"
              ? alpha(theme.palette.common.white, 0.94)
              : alpha(theme.palette.common.black, 0.24),
        }),
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          color: theme.palette.text.secondary,
          fontWeight: 800,
          backgroundColor:
            theme.palette.mode === "light"
              ? alpha(theme.palette.primary.main, 0.06)
              : alpha(theme.palette.primary.main, 0.12),
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
          boxShadow:
            theme.palette.mode === "light"
              ? "0 26px 70px rgba(32, 42, 38, 0.18)"
              : "0 26px 70px rgba(0, 0, 0, 0.52)",
        }),
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: "light",
    primary: {
      main: "#147d6f",
      light: "#39a892",
      dark: "#0b594f",
      lighter: "#dff6ef",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#b23a48",
      light: "#d95c6a",
      dark: "#7f2530",
      lighter: "#fde8ea",
      contrastText: "#ffffff",
    },
    error: {
      main: "#d92d20",
      light: "#f97066",
      dark: "#b42318",
      lighter: "#fee4e2",
    },
    warning: {
      main: "#b7791f",
      light: "#d69e2e",
      dark: "#80510f",
      lighter: "#fff4d6",
    },
    info: {
      main: "#2f80a7",
      light: "#56a7ca",
      dark: "#1e5e7d",
      lighter: "#e3f4fa",
    },
    success: {
      main: "#17855f",
      light: "#2fb37f",
      dark: "#0e5f43",
      lighter: "#dcf8ec",
    },
    background: {
      default: "#f7f9fb",
      paper: "#ffffff",
    },
    text: {
      primary: "#202a26",
      secondary: "#64706b",
    },
  },
});

export const darkTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: "dark",
    primary: {
      main: "#55c7ad",
      light: "#87dccb",
      dark: "#25977f",
      lighter: "#123f37",
      contrastText: "#08110f",
    },
    secondary: {
      main: "#f07883",
      light: "#ffa0a8",
      dark: "#c74f5c",
      lighter: "#4a1d22",
      contrastText: "#160608",
    },
    error: {
      main: "#f97066",
      light: "#fda29b",
      dark: "#d92d20",
      lighter: "#55160f",
    },
    warning: {
      main: "#f4c76b",
      light: "#ffe09b",
      dark: "#c9942b",
      lighter: "#453214",
    },
    info: {
      main: "#72c4df",
      light: "#a6dfef",
      dark: "#439ab9",
      lighter: "#183d48",
    },
    success: {
      main: "#5dd6a0",
      light: "#91e8c0",
      dark: "#28a973",
      lighter: "#123e2e",
    },
    background: {
      default: "#101010",
      paper: "#1f1f1f",
    },
    text: {
      primary: "#f4f2ee",
      secondary: "#b9b6ae",
    },
  },
});

export const theme = lightTheme;
