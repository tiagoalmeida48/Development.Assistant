import { useState, useEffect } from 'react'
import { api } from '@/lib/axios'

interface InputHistory {
  id: number
  user: number
  input: string
  valueInput: string
}

export function useInputHistory(input: string, valueInput?: string, enabled: boolean = false) {
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
      const response = await api.get<InputHistory[]>(`/inputhistory/all?${params}`)
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
  }, [input, valueInput])

  return { data, isLoading, error, refetch: fetchData }
}

export function useDeleteInputHistory() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<boolean | null>(null)

  const mutate = async (id: number, onSuccessCallback?: () => void) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.delete<boolean>('/inputhistory/delete', {
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
