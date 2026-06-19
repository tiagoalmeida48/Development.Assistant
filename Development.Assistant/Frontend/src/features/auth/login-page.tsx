import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Stack,
  alpha,
} from "@mui/material";
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Login as LoginIcon,
  Terminal as BrandIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useAuth } from "./auth-context";
import { useTheme } from "@/shared/hooks/use-theme";
import { PasswordField } from "@/shared/components/password-field";
import { gridBackdrop } from "@/shared/theme/grid-backdrop";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginMutation, syncAuthFromStorage } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({ login: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.login || !formData.password) {
      enqueueSnackbar("Preencha todos os campos", { variant: "error" });
      return;
    }

    try {
      await loginMutation.mutate(formData);

      syncAuthFromStorage();
      navigate("/");
    } catch (error) {
      const errorMessage =
        loginMutation.getErrorMessage() || "Erro ao fazer login";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        p: 2,
        background:
          theme === "light"
            ? "linear-gradient(180deg, #f7f9fb 0%, #eef4f1 52%, #f8faf9 100%)"
            : "linear-gradient(180deg, #101010 0%, #171717 52%, #111111 100%)",
        ...gridBackdrop(theme),
      }}
    >
      <IconButton
        onClick={toggleTheme}
        aria-label={theme === "light" ? "Mudar para tema escuro" : "Mudar para tema claro"}
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 2,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: (muiTheme) =>
            theme === "light"
              ? alpha(muiTheme.palette.common.white, 0.72)
              : alpha(muiTheme.palette.common.white, 0.06),
          color: theme === "light" ? "warning.dark" : "primary.light",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        {theme === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>

      <Card
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                color: "primary.contrastText",
                bgcolor: "primary.main",
                flexShrink: 0,
              }}
            >
              <BrandIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ lineHeight: 1.15 }} noWrap>
                Assistente de Desenvolvimento
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Gerador de código C# multi-banco
              </Typography>
            </Box>
          </Stack>

          <Typography component="h1" variant="h5" sx={{ mb: 0.5 }}>
            Entrar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Acesse com suas credenciais para continuar.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              id="login"
              name="login"
              label="Login"
              placeholder="Digite seu login"
              value={formData.login}
              onChange={handleChange}
              disabled={loginMutation.isLoading}
              required
              margin="normal"
              autoComplete="username"
              autoFocus
            />

            <PasswordField
              fullWidth
              id="password"
              name="password"
              label="Senha"
              placeholder="Digite sua senha"
              value={formData.password}
              onChange={handleChange}
              disabled={loginMutation.isLoading}
              required
              margin="normal"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loginMutation.isLoading}
              startIcon={
                loginMutation.isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <LoginIcon />
                )
              }
              sx={{ mt: 3, py: 1.25 }}
            >
              {loginMutation.isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
