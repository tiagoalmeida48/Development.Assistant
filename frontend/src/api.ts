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
  dbType: string
  tables: string[]
  pathGeral: string
  projectName: string
  nameSpace: string
}

// ==================== HELPER ====================

async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  params?: Record<string, string>,
  body?: unknown
): Promise<T> {
  const url = new URL(`http://localhost:5000/api${endpoint}`, window.location.origin)

  if (method === 'GET' && params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  const response = await fetch(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`Erro: ${response.statusText}`)
  }

  return response.json()
}

// ==================== API ====================

export const api = {
  database: {
    compareDatabases: (connectionString1: string, connectionString2: string, dbType: string) =>
      apiCall<DatabaseClass>('/database/compare-databases', 'POST', undefined, {
        connectionString1,
        connectionString2,
        dbType,
      }),

    getDatabaseTypes: () =>
      apiCall<string[]>('/database/types', 'GET'),
  },

  codeGenerator: {
    getAllTables: (connectionString: string, dbType: string) =>
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
}

export default api
