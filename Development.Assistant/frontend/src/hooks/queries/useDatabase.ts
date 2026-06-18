import { useState } from 'react'
import { api } from '@/lib/axios'

interface DatabaseClass {
  database1: string
  database2: string
  tables: Array<{
    table1: string | null
    table2: string | null
  }>
  columns: Array<{
    table: string
    columns: Array<{
      column1: string | null
      type1: string | null
      column2: string | null
      type2: string | null
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
  dbType1: string
  dbType2: string
}

export function useCompareDatabases() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<DatabaseClass | null>(null)

  const mutate = async (params: ConnectionStringDto) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.post<DatabaseClass>('/database/CompareDatabases', params)
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
