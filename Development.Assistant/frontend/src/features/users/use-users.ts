import { useState, useEffect } from 'react'
import { api } from '@/shared/api/axios'
import type { User, UserCreateDto, UserUpdateDto } from './types'

export function useUsers() {
  const [data, setData] = useState<User[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<User[]>('/user/All')
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err as Error)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, isLoading, error, refetch: fetchData }
}

export function useUser(id: number) {
  const [data, setData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    if (!id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await api.get<User>(`/user/Get?id=${id}`)
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err as Error)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  return { data, isLoading, error, refetch: fetchData }
}

export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<boolean | null>(null)

  const mutate = async (params: UserCreateDto, onSuccessCallback?: () => void) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.post<boolean>('/user/Create', params)
      setData(response.data)

      if (onSuccessCallback) {
        onSuccessCallback()
      }

      return response.data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading, error, data }
}

export function useUpdateUser() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<boolean | null>(null)

  const mutate = async (params: UserUpdateDto, onSuccessCallback?: () => void) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.put<boolean>('/user/Update', params)
      setData(response.data)

      if (onSuccessCallback) {
        onSuccessCallback()
      }

      return response.data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading, error, data }
}
