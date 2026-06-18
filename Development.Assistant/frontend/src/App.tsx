import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  Typography,
  Button,
  Box,
  IconButton,
  Divider,
  Stack,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  AutoAwesome as SparkIcon,
  Storage as DatabaseIcon,
  ContentCopy as CopyIcon,
  Code as CodeIcon,
  People as UsersIcon,
  DataObject as JsonToolsIcon,
  Memory as Base64Icon,
  Lock as CryptographyIcon,
  MenuOpen as MenuOpenIcon,
  Menu as MenuIcon,
  AccountCircle as AccountIcon,
} from "@mui/icons-material";
import CompareDatabasePage from "@/pages/compare-database";
import CopyProjectPage from "@/pages/copy-project";
import GenerateClassPage from "@/pages/generate-class";
import LoginPage from "@/pages/login";
import UsersPage from "@/pages/users";
import ProfilePage from "@/pages/profile";
import JsonToolsPage from "@/pages/json-tools";
import Base64ToolsPage from "@/pages/base64-tools";
import CryptographyToolsPage from "@/pages/cryptography-tools";
import { useTheme } from "@/hooks/useTheme";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import React, { useState } from "react";

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const navItems = [
    { label: "Comparar Bancos", path: "/compare-database", icon: DatabaseIcon },
    { label: "Copiar Projeto", path: "/copy-project", icon: CopyIcon },
    { label: "Gerar Classes", path: "/generate-class", icon: CodeIcon },
    { label: "Ferramentas JSON", path: "/json-tools", icon: JsonToolsIcon },
    { label: "Conversor Base64", path: "/base64-tools", icon: Base64Icon },
    { label: "Criptografia", path: "/cryptography-tools", icon: CryptographyIcon },
    { label: "Usuários", path: "/users", icon: UsersIcon },
  ];

  if (location.pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
        background:
          theme === "light"
            ? "radial-gradient(circle at 8% 2%, rgba(20, 125, 111, 0.12), transparent 28%), radial-gradient(circle at 86% 0%, rgba(178, 58, 72, 0.1), transparent 26%)"
            : "radial-gradient(circle at 8% 2%, rgba(85, 199, 173, 0.16), transparent 28%), radial-gradient(circle at 86% 0%, rgba(240, 120, 131, 0.12), transparent 26%)",
      }}
    >
      <Box
        component="aside"
        sx={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: isSidebarOpen ? 280 : 88,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          p: 2,
          alignItems: isSidebarOpen ? "stretch" : "center",
          transition: "width 180ms ease",
          backdropFilter: "blur(18px)",
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor:
            theme === "light"
              ? "rgba(255, 255, 255, 0.72)"
              : "rgba(16, 16, 16, 0.72)",
        }}
      >
        <Stack
          direction={isSidebarOpen ? "row" : "column"}
          alignItems="center"
          spacing={isSidebarOpen ? 1.5 : 1}
          sx={{ minHeight: isSidebarOpen ? 48 : 88, width: "100%" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: isSidebarOpen ? "flex-start" : "center",
              gap: 1.5,
              minWidth: 0,
              flex: isSidebarOpen ? 1 : "none",
              width: isSidebarOpen ? "auto" : 48,
              cursor: "pointer",
            }}
            onClick={() => handleNavigate("/compare-database")}
          >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  color: "primary.contrastText",
                  bgcolor: "primary.main",
                  boxShadow: "0 12px 28px rgba(20, 125, 111, 0.28)",
                }}
              >
                <SparkIcon fontSize="small" />
              </Box>
            {isSidebarOpen && (
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" component="div" sx={{ lineHeight: 1.1 }}>
                  Assistente
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Desenvolvimento
                </Typography>
              </Box>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => setIsSidebarOpen((value) => !value)}
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
            }}
          >
            {isSidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        </Stack>

        {isAuthenticated && (
          <>
            <Stack
              spacing={1}
              sx={{
                mt: 4,
                flex: 1,
                width: "100%",
                alignItems: isSidebarOpen ? "stretch" : "center",
              }}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                const navButton = (
                  <Button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    startIcon={<Icon />}
                    sx={{
                      minHeight: 46,
                      width: isSidebarOpen ? "100%" : 48,
                      justifyContent: isSidebarOpen ? "flex-start" : "center",
                      px: isSidebarOpen ? 1.6 : 0,
                      minWidth: 0,
                      color: active ? "primary.main" : "text.secondary",
                      bgcolor: active ? "primary.lighter" : "transparent",
                      "& .MuiButton-startIcon": {
                        mr: isSidebarOpen ? 1 : 0,
                      },
                      "&:hover": {
                        bgcolor: active ? "primary.lighter" : "action.hover",
                      },
                    }}
                  >
                    {isSidebarOpen ? item.label : ""}
                  </Button>
                );

                return isSidebarOpen ? (
                  navButton
                ) : (
                  <Tooltip key={item.path} title={item.label} placement="right">
                    {navButton}
                  </Tooltip>
                );
              })}
            </Stack>

            <Divider sx={{ my: 2, width: "100%" }} />
            <Stack
              spacing={1.2}
              sx={{
                width: "100%",
                alignItems: isSidebarOpen ? "stretch" : "center",
              }}
            >
              {isSidebarOpen ? (
                <Button
                  variant={isActive("/profile") ? "contained" : "outlined"}
                  startIcon={<AccountIcon />}
                  onClick={() => handleNavigate("/profile")}
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    px: 1.4,
                    overflow: "hidden",
                    "& .MuiButton-startIcon": {
                      flexShrink: 0,
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user?.username}
                  </Box>
                </Button>
              ) : (
                <Tooltip title={user?.username || "Perfil"} placement="right">
                  <IconButton
                    onClick={() => handleNavigate("/profile")}
                    sx={{
                      width: 48,
                      height: 42,
                      border: "1px solid",
                      borderColor: isActive("/profile") ? "primary.main" : "divider",
                      bgcolor: isActive("/profile") ? "primary.lighter" : "transparent",
                      color: isActive("/profile") ? "primary.main" : "text.secondary",
                    }}
                  >
                    <AccountIcon />
                  </IconButton>
                </Tooltip>
              )}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                sx={{
                  width: isSidebarOpen ? "100%" : 48,
                  height: 42,
                  justifyContent: "center",
                  minWidth: 0,
                  px: 0,
                  "& .MuiButton-startIcon": {
                    mr: isSidebarOpen ? 1 : 0,
                  },
                }}
                >
                  {isSidebarOpen ? "Sair" : ""}
                </Button>

              {isSidebarOpen ? (
                <FormControl size="small" fullWidth>
                  <Select
                    value={theme}
                    onChange={(event) => {
                      if (event.target.value !== theme) {
                        toggleTheme();
                      }
                    }}
                    displayEmpty
                    sx={{
                      bgcolor: "background.paper",
                      textAlign: "left",
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 1,
                        bgcolor: "background.paper",
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: "background.paper",
                          backgroundImage: "none",
                          "& .MuiList-root": {
                            bgcolor: "background.paper",
                          },
                          "& .MuiMenuItem-root": {
                            bgcolor: "background.paper",
                          },
                          "& .MuiMenuItem-root.Mui-selected": {
                            bgcolor: "primary.lighter",
                          },
                          "& .MuiMenuItem-root.Mui-selected:hover": {
                            bgcolor: "primary.lighter",
                          },
                          "& .MuiMenuItem-root:hover": {
                            bgcolor: "action.hover",
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="light">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LightModeIcon fontSize="small" />
                        <span>Claro</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="dark">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <DarkModeIcon fontSize="small" />
                        <span>Escuro</span>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <Tooltip title={theme === "light" ? "Tema claro" : "Tema escuro"} placement="right">
                  <IconButton
                    onClick={toggleTheme}
                    color="inherit"
                    sx={{
                      width: 48,
                      height: 42,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor:
                        theme === "light"
                          ? "rgba(255,255,255,0.72)"
                          : "rgba(255,255,255,0.06)",
                      color: theme === "light" ? "warning.dark" : "primary.light",
                    }}
                  >
                    {theme === "light" ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </>
        )}
      </Box>
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          pb: 5,
          position: "relative",
          overflow: "hidden",
          isolation: "isolate",
          "& > *": {
            position: "relative",
            zIndex: 1,
          },
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)
            `,
            backgroundSize: "34px 34px",
            opacity: theme === "light" ? 0.42 : 0.34,
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.92), rgba(0,0,0,0.18))",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "-20%",
            pointerEvents: "none",
            zIndex: 0,
            background: theme === "light"
              ? "linear-gradient(115deg, transparent 26%, rgba(20, 125, 111, 0.06) 46%, transparent 68%)"
              : "linear-gradient(115deg, transparent 24%, rgba(85, 199, 173, 0.05) 46%, transparent 70%)",
            opacity: theme === "light" ? 0.55 : 0.45,
          },
        }}
      >
        {children}
      </Box>
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

            <Route path="/" element={<Navigate to="/compare-database" replace />} />
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
            <Route
              path="/json-tools"
              element={
                <PrivateRoute>
                  <JsonToolsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/base64-tools"
              element={
                <PrivateRoute>
                  <Base64ToolsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/cryptography-tools"
              element={
                <PrivateRoute>
                  <CryptographyToolsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
