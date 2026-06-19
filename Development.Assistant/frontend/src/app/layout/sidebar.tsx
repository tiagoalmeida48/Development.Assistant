import {
  Typography,
  Button,
  Box,
  IconButton,
  Divider,
  Stack,
  Tooltip,
  Switch,
  Avatar,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  AutoAwesome as SparkIcon,
  MenuOpen as MenuOpenIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/shared/hooks/use-theme";
import { useAuth } from "@/features/auth";
import { navItems } from "./nav-items";

type SidebarProps = {
  /** Recolhido para faixa de ícones (apenas no modo persistente em desktop). */
  collapsed: boolean;
  /** Permite alternar entre expandido/recolhido; ausente no drawer mobile. */
  onToggleCollapse?: () => void;
  onNavigate: (path: string) => void;
};

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
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

  // Foto de perfil compartilhada com a página de Perfil (localStorage por login).
  const [profilePhoto, setProfilePhoto] = useState("");

  useEffect(() => {
    if (!user?.login) {
      setProfilePhoto("");
      return;
    }
    setProfilePhoto(localStorage.getItem(`profilePhoto:${user.login}`) ?? "");
  }, [user?.login]);

  const initials = user?.username
    ? user.username
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "U";

  const profileAvatar = (size: number) => (
    <Avatar
      src={profilePhoto || undefined}
      sx={{
        width: size,
        height: size,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        fontSize: size <= 24 ? "0.8rem" : "0.95rem",
        fontWeight: 800,
      }}
    >
      {initials}
    </Avatar>
  );

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
            {/* Toggle de tema (claro/escuro) — acima do nome do usuário. */}
            {expanded ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  px: 1.4,
                  py: 0.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                  {theme === "light" ? (
                    <LightModeIcon fontSize="small" sx={{ color: "warning.dark" }} />
                  ) : (
                    <DarkModeIcon fontSize="small" sx={{ color: "primary.light" }} />
                  )}
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {theme === "light" ? "Tema claro" : "Tema escuro"}
                  </Typography>
                </Stack>
                <Switch
                  checked={theme === "dark"}
                  onChange={toggleTheme}
                  size="small"
                  inputProps={{ "aria-label": "Alternar tema claro e escuro" }}
                />
              </Box>
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

            {expanded ? (
              <Button
                variant={isActive("/profile") ? "contained" : "outlined"}
                startIcon={profileAvatar(24)}
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
                    height: 48,
                    p: 0,
                    border: "2px solid",
                    borderColor: isActive("/profile") ? "primary.main" : "divider",
                  }}
                >
                  {profileAvatar(40)}
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
          </Stack>
        </>
      )}
    </Stack>
  );
}
