import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

interface DatabaseClass {
  database1: string
  database2: string
  tables: Array<{
    database: string
    table: string
    totalRegisters: number
    columns: Array<{
      name: string
      type: string
      isPrimaryKey: boolean
      isNullable: boolean
      isIdentity: boolean
    }>
  }>
  registerTables: Array<{
    table: string
    totalRegisters1: number
    totalRegisters2: number
  }>
}

interface ConnectionStringDto {
  connectionString1: string
  connectionString2: string
  dbType: string
}

export function useCompareDatabases() {
  return useMutation({
    mutationFn: async (data: ConnectionStringDto) => {
      const response = await api.post<DatabaseClass>('/database/compare-databases', data)
      return response.data
    },
  })
}
