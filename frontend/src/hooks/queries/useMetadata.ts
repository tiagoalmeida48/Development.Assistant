import { useQuery } from '@tanstack/react-query'
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
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await api.get<Template[]>('/metadata/all-template')
      return response.data
    },
  })
}
export function useDatabaseTypes() {
  return useQuery({
    queryKey: ['database-types'],
    queryFn: async () => {
      const response = await api.get<DatabaseType[]>('/metadata/all-database-type')
      return response.data
    },
  })
}
