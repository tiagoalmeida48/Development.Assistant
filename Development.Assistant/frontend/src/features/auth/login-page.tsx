import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  CircularProgress,
  Container,
  IconButton,
  Chip,
  Stack,
  alpha,
} from "@mui/material";
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Login as LoginIcon,
  AutoAwesome as SparkIcon,
  LockOutlined as LockIcon,
  TerminalOutlined as TerminalIcon,
  HubOutlined as HubIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useAuth } from "./auth-context";
import { useTheme } from "@/shared/hooks/use-theme";

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

  const benefits = [
    { label: "Acesso seguro", icon: LockIcon },
    { label: "Rotinas de código", icon: TerminalIcon },
    { label: "Fluxos integrados", icon: HubIcon },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        background:
          theme === "light"
            ? "linear-gradient(135deg, #f7f9fb 0%, #edf7f2 54%, #fff7f8 100%)"
            : "linear-gradient(135deg, #101010 0%, #17231f 55%, #241719 100%)",
      }}
    >
      <IconButton
        onClick={toggleTheme}
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
            transform: "translateY(-1px)",
          },
          transition: "all 0.2s ease",
        }}
      >
        {theme === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
            gap: { xs: 3, md: 5 },
            alignItems: "center",
          }}
        >
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Chip
              icon={<SparkIcon />}
              label="Development Assistant"
              color="primary"
              sx={{ mb: 2 }}
            />
            <Typography variant="h2" sx={{ mb: 2, maxWidth: 620 }}>
              Entre e acelere as rotinas do seu backend.
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 560, lineHeight: 1.8 }}
            >
              Compare bancos, gere camadas, copie projetos e mantenha o fluxo
              de desenvolvimento em um único ambiente.
            </Typography>

            <Stack direction="row" spacing={1.2} flexWrap="wrap" sx={{ mt: 4, rowGap: 1.2 }}>
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Chip
                    key={benefit.label}
                    icon={<Icon />}
                    label={benefit.label}
                    variant="outlined"
                    sx={{ bgcolor: "background.paper" }}
                  />
                );
              })}
            </Stack>
          </Box>

          <Card sx={{ width: "100%", maxWidth: 460, justifySelf: "center" }}>
            <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    mb: 2,
                    boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.main, 0.18)}`,
                  }}
                >
                  <LoginIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography component="h1" variant="h5" gutterBottom>
                  Bem-vindo de volta
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ lineHeight: 1.7 }}
                >
                  Acesse o assistente para continuar suas tarefas.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
                />

                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  type="password"
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
                      <CircularProgress size={20} />
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
      </Container>
    </Box>
  );
}
