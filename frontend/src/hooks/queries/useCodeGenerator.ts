import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface InfoClass {
  connectionString: string
  dbType: string
  template: string
  tables: string[]
  pathGeral: string
  projectName: string
  nameSpace: string
  excludePrefixTable: string
}

export function useGetAllTables() {
  return useMutation({
    mutationFn: async (data: { connectionString: string; dbType: string }) => {
      const response = await api.post<string[]>('/code-generator/all-tables', data)
      return response.data
    },
  })
}

export function useCreateClass() {
  return useMutation({
    mutationFn: async (data: InfoClass) => {
      const response = await api.post<boolean>('/code-generator/create-class', data)
      return response.data
    },
  })
}
