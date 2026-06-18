import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AutoAwesome as SparkIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/shared/hooks/use-theme";
import { Sidebar } from "./sidebar";

const EXPANDED_WIDTH = 280;
const COLLAPSED_WIDTH = 88;

export function AppLayout({ children }: { children: React.ReactNode }) {
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
          <Sidebar
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
          <Sidebar collapsed={false} onNavigate={handleNavigate} />
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
