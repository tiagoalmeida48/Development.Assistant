export enum DbType {
  MariaDb = '0',
  SqlServer = '1',
  Oracle = '2',
  PostgreSql = '3',
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

export interface ErrorResponse {
  error: string
  details?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  internalError: number
  result: T
}

// ==================== AUTH & USER ====================

export interface User {
  id: number
  username: string
  login: string
  password?: string
}

export interface LoginRequest {
  login: string
  password: string
}

export interface LoginResponse {
  token: string
}