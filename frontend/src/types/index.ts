export enum DbType {
  MySQL = 'MY_SQL',
  SQLServer = 'SQL_SERVER',
  Oracle = 'ORACLE',
  PostgreSQL = 'POSTGRE_SQL',
}

export interface ColumnClass {
  field: string
  type: string
  null?: string
  key?: string
}

export interface TableClass {
  database?: string
  table: string
  columns?: ColumnClass[]
  totalRegisters?: number
}

export interface RegisterClass {
  table: string
  totalRegisters1: number
  totalRegisters2: number
}

export interface DatabaseComparisonResult {
  database1: string
  database2: string
  differentTables: TableClass[]
  differentRegisters: RegisterClass[]
}

export interface PocoClassInput {
  connectionString: string
  dbType: DbType
  tables: string[]
  pathGeral: string
  projectName: string
  nameSpace: string
}

export interface CreatePocoClassResult {
  success: boolean
  message: string
}

export interface CopyProjectResult {
  success: boolean
  message: string
}
