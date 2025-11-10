import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface CopyProjectParams {
  sourceProjectPath: string
  destinationProjectPath: string
  oldNamespace: string
  newNamespace: string
}

export function useCopyProject() {
  return useMutation({
    mutationFn: async (params: CopyProjectParams) => {
      const response = await api.get<boolean>('/project/copy-project', { params })
      return response.data
    },
  })
}
