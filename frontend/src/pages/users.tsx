import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
} from "@/hooks/queries/useUsers";

interface User {
  id: number;
  username: string;
  login: string;
}

export default function UsersPage() {
  const { data: users, isLoading: loadingUsers } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const { enqueueSnackbar } = useSnackbar();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    login: "",
    password: "",
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ username: user.username, login: user.login, password: "" });
    } else {
      setEditingUser(null);
      setFormData({ username: "", login: "", password: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ username: "", login: "", password: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.login) {
      enqueueSnackbar("Preencha nome de usuário e login", { variant: "error" });
      return;
    }

    if (!editingUser && !formData.password) {
      enqueueSnackbar("Senha é obrigatória para novo usuário", {
        variant: "error",
      });
      return;
    }

    try {
      if (editingUser) {
        await updateUserMutation.mutateAsync({
          id: editingUser.id,
          username: formData.username,
          login: formData.login,
          password: formData.password,
        });
        enqueueSnackbar("Usuário atualizado com sucesso!", {
          variant: "success",
        });
      } else {
        await createUserMutation.mutateAsync(formData);
        enqueueSnackbar("Usuário criado com sucesso!", { variant: "success" });
      }

      handleCloseModal();
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : "Erro ao salvar usuário",
        { variant: "error" }
      );
    }
  };

  const isLoading =
    createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Usuários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os usuários do sistema
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Novo Usuário
        </Button>
      </Box>

      {loadingUsers ? (
        <Card>
          <CardContent sx={{ py: 12, textAlign: "center" }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Carregando usuários...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aguarde um momento
            </Typography>
          </CardContent>
        </Card>
      ) : !users || users.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 12, textAlign: "center" }}>
            <PersonAddIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Nenhum usuário cadastrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clique em "Novo Usuário" para começar
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Login</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <Typography fontWeight={500}>{user.username}</Typography>
                  </TableCell>
                  <TableCell>{user.login}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenModal(user)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? "Editar Usuário" : "Novo Usuário"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              id="username"
              name="username"
              label="Nome de Usuário"
              placeholder="Nome completo"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              required
              margin="normal"
            />

            <TextField
              fullWidth
              id="login"
              name="login"
              label="Login"
              placeholder="Login para acesso"
              value={formData.login}
              onChange={handleChange}
              disabled={isLoading}
              required
              margin="normal"
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              type="password"
              label="Senha"
              placeholder={
                editingUser
                  ? "Deixe em branco para manter a atual"
                  : "Digite a senha"
              }
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required={!editingUser}
              margin="normal"
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseModal} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={20} />}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
