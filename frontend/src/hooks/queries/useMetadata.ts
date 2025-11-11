import { useState, useEffect } from 'react'
import { api } from '@/lib/axios'

interface DatabaseType {
  id: string
  name: string
}

interface Template {
  id: string
  name: string
}

export function useTemplates() {
  const [data, setData] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Template[]>('/metadata/all-template')
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err as Error)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, isLoading, error, refetch: fetchData }
}

export function useDatabaseTypes() {
  const [data, setData] = useState<DatabaseType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<DatabaseType[]>('/metadata/all-database-type')
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err as Error)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, isLoading, error, refetch: fetchData }
}
