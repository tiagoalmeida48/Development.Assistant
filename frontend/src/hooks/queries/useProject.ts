import { useState } from 'react'
import { api } from '@/lib/axios'

interface CopyProjectParams {
  sourceProjectPath: string
  destinationProjectPath: string
  oldNamespace: string
  newNamespace: string
}

export function useCopyProject() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<boolean | null>(null)

  const mutate = async (params: CopyProjectParams) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.get<boolean>('/project/copy-project', { params })
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
