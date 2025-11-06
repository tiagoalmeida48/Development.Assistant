import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Moon, Sun, LogOut } from 'lucide-react'
import { Toaster } from 'sonner'
import HomePage from '@/pages/home'
import CompareDatabasePage from '@/pages/compare-database'
import CopyProjectPage from '@/pages/copy-project'
import GenerateClassPage from '@/pages/generate-class'
import LoginPage from '@/pages/login'
import UsersPage from '@/pages/users'
import { ThemeContext, useTheme, useThemeProvider } from '@/hooks/useTheme'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { PrivateRoute } from '@/components/PrivateRoute'
import { Button } from '@/components/ui'

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Não mostrar navbar na página de login
  if (location.pathname === '/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-lg text-secondary-foreground font-bold">
              Assistente de Desenvolvimento
            </Link>
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <>
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
                  <Link
                    to="/users"
                    className={`text-sm ${isActive('/users') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Usuários
                  </Link>

                  <div className="h-6 w-px bg-border" />

                  <span className="text-sm text-muted-foreground">
                    {user?.username}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="h-9 text-secondary-foreground"
                  >
                    <LogOut className="mr-2 h-4 text-secondary-foreground w-4" />
                    Sair
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="h-9 w-9 p-0 relative overflow-hidden group border-2 hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20 dark:from-blue-400/20 dark:to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 min-h-4 min-w-4 relative z-10 text-slate-700 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                ) : (
                  <Sun className="h-4 w-4 min-h-4 min-w-4 relative z-10 text-amber-400 group-hover:text-amber-300 transition-colors flex-shrink-0" />
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
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Rota pública */}
              <Route path="/login" element={<LoginPage />} />

              {/* Rotas protegidas */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <HomePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/compare-database"
                element={
                  <PrivateRoute>
                    <CompareDatabasePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/copy-project"
                element={
                  <PrivateRoute>
                    <CopyProjectPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/generate-class"
                element={
                  <PrivateRoute>
                    <GenerateClassPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <UsersPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Layout>
        </AuthProvider>
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
