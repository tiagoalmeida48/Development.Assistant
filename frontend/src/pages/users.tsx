import { useState, useEffect } from 'react'
import { Plus, Pencil, Loader2, User as UserIcon, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/api'
import { Button, Input, Label, Card, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import type { User } from '@/types'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({ username: '', login: '', password: '' })

  const { execute: executeCreate, loading: loadingCreate } = useAsyncAction()
  const { execute: executeUpdate, loading: loadingUpdate } = useAsyncAction()
  const { execute: executeLoadUsers, loading: loadingUsers } = useAsyncAction()

  // Carregar usuários ao montar o componente
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      await executeLoadUsers(async () => {
        const data = await api.user.getAll()
        console.log('Dados recebidos da API:', data)

        // Garantir que data é um array
        if (Array.isArray(data)) {
          setUsers(data)
        } else {
          console.error('API retornou formato inválido:', data)
          setUsers([])
          toast.error('Formato de dados inválido recebido da API')
        }
      })
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar usuários')
      setUsers([])
    }
  }

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({ username: user.username, login: user.login, password: '' })
    } else {
      setEditingUser(null)
      setFormData({ username: '', login: '', password: '' })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setFormData({ username: '', login: '', password: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username || !formData.login) {
      toast.error('Preencha nome de usuário e login')
      return
    }

    if (!editingUser && !formData.password) {
      toast.error('Senha é obrigatória para novo usuário')
      return
    }

    try {
      if (editingUser) {
        // Update
        await executeUpdate(() =>
          api.user.update(editingUser.id, formData.username, formData.login, formData.password)
        )
        toast.success('Usuário atualizado com sucesso!')
      } else {
        // Create
        await executeCreate(() =>
          api.user.create(formData.username, formData.login, formData.password)
        )
        toast.success('Usuário criado com sucesso!')
      }

      handleCloseModal()
      // Recarregar lista de usuários após sucesso
      await loadUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar usuário')
    }
  }

  const isLoading = loadingCreate || loadingUpdate

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os usuários do sistema
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md border-border text-secondary-foreground">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Nome completo"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login">Login</Label>
                  <Input
                    id="login"
                    name="login"
                    placeholder="Login para acesso"
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
                    placeholder="Digite a senha"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loadingUsers && users.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-1">
                Carregando usuários...
              </h3>
              <p className="text-sm text-muted-foreground">
                Aguarde um momento
              </p>
            </div>
          </div>
        </Card>
      ) : users.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-1">
                Nenhum usuário cadastrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Clique em "Novo Usuário" para começar
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-card-foreground">ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-card-foreground">Nome</th>
                  <th className="text-left p-4 text-sm font-semibold text-card-foreground">Login</th>
                  <th className="text-right p-4 text-sm font-semibold text-card-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(users) && users.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm text-muted-foreground">{user.id}</td>
                    <td className="p-4 text-sm text-card-foreground font-medium">{user.username}</td>
                    <td className="p-4 text-sm text-muted-foreground">{user.login}</td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenModal(user)}
                      >
                        <Pencil className="mr-2 h-3 w-3" />
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
