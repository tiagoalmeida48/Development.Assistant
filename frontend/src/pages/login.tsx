import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from '@mui/material'
import { Login as LoginIcon } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { loginMutation } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [formData, setFormData] = useState({ login: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.login || !formData.password) {
      enqueueSnackbar('Preencha todos os campos', { variant: 'error' })
      return
    }

    try {
      await loginMutation.mutateAsync(formData)
      enqueueSnackbar('Login realizado com sucesso!', { variant: 'success' })
      navigate('/')
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Erro ao fazer login',
        { variant: 'error' }
      )
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  mb: 2,
                }}
              >
                <LoginIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography component="h1" variant="h5" fontWeight={600} gutterBottom>
                Assistente de Desenvolvimento
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Entre com suas credenciais para acessar o sistema
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
                disabled={loginMutation.isPending}
                required
                margin="normal"
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
                disabled={loginMutation.isPending}
                required
                margin="normal"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loginMutation.isPending}
                startIcon={
                  loginMutation.isPending ? <CircularProgress size={20} /> : <LoginIcon />
                }
                sx={{ mt: 3 }}
              >
                {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
