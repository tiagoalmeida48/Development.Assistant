import { useState, useEffect, useRef } from 'react'
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
  const hasFetched = useRef(false)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Template[]>('/metadata/AllTemplate')
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
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchData()
    }
  }, [])

  return { data, isLoading, error, refetch: fetchData }
}

export function useDatabaseTypes() {
  const [data, setData] = useState<DatabaseType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const hasFetched = useRef(false)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<DatabaseType[]>('/metadata/AllDatabaseType')
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
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchData()
    }
  }, [])

  return { data, isLoading, error, refetch: fetchData }
}
