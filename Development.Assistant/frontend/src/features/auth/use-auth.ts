import { useState } from 'react'
import { api, type ApiError } from '@/shared/api/axios'

interface LoginDto {
  login: string
  password: string
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const apiError = error as ApiError;

    if (apiError.errors) {
      const firstError = Object.values(apiError.errors)[0];
      if (firstError && firstError.length > 0) {
        return firstError[0];
      }
    }

    return apiError.message;
  }

  return 'Erro desconhecido';
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [data, setData] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const mutate = async (credentials: LoginDto) => {
    try {
      setIsLoading(true)
      setError(null)
      setIsSuccess(false)

      const response = await api.post<string>('/auth/Login', credentials)
      const token = response.data

      localStorage.setItem('token', token)
      const user = {
        username: credentials.login,
        login: credentials.login,
      }
      localStorage.setItem('user', JSON.stringify(user))

      setData(token)
      setIsSuccess(true)
      return token
    } catch (err) {
      const apiError = err instanceof Error ? (err as ApiError) : new Error(String(err)) as ApiError;
      setError(apiError)
      setIsSuccess(false)
      throw apiError
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setIsSuccess(false)
    setError(null)
    setData(null)
  }

  return { mutate, isLoading, error, data, isSuccess, reset, getErrorMessage: () => error ? getErrorMessage(error) : null }
}

export function useValidateToken(token: string) {
  const [data, setData] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const validate = async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await api.get<boolean>('/auth/ValidateToken', { params: { token } })
      setData(response.data)
      setError(null)
      return response.data
    } catch (err) {
      const apiError = err instanceof Error ? (err as ApiError) : new Error(String(err)) as ApiError;
      setError(apiError)
      setData(null)
      throw apiError
    } finally {
      setIsLoading(false)
    }
  }

  return { data, isLoading, error, validate, getErrorMessage: () => error ? getErrorMessage(error) : null }
}
