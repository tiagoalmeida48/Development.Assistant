export interface DatabaseClass {
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

export interface ConnectionStringDto {
  connectionString1: string
  connectionString2: string
  dbType1: string
  dbType2: string
}
