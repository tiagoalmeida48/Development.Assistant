import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Toaster } from 'sonner'
import HomePage from '@/pages/home'
import CompareDatabasePage from '@/pages/compare-database'
import CopyProjectPage from '@/pages/copy-project'
import GenerateClassPage from '@/pages/generate-class'
import { ThemeContext, useTheme, useThemeProvider } from '@/hooks/useTheme'
import { Button } from '@/components/ui'

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-background transition-colors">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-lg font-bold">
              Assistente de Desenvolvimento
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className={`text-sm ${isActive('/') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Home
              </Link>
              <Link
                to="/compare-database"
                className={`text-sm ${isActive('/compare-database') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Comparar Bancos
              </Link>
              <Link
                to="/copy-project"
                className={`text-sm ${isActive('/copy-project') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Copiar Projeto
              </Link>
              <Link
                to="/generate-class"
                className={`text-sm ${isActive('/generate-class') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Gerar Classes
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="h-9 w-9 p-0 relative overflow-hidden group border-2 hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20 dark:from-blue-400/20 dark:to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 relative z-10 text-slate-700 group-hover:text-blue-600 transition-colors" />
                ) : (
                  <Sun className="h-5 w-5 relative z-10 text-amber-400 group-hover:text-amber-300 transition-colors" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  const themeValue = useThemeProvider()

  return (
    <ThemeContext.Provider value={themeValue}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/compare-database" element={<CompareDatabasePage />} />
            <Route path="/copy-project" element={<CopyProjectPage />} />
            <Route path="/generate-class" element={<GenerateClassPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        duration={4000}
        visibleToasts={5}
        toastOptions={{
          style: {
            border: '1px solid var(--border)',
          },
          className: 'toast-with-progress',
        }}
      />
    </ThemeContext.Provider>
  )
}
