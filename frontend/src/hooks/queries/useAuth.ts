import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface LoginDto {
  login: string
  password: string
}

interface LoginResponse {
  token: string
  username: string
  login: string
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginDto) => {
      const response = await api.post<string>('/auth/login', credentials)
      return response.data
    },
    onSuccess: (token, variables) => {
      localStorage.setItem('token', token)
      // Salvamos também o usuário no localStorage
      const user = {
        username: variables.login, // Usamos o login como username por enquanto
        login: variables.login,
      }
      localStorage.setItem('user', JSON.stringify(user))
    },
  })
}
