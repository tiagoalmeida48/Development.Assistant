import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface InputHistory {
  id: number
  user: number
  input: string
  valueInput: string
}

export function useInputHistory(input: string, valueInput?: string) {
  return useQuery({
    queryKey: ['input-history', input, valueInput],
    queryFn: async () => {
      const params = new URLSearchParams({ input })
      if (valueInput) {
        params.append('valueInput', valueInput)
      }
      const response = await api.get<InputHistory[]>(`/inputhistory/all?${params}`)
      return response.data
    },
    enabled: !!input,
  })
}

export function useDeleteInputHistory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete<boolean>('/inputhistory/delete', {
        params: { id },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['input-history'] })
    },
  })
}
