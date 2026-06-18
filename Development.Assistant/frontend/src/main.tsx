import React, { useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { SnackbarProvider } from 'notistack'
import App from './App'
import { AppProviders } from './providers/AppProviders'
import { ThemeContext, useThemeProvider } from '@/shared/hooks/use-theme'
import { lightTheme, darkTheme } from '@/shared/theme'

function Root() {
  const themeValue = useThemeProvider()
  const muiTheme = useMemo(
    () => (themeValue.theme === 'dark' ? darkTheme : lightTheme),
    [themeValue.theme]
  )

  return (
    <React.StrictMode>
      <ThemeContext.Provider value={themeValue}>
        <AppProviders>
          <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              autoHideDuration={5000}
            >
              <App />
            </SnackbarProvider>
          </ThemeProvider>
        </AppProviders>
      </ThemeContext.Provider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
