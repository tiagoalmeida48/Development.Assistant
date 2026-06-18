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

      const response = await api.post<boolean>('/project/CopyProject', params)
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

export function useCopyProjectZip() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<{ blob: Blob; filename: string } | null>(null)

  const mutate = async (params: { projectZip: File; oldNamespace: string; newNamespace: string }) => {
    try {
      setIsLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('projectZip', params.projectZip)
      formData.append('oldNamespace', params.oldNamespace)
      formData.append('newNamespace', params.newNamespace)

      const response = await api.post('/project/CopyProjectZip', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const result = {
        blob: response.data,
        filename: `${params.newNamespace || 'project'}.zip`,
      }
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
