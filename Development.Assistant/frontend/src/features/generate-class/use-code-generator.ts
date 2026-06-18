import { useState } from 'react'
import { api } from '@/shared/api/axios'
import type { InfoClass } from './types'

export function useGetAllTables() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<string[] | null>(null)

  const mutate = async (params: { connectionString: string; dbType: string }) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.post<string[]>('/codegenerator/AllTables', params)
      setData(response.data)
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

export function useCreateClass() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<{ blob: Blob; filename: string } | null>(null)

  const mutate = async (params: InfoClass) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.post('/codegenerator/CreateClass', params, {
        responseType: 'blob'
      })

      let filename = `${params.projectName || 'classes'}.zip`

      const result = { blob: response.data, filename }
      setData(result)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading, error, data }
}
