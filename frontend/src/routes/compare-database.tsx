// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { graphqlClient, graphqlQueries } from '@/api/graphql-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Database, Loader2, ArrowRight, ArrowLeft, MinusCircle, PlusCircle, Info } from 'lucide-react'

function CompareDatabasePage() {
  const [connectionString1, setConnectionString1] = useState('')
  const [connectionString2, setConnectionString2] = useState('')
  const [dbType, setDbType] = useState('MY_SQL')
  const [result, setResult] = useState(null)

  const compareMutation = useMutation({
    mutationFn: async (variables) => {
      return await graphqlClient.request(graphqlQueries.compareDatabases, variables)
    },
    onSuccess: (data) => {
      setResult(data.compareDatabases)
    },
  })

  const handleCompare = () => {
    if (!connectionString1 || !connectionString2) {
      alert('Preencha todas as strings de conexão')
      return
    }

    compareMutation.mutate({
      connectionString1,
      connectionString2,
      dbType,
    })
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Comparar Bancos de Dados</h1>
        <p className="text-gray-600">
          Compare estruturas e dados entre dois bancos de dados
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
          <CardDescription>
            Informe as strings de conexão dos bancos de dados que deseja comparar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dbType">Tipo de Banco de Dados</Label>
            <Select value={dbType} onValueChange={setDbType}>
              <SelectTrigger id="dbType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MY_SQL">MySQL</SelectItem>
                <SelectItem value="ORACLE">Oracle</SelectItem>
                <SelectItem value="POSTGRE_SQL">PostgreSQL</SelectItem>
                <SelectItem value="SQL_SERVER">SQL Server</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conn1">Connection String - Banco 1</Label>
            <Input
              id="conn1"
              placeholder="Server=localhost;Database=db1;User=user;Password=pass;"
              value={connectionString1}
              onChange={(e) => setConnectionString1(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conn2">Connection String - Banco 2</Label>
            <Input
              id="conn2"
              placeholder="Server=localhost;Database=db2;User=user;Password=pass;"
              value={connectionString2}
              onChange={(e) => setConnectionString2(e.target.value)}
            />
          </div>

          <Button
            onClick={handleCompare}
            disabled={compareMutation.isPending}
            className="w-full"
          >
            {compareMutation.isPending ? (
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

      {compareMutation.isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao Comparar</AlertTitle>
          <AlertDescription>
            {compareMutation.error?.message || 'Ocorreu um erro ao comparar os bancos de dados'}
          </AlertDescription>
        </Alert>
      )}

      {result && (
        <>
          {/* Diferenças de Estrutura - Tabela */}
          {result.differentTables && result.differentTables.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Diferenças de Estrutura
                </CardTitle>
                <CardDescription>
                  {result.differentTables.length} diferença{result.differentTables.length > 1 ? 's' : ''} encontrada{result.differentTables.length > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b-2">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Tabela</th>
                        <th className="px-4 py-2 text-left font-semibold">Campo</th>
                        <th className="px-4 py-2 text-left font-semibold">Tipo</th>
                        <th className="px-4 py-2 text-center font-semibold bg-green-50">
                          <div className="flex items-center justify-center gap-1">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                            {result.database1}
                          </div>
                        </th>
                        <th className="px-4 py-2 text-center font-semibold bg-blue-50">
                          <div className="flex items-center justify-center gap-1">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            {result.database2}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Agrupar dados por tabela e coluna
                        const groupedData = {}

                        result.differentTables.forEach(item => {
                          const tableName = item.table

                          if (!groupedData[tableName]) {
                            groupedData[tableName] = {
                              bank1: null,
                              bank2: null,
                              columns: {}
                            }
                          }

                          // Identificar em qual banco a tabela existe
                          if (item.database === result.database1) {
                            groupedData[tableName].bank1 = item
                          } else if (item.database === result.database2) {
                            groupedData[tableName].bank2 = item
                          }

                          // Processar colunas
                          if (item.columns) {
                            item.columns.forEach(col => {
                              const colKey = col.name
                              if (!groupedData[tableName].columns[colKey]) {
                                groupedData[tableName].columns[colKey] = {
                                  name: col.name,
                                  bank1Type: null,
                                  bank2Type: null
                                }
                              }

                              if (item.database === result.database1) {
                                groupedData[tableName].columns[colKey].bank1Type = col.type
                              } else if (item.database === result.database2) {
                                groupedData[tableName].columns[colKey].bank2Type = col.type
                              }
                            })
                          }
                        })

                        // Renderizar linhas agrupadas
                        const rows = []
                        Object.keys(groupedData).forEach((tableName, tableIdx) => {
                          const tableData = groupedData[tableName]
                          const columns = Object.values(tableData.columns)
                          const hasColumns = columns.length > 0

                          if (hasColumns) {
                            columns.forEach((col, colIdx) => {
                              const existsInBank1 = col.bank1Type == null
                              const existsInBank2 = col.bank2Type == null
                              const type = col.bank1Type || col.bank2Type

                              rows.push(
                                <tr key={`${tableIdx}-${colIdx}`} className="border-b hover:bg-gray-50">
                                  {colIdx === 0 && (
                                    <td
                                      className="px-4 py-2 font-semibold align-top border-r"
                                      rowSpan={columns.length}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Database className="h-4 w-4" />
                                        {tableName}
                                      </div>
                                    </td>
                                  )}
                                  <td className="px-4 py-2">{col.name}</td>
                                  <td className="px-4 py-2 font-mono text-xs">{type}</td>
                                  <td className={`px-4 py-2 text-center ${existsInBank1 ? 'bg-green-50' : 'bg-red-50'}`}>
                                    {existsInBank1 ? (
                                      <span className="inline-flex items-center gap-1 text-green-700 text-xs">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Sim
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-red-700 text-xs">
                                        <MinusCircle className="h-3 w-3" />
                                        Não
                                      </span>
                                    )}
                                  </td>
                                  <td className={`px-4 py-2 text-center ${existsInBank2 ? 'bg-blue-50' : 'bg-red-50'}`}>
                                    {existsInBank2 ? (
                                      <span className="inline-flex items-center gap-1 text-blue-700 text-xs">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Sim
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-red-700 text-xs">
                                        <MinusCircle className="h-3 w-3" />
                                        Não
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })
                          } else {
                            // Tabela sem colunas (tabela inteira faltando)
                            const existsInBank1 = tableData.bank1 == null
                            const existsInBank2 = tableData.bank2 == null

                            rows.push(
                              <tr key={`${tableIdx}-0`} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2 font-semibold border-r">
                                  <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4" />
                                    {tableName}
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-gray-500 italic" colSpan={2}>
                                  Tabela completa
                                </td>
                                <td className={`px-4 py-2 text-center ${existsInBank1 ? 'bg-green-50' : 'bg-red-50'}`}>
                                  {existsInBank1 ? (
                                    <span className="inline-flex items-center gap-1 text-green-700 text-xs">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Sim
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-red-700 text-xs">
                                      <MinusCircle className="h-3 w-3" />
                                      Não
                                    </span>
                                  )}
                                </td>
                                <td className={`px-4 py-2 text-center ${existsInBank2 ? 'bg-blue-50' : 'bg-red-50'}`}>
                                  {existsInBank2 ? (
                                    <span className="inline-flex items-center gap-1 text-blue-700 text-xs">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Sim
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-red-700 text-xs">
                                      <MinusCircle className="h-3 w-3" />
                                      Não
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          }
                        })

                        return rows
                      })()}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Diferenças de Registros - Tabela */}
          {result.differentRegisters && result.differentRegisters.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Diferenças de Quantidade de Registros
                </CardTitle>
                <CardDescription>
                  Tabelas com quantidade diferente de registros entre os bancos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b-2">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Tabela</th>
                        <th className="px-4 py-3 text-right font-semibold bg-green-50">
                          <div className="flex items-center justify-end gap-2">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                            {result.database1}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-right font-semibold bg-blue-50">
                          <div className="flex items-center justify-end gap-2">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            {result.database2}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">Diferença</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.differentRegisters.map((reg, idx) => {
                        const diff = reg.totalRegisters1 - reg.totalRegisters2
                        const absDiff = Math.abs(diff)

                        return (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{reg.table}</td>
                            <td className="px-4 py-3 text-right bg-green-50/30 font-semibold">
                              {reg.totalRegisters1.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right bg-blue-50/30 font-semibold">
                              {reg.totalRegisters2.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                diff > 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
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
          {(!result.differentTables || result.differentTables.length === 0) &&
           (!result.differentRegisters || result.differentRegisters.length === 0) && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Bancos Idênticos</AlertTitle>
              <AlertDescription>
                Os bancos de dados possuem a mesma estrutura e quantidade de registros.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}

export const Route = createFileRoute('/compare-database')({
  component: CompareDatabasePage,
})
