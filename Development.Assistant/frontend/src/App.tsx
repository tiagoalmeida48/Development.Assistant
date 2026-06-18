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
  Drawer,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme as useMuiTheme,
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
import { LoginPage } from "@/features/auth";
import { UsersPage } from "@/features/users";
import { ProfilePage } from "@/features/profile";
import JsonToolsPage from "@/pages/json-tools";
import Base64ToolsPage from "@/pages/base64-tools";
import CryptographyToolsPage from "@/pages/cryptography-tools";
import { useTheme } from "@/shared/hooks/use-theme";
import { AuthProvider, useAuth, PrivateRoute } from "@/features/auth";
import { ScrollToTopButton } from "@/shared/components/scroll-to-top-button";
import React, { useEffect, useState } from "react";

const navItems = [
  { label: "Comparar Bancos", path: "/compare-database", icon: DatabaseIcon },
  { label: "Copiar Projeto", path: "/copy-project", icon: CopyIcon },
  { label: "Gerar Classes", path: "/generate-class", icon: CodeIcon },
  { label: "Ferramentas JSON", path: "/json-tools", icon: JsonToolsIcon },
  { label: "Conversor Base64", path: "/base64-tools", icon: Base64Icon },
  { label: "Criptografia", path: "/cryptography-tools", icon: CryptographyIcon },
  { label: "Usuários", path: "/users", icon: UsersIcon },
];

const EXPANDED_WIDTH = 280;
const COLLAPSED_WIDTH = 88;

type SidebarContentProps = {
  /** Recolhido para faixa de ícones (apenas no modo persistente em desktop). */
  collapsed: boolean;
  /** Permite alternar entre expandido/recolhido; ausente no drawer mobile. */
  onToggleCollapse?: () => void;
  onNavigate: (path: string) => void;
};

function SidebarContent({
  collapsed,
  onToggleCollapse,
  onNavigate,
}: SidebarContentProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;
  const expanded = !collapsed;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Stack
      sx={{
        height: "100%",
        width: "100%",
        p: 2,
        alignItems: expanded ? "stretch" : "center",
      }}
    >
      <Stack
        direction={expanded ? "row" : "column"}
        alignItems="center"
        spacing={expanded ? 1.5 : 1}
        sx={{ minHeight: expanded ? 48 : 88, width: "100%" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: expanded ? "flex-start" : "center",
            gap: 1.5,
            minWidth: 0,
            flex: expanded ? 1 : "none",
            width: expanded ? "auto" : 48,
            cursor: "pointer",
          }}
          onClick={() => onNavigate("/compare-database")}
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
          {expanded && (
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
        {onToggleCollapse && (
          <IconButton
            size="small"
            onClick={onToggleCollapse}
            aria-label={expanded ? "Recolher menu" : "Expandir menu"}
            sx={{ width: 40, height: 40, flexShrink: 0 }}
          >
            {expanded ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        )}
      </Stack>

      {isAuthenticated && (
        <>
          <Stack
            component="nav"
            aria-label="Navegação principal"
            spacing={1}
            sx={{
              mt: 4,
              flex: 1,
              width: "100%",
              alignItems: expanded ? "stretch" : "center",
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              const navButton = (
                <Button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  startIcon={<Icon />}
                  aria-current={active ? "page" : undefined}
                  sx={{
                    minHeight: 46,
                    width: expanded ? "100%" : 48,
                    justifyContent: expanded ? "flex-start" : "center",
                    px: expanded ? 1.6 : 0,
                    minWidth: 0,
                    color: active ? "primary.main" : "text.secondary",
                    bgcolor: active ? "primary.lighter" : "transparent",
                    "& .MuiButton-startIcon": {
                      mr: expanded ? 1 : 0,
                    },
                    "&:hover": {
                      bgcolor: active ? "primary.lighter" : "action.hover",
                    },
                  }}
                >
                  {expanded ? item.label : ""}
                </Button>
              );

              return expanded ? (
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
              alignItems: expanded ? "stretch" : "center",
            }}
          >
            {expanded ? (
              <Button
                variant={isActive("/profile") ? "contained" : "outlined"}
                startIcon={<AccountIcon />}
                onClick={() => onNavigate("/profile")}
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
                  onClick={() => onNavigate("/profile")}
                  aria-label="Perfil"
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
                width: expanded ? "100%" : 48,
                height: 42,
                justifyContent: "center",
                minWidth: 0,
                px: 0,
                "& .MuiButton-startIcon": {
                  mr: expanded ? 1 : 0,
                },
              }}
            >
              {expanded ? "Sair" : ""}
            </Button>

            {expanded ? (
              <FormControl size="small" fullWidth>
                <Select
                  value={theme}
                  onChange={(event) => {
                    if (event.target.value !== theme) {
                      toggleTheme();
                    }
                  }}
                  displayEmpty
                  aria-label="Tema"
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
                  aria-label={theme === "light" ? "Mudar para tema escuro" : "Mudar para tema claro"}
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
    </Stack>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Fecha o drawer mobile ao trocar de rota e ao voltar para desktop.
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isDesktop) {
      setIsMobileNavOpen(false);
    }
  }, [isDesktop]);

  const sidebarSurface =
    theme === "light" ? "rgba(255, 255, 255, 0.72)" : "rgba(16, 16, 16, 0.72)";

  const desktopWidth = isSidebarOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  // Navega; no drawer mobile a navegação fecha o overlay (efeito da rota).
  const handleNavigate = (path: string) => {
    navigate(path);
  };

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
      {/* Desktop (md+): sidebar persistente, colapsável entre 280/88. */}
      {isDesktop && (
        <Box
          component="aside"
          sx={{
            position: "sticky",
            top: 0,
            height: "100vh",
            width: desktopWidth,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            transition: "width 180ms ease",
            backdropFilter: "blur(18px)",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: sidebarSurface,
          }}
        >
          <SidebarContent
            collapsed={!isSidebarOpen}
            onToggleCollapse={() => setIsSidebarOpen((value) => !value)}
            onNavigate={handleNavigate}
          />
        </Box>
      )}

      {/* Mobile (<md): drawer temporário em overlay, acionado pela AppBar. */}
      {!isDesktop && (
        <Drawer
          variant="temporary"
          open={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: EXPANDED_WIDTH,
              boxSizing: "border-box",
              backdropFilter: "blur(18px)",
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: sidebarSurface,
              backgroundImage: "none",
            },
          }}
        >
          <SidebarContent collapsed={false} onNavigate={handleNavigate} />
        </Drawer>
      )}

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
        {/* Topo mobile: hamburger + marca; some em md+ pois a sidebar volta. */}
        {!isDesktop && (
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              bgcolor: sidebarSurface,
              backdropFilter: "blur(18px)",
              color: "text.primary",
              borderBottom: "1px solid",
              borderColor: "divider",
              backgroundImage: "none",
            }}
          >
            <Toolbar sx={{ gap: 1.5, minHeight: 56 }}>
              <IconButton
                edge="start"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Abrir menu"
                sx={{ color: "text.primary" }}
              >
                <MenuIcon />
              </IconButton>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  cursor: "pointer",
                  minWidth: 0,
                }}
                onClick={() => handleNavigate("/compare-database")}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    display: "grid",
                    placeItems: "center",
                    color: "primary.contrastText",
                    bgcolor: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  <SparkIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="h6" component="div" noWrap sx={{ lineHeight: 1.1 }}>
                  Assistente
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>
        )}
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
