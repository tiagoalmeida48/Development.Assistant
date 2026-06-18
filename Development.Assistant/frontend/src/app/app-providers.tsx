import { useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider } from "notistack";
import { ThemeContext, useThemeProvider } from "@/shared/hooks/use-theme";
import { lightTheme, darkTheme } from "@/shared/theme";
import { AuthProvider } from "@/features/auth";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const themeValue = useThemeProvider();
  const muiTheme = useMemo(
    () => (themeValue.theme === "dark" ? darkTheme : lightTheme),
    [themeValue.theme]
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          autoHideDuration={5000}
        >
          <AuthProvider>{children}</AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
