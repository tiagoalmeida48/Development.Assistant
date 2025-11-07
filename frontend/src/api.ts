import type { ApiResponse } from './types'

export interface DatabaseClass {
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

export interface InfoClass {
  connectionString: string
  dbType: number
  template: number
  tables: string[]
  pathGeral: string
  projectName: string
  nameSpace: string
  excludePrefixTable: string
}

// ==================== HELPER ====================

async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  params?: Record<string, string>,
  body?: unknown
): Promise<T> {
  const url = new URL(`${import.meta.env.VITE_API_URL}${endpoint}`, window.location.origin)

  if (method === 'GET' && params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  // Pegar token do localStorage
  const token = localStorage.getItem('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Adicionar Authorization header se token existir
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // Pegar o content-type para saber como parsear
  const contentType = response.headers.get('content-type')

  // Se for JSON, parsear como JSON
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json() as ApiResponse<T>

    // Se a resposta indicar falha, lançar erro
    if (!data.success) {
      throw new Error(data.message || 'Erro desconhecido')
    }

    // Retornar apenas o result
    return data.result
  }

  // Se não for JSON e não for OK, lançar erro
  if (!response.ok) {
    throw new Error(`Erro: ${response.statusText}`)
  }

  // Se for texto, retornar como texto (para casos especiais)
  return response.text() as T
}

// ==================== API ====================

export const api = {
  auth: {
    login: (login: string, password: string) =>
      apiCall<string>('/auth/login', 'POST', undefined, { login, password }),
  },

  user: {
    getAll: () =>
      apiCall<any[]>('/user/all', 'GET'),

    get: (id: number) =>
      apiCall<any>('/user/get', 'GET', { id: id.toString() }),

    create: (username: string, login: string, password: string) =>
      apiCall<boolean>('/user/create', 'POST', undefined, { username, login, password }),

    update: (id: number, username: string, login: string, password: string) =>
      apiCall<boolean>('/user/update', 'PUT', undefined, { id, username, login, password }),
  },

  database: {
    compareDatabases: (connectionString1: string, connectionString2: string, dbType: number) =>
      apiCall<DatabaseClass>('/database/compare-databases', 'POST', undefined, {
        connectionString1,
        connectionString2,
        dbType,
      }),

    getDatabaseTypes: () =>
      apiCall<string[]>('/database/types', 'GET'),
  },

  codeGenerator: {
    getAllTables: (connectionString: string, dbType: number) =>
      apiCall<string[]>('/code-generator/all-tables', 'POST', undefined, {
        connectionString,
        dbType,
      }),

    createClass: (input: InfoClass) =>
      apiCall<boolean>('/code-generator/create-class', 'POST', undefined, input),
  },

  project: {
    copyProject: (sourceProjectPath: string, destinationProjectPath: string, oldNamespace: string, newNamespace: string) =>
      apiCall<boolean>('/project/copy-project', 'GET', {
        sourceProjectPath,
        destinationProjectPath,
        oldNamespace,
        newNamespace,
      }),
  },

  inputHistory: {
    getAll: (input: string, valueInput?: string) =>
      apiCall<Array<{ id: number; user: number; input: string; valueInput: string }>>(
        '/inputhistory/all',
        'GET',
        valueInput ? { input, valueInput } : { input }
      ),

    delete: (ids: number[]) =>
      apiCall<boolean>('/inputhistory/delete', 'DELETE', undefined, ids),
  },
}

export default api
