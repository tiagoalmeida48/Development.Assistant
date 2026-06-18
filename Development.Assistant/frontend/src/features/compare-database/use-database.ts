import { useState } from 'react'
import { api } from '@/shared/api/axios'
import type { DatabaseClass, ConnectionStringDto } from "./types"

export function useCompareDatabases() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<DatabaseClass | null>(null)

  const mutate = async (params: ConnectionStringDto) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.post<DatabaseClass>('/database/CompareDatabases', params)
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
