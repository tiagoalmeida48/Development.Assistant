import { useState, useEffect } from 'react'
import { api } from '@/shared/api/axios'

interface InputHistory {
  id: number
  user: number
  input: string
  valueInput: string
  databaseType: string | null
}

export function useInputHistory(
  input: string,
  valueInput?: string,
  databaseType?: string,
  enabled: boolean = false
) {
  const [data, setData] = useState<InputHistory[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    if (!input) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const params = new URLSearchParams({ input })
      if (valueInput) {
        params.append('valueInput', valueInput)
      }
      if (databaseType) {
        params.append('databaseType', databaseType)
      }
      const response = await api.get<InputHistory[]>(`/inputhistory/All?${params}`)
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
     enabled && fetchData()
  }, [input, valueInput, databaseType])

  return { data, isLoading, error, refetch: fetchData }
}

export function useCreateInputHistory() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = async (params: {
    input: string
    valueInput: string
    databaseType?: string | null
  }) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.post<boolean>('/inputhistory/Create', {
        input: params.input,
        valueInput: params.valueInput,
        databaseType: params.databaseType ?? null,
      })
      return response.data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading, error }
}

export function useDeleteInputHistory() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<boolean | null>(null)

  const mutate = async (id: number, onSuccessCallback?: () => void) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.delete<boolean>('/inputhistory/Delete', {
        params: { id },
      })
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
