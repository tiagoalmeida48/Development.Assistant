import { useState } from 'react'
import { api } from '@/lib/axios'

interface InfoClass {
  connectionString: string
  dbType: string
  template: string
  tables: string[]
  pathGeral: string
  projectName: string
  nameSpace: string
  excludePrefixTable: string
}

export function useGetAllTables() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<string[] | null>(null)

  const mutate = async (params: { connectionString: string; dbType: string }) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.post<string[]>('/code-generator/all-tables', params)
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
  const [data, setData] = useState<boolean | null>(null)

  const mutate = async (params: InfoClass) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.post<boolean>('/code-generator/create-class', params)
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
