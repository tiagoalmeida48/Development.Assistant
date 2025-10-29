import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface UseAsyncActionReturn<T> {
  loading: boolean
  error: string | null
  success: boolean
  data: T | null
  execute: (action: () => Promise<T>) => Promise<void>
  reset: () => void
}

export function useAsyncAction<T = void>(): UseAsyncActionReturn<T> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (action: () => Promise<T>) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      const result = await action()
      setData(result)
      setSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      setSuccess(false)
      toast.error('Erro', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setSuccess(false)
    setData(null)
  }, [])

  return { loading, error, success, data, execute, reset }
}
