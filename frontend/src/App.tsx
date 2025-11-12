import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Divider,
  Container,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";
import HomePage from "@/pages/home";
import CompareDatabasePage from "@/pages/compare-database";
import CopyProjectPage from "@/pages/copy-project";
import GenerateClassPage from "@/pages/generate-class";
import LoginPage from "@/pages/login";
import UsersPage from "@/pages/users";
import { useTheme } from "@/hooks/useTheme";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import React from "react";

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (location.pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="default" elevation={1}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 0,
                mr: 4,
                fontWeight: 700,
                cursor: "pointer",
              }}
              onClick={() => handleNavigate("/")}
            >
              Assistente de Desenvolvimento
            </Typography>

            {isAuthenticated && (
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  color={isActive("/") ? "primary" : "inherit"}
                  onClick={() => handleNavigate("/")}
                  sx={{ fontWeight: isActive("/") ? 600 : 400 }}
                >
                  Home
                </Button>
                <Button
                  color={isActive("/compare-database") ? "primary" : "inherit"}
                  onClick={() => handleNavigate("/compare-database")}
                  sx={{ fontWeight: isActive("/compare-database") ? 600 : 400 }}
                >
                  Comparar Bancos
                </Button>
                <Button
                  color={isActive("/copy-project") ? "primary" : "inherit"}
                  onClick={() => handleNavigate("/copy-project")}
                  sx={{ fontWeight: isActive("/copy-project") ? 600 : 400 }}
                >
                  Copiar Projeto
                </Button>
                <Button
                  color={isActive("/generate-class") ? "primary" : "inherit"}
                  onClick={() => handleNavigate("/generate-class")}
                  sx={{ fontWeight: isActive("/generate-class") ? 600 : 400 }}
                >
                  Gerar Classes
                </Button>
                <Button
                  color={isActive("/users") ? "primary" : "inherit"}
                  onClick={() => handleNavigate("/users")}
                  sx={{ fontWeight: isActive("/users") ? 600 : 400 }}
                >
                  Usuários
                </Button>
              </Box>
            )}

            {isAuthenticated && (
              <>
                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mr: 2 }}
                >
                  {user?.username}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{ mr: 1 }}
                >
                  Sair
                </Button>
              </>
            )}

            <IconButton
              onClick={toggleTheme}
              color="inherit"
              sx={{
                backgroundColor: theme === "light" ? "#fef3c7" : "#1e293b",
                color: theme === "light" ? "#f59e0b" : "#60a5fa",
                border:
                  theme === "light"
                    ? "0.5px solid #fbbf24"
                    : "0.5px solid #3b82f6",
                "&:hover": {
                  backgroundColor: theme === "light" ? "#fde68a" : "#334155",
                  transform: "scale(1.05)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {theme === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>
      <Box component="main">{children}</Box>
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTopButton />
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

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
  );
}
