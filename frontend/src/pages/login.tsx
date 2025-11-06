import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {LogIn, Loader2, Moon, Sun} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/api'
import { Button, Input, Label, Card } from '@/components/ui'
import {useTheme} from "@/hooks/useTheme.ts";

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({ login: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.login || !formData.password) {
      toast.error('Preencha todos os campos')
      return
    }

    setIsLoading(true)

    try {
      let token = await api.auth.login(formData.login, formData.password)

      // Remover aspas duplas se a API retornar string JSON ("token")
      if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1)
      }

      // Token JWT decodificado para pegar informações do usuário
      // Por enquanto vamos criar um usuário mock
      const user = {
        id: 1,
        username: formData.login,
        login: formData.login,
      }

      login(token, user)
      navigate('/')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      {/* Botão de tema - Canto superior direito */}
      <div className="fixed top-4 right-4 z-50">
        <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0 relative overflow-hidden group border-2 hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20 dark:from-blue-400/20 dark:to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          {theme === 'light' ? (
              <Moon className="h-4 w-4 min-h-4 min-w-4 relative z-10 text-slate-700 group-hover:text-blue-600 transition-colors" />
          ) : (
              <Sun className="h-4 w-4 min-h-4 min-w-4 relative z-10 text-amber-400 group-hover:text-amber-300 transition-colors" />
          )}
        </Button>
      </div>

      <Card className="w-full max-w-md border-border p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-card-foreground">Assistente de Desenvolvimento</h1>
          <p className="text-sm text-muted-foreground">
            Entre com suas credenciais para acessar o sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login">Login</Label>
            <Input
              id="login"
              name="login"
              type="text"
              placeholder="Digite seu login"
              value={formData.login}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Digite sua senha"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}
