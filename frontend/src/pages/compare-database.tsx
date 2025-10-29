import { useState } from 'react'
import { api, type DatabaseClass } from '@/api'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { validateFields } from '@/utils'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@/components/ui'
import { DatabaseComparisonTable } from '@/components/DatabaseComparisonTable'
import { CheckCircle2, Database, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'

export default function CompareDatabasePage() {
  const [connectionString1, setConnectionString1] = useState('')
  const [connectionString2, setConnectionString2] = useState('')
  const [dbType, setDbType] = useState('0')

  const { loading, data: result, execute } = useAsyncAction<DatabaseClass>()

  const handleCompare = async () => {
    if (!validateFields({ connectionString1, connectionString2 }, 'Preencha todas as strings de conexão')) {
      return
    }

    await execute(() => api.database.compareDatabases(connectionString1, connectionString2, parseInt(dbType)))
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Comparar Bancos de Dados</h1>
      </div>

      <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Configuração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dbType" className="text-sm font-medium">Tipo de Banco de Dados</Label>
            <select
              id="dbType"
              value={dbType}
              onChange={(e) => setDbType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
            >
              <option value="0">MySQL</option>
              <option value="1">Oracle</option>
              <option value="2">PostgreSQL</option>
              <option value="3">SQL Server</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conn1" className="text-sm font-medium">Connection String - Banco 1</Label>
            <Input
              id="conn1"
              placeholder="Server=localhost;Database=db1;User=user;Password=pass;"
              value={connectionString1}
              onChange={(e) => setConnectionString1(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conn2" className="text-sm font-medium">Connection String - Banco 2</Label>
            <Input
              id="conn2"
              placeholder="Server=localhost;Database=db2;User=user;Password=pass;"
              value={connectionString2}
              onChange={(e) => setConnectionString2(e.target.value)}
              className="h-10"
            />
          </div>

          <Button
            onClick={handleCompare}
            disabled={loading}
            className="w-full h-10"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Comparando...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Comparar Bancos
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Diferenças de Estrutura - Tabela */}
          {result.tables && result.tables.length > 0 && (
            <Card className="mb-6 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="h-5 w-5" />
                  Diferenças de Estrutura
                </CardTitle>
                <CardDescription className="text-sm">
                  {result.tables.length} diferença{result.tables.length > 1 ? 's' : ''} encontrada{result.tables.length > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DatabaseComparisonTable
                  tables={result.tables}
                  database1={result.database1}
                  database2={result.database2}
                />
              </CardContent>
            </Card>
          )}

          {/* Diferenças de Registros - Tabela */}
          {result.registerTables && result.registerTables.length > 0 && (
            <Card className="mb-6 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="h-5 w-5" />
                  Diferenças de Quantidade de Registros
                </CardTitle>
                <CardDescription className="text-sm">
                  Tabelas com quantidade diferente de registros entre os bancos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Tabela</th>
                        <th className="px-4 py-2 text-right font-semibold bg-green-50 dark:bg-green-950">
                          <div className="flex items-center justify-end gap-1">
                            <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            {result.database1}
                          </div>
                        </th>
                        <th className="px-2 py-1.5 text-right font-semibold bg-blue-50 dark:bg-blue-950">
                          <div className="flex items-center justify-end gap-1">
                            <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            {result.database2}
                          </div>
                        </th>
                        <th className="px-2 py-1.5 text-center font-semibold">Diferença</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.registerTables.map((reg, idx) => {
                        const diff = reg.totalRegisters1 - reg.totalRegisters2
                        const absDiff = Math.abs(diff)

                        return (
                          <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-3 font-medium">{reg.table}</td>
                            <td className="px-4 py-3 text-right bg-green-50/60 dark:bg-green-950/30 font-semibold">
                              {reg.totalRegisters1.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right bg-blue-50/60 dark:bg-blue-950/30 font-semibold">
                              {reg.totalRegisters2.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                diff > 0
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {diff > 0 ? (
                                  <>
                                    <ArrowRight className="h-3 w-3" />
                                    +{absDiff}
                                  </>
                                ) : (
                                  <>
                                    <ArrowLeft className="h-3 w-3" />
                                    +{absDiff}
                                  </>
                                )}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bancos Idênticos */}
          {(!result.tables || result.tables.length === 0) &&
           (!result.registerTables || result.registerTables.length === 0) && (
            <div className="text-center py-6">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="text-sm font-semibold mb-1">Bancos Idênticos</h3>
              <p className="text-xs text-muted-foreground">
                Os bancos de dados possuem a mesma estrutura e quantidade de registros.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
