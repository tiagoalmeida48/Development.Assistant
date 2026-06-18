import { useState } from 'react'
import { api } from '@/shared/api/axios'

export type CryptographyOperation = 'Encrypt' | 'Decrypt'

export function useCryptography() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<string | null>(null)

  const mutate = async (params: {
    key: string
    operation: CryptographyOperation
    text: string
  }) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.post<string>('/cryptography/Process', params)
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
