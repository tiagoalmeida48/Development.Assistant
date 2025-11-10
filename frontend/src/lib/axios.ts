import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor: Adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor: Desempacotar ResultApi e tratar erros
api.interceptors.response.use(
  (response) => {
    const data = response.data

    // Se a resposta segue o padrão ResultApi
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        throw new Error(data.message || 'Erro desconhecido')
      }
      // Retornar response com o result desempacotado
      response.data = data.result
      return response
    }

    // Se não for ResultApi, retornar response completo
    return response
  },
  (error) => {
    // Tentar extrair mensagem de erro do backend
    const message = error.response?.data?.message || error.message || 'Erro na requisição'
    throw new Error(message)
  }
)
