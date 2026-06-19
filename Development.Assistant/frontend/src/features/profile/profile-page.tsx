import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  BadgeOutlined as BadgeIcon,
  LockOutlined as LockIcon,
  PersonOutline as PersonIcon,
  PhotoCameraOutlined as PhotoCameraIcon,
  SaveOutlined as SaveIcon,
} from "@mui/icons-material";
import { useAuth } from "@/features/auth";
import { useUsers, useUpdateUser } from "@/features/users";
import { useSnackbar } from "notistack";

export default function ProfilePage() {
  const { user, updateStoredUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const updateUserMutation = useUpdateUser();
  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  const currentUser = useMemo(
    () => users?.find((item) => item.login === user?.login) ?? null,
    [users, user?.login]
  );

  useEffect(() => {
    setUsername(user?.username ?? "");
  }, [user?.username]);

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

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      enqueueSnackbar("Selecione uma imagem válida para a foto de perfil.", {
        variant: "warning",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfilePhoto(result);

      if (user?.login) {
        localStorage.setItem(`profilePhoto:${user.login}`, result);
      }

      enqueueSnackbar("Foto de perfil atualizada com sucesso.", {
        variant: "success",
      });
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSaveProfile = async () => {
    if (!currentUser || !user) {
      enqueueSnackbar("Nao foi possivel localizar os dados do usuario.", {
        variant: "error",
      });
      return;
    }

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      enqueueSnackbar("Informe um nome para atualizar o perfil.", {
        variant: "warning",
      });
      return;
    }

    try {
      await updateUserMutation.mutate({
        id: currentUser.id,
        username: trimmedUsername,
        login: currentUser.login,
        password,
      });

      updateStoredUser({
        username: trimmedUsername,
        login: currentUser.login,
      });

      setPassword("");
      enqueueSnackbar("Perfil atualizado com sucesso.", {
        variant: "success",
      });
    } catch {
      enqueueSnackbar("Nao foi possivel salvar as alteracoes do perfil.", {
        variant: "error",
      });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Perfil
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Informações da sua conta no assistente
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "360px 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Card>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Avatar
              src={profilePhoto || undefined}
              sx={{
                width: 88,
                height: 88,
                mx: "auto",
                mb: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: "1.6rem",
                fontWeight: 800,
              }}
            >
              {initials}
            </Avatar>
            <Typography variant="h5">{user?.username}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {user?.login}
            </Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              sx={{ mt: 3 }}
            >
              Alterar foto
              <input hidden accept="image/*" type="file" onChange={handlePhotoChange} />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              {!currentUser && !isLoadingUsers ? (
                <Alert severity="warning">
                  Nao foi possivel carregar os dados do usuario para edicao.
                </Alert>
              ) : null}

              <TextField
                fullWidth
                label="Nome"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <PersonIcon sx={{ color: "text.secondary", mr: 1.25 }} />
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Login"
                value={user?.login ?? ""}
                disabled
                InputProps={{
                  startAdornment: (
                    <BadgeIcon sx={{ color: "text.secondary", mr: 1.25 }} />
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Nova senha"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                helperText="Preencha apenas se quiser alterar a senha atual."
                InputProps={{
                  startAdornment: (
                    <LockIcon sx={{ color: "text.secondary", mr: 1.25 }} />
                  ),
                }}
              />

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
                disabled={isLoadingUsers || updateUserMutation.isLoading || !currentUser}
                sx={{ alignSelf: "flex-start" }}
              >
                Salvar alteracoes
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
