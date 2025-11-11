import { useState } from 'react'
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<DatabaseClass | null>(null)

  const mutate = async (params: ConnectionStringDto) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.post<DatabaseClass>('/database/compare-databases', params)
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
