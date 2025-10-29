export enum DbType {
  MySQL = 'MY_SQL',
  SQLServer = 'SQL_SERVER',
  Oracle = 'ORACLE',
  PostgreSQL = 'POSTGRE_SQL',
}

export interface ColumnInfo {
  name: string
  type: string
  isPrimaryKey?: string
  isNullable?: string
}

export interface TableClass {
  database?: string
  table: string
  columns?: ColumnInfo[]
  totalRegisters?: number
}

export interface RegisterClass {
  table: string
  totalRegisters1: number
  totalRegisters2: number
}

export interface DatabaseClass {
  database1: string
  database2: string
  tables: TableClass[]
  registerTables: RegisterClass[]
}

export interface InfoClass {
  connectionString: string
  dbType: DbType
  tables: string[]
  pathGeral: string
  projectName: string
  nameSpace: string
}