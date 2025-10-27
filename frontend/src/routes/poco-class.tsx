// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { graphqlClient, graphqlQueries, graphqlMutations } from '@/api/graphql-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Settings, Loader2, Database, FolderOpen, CheckSquare, Square } from 'lucide-react'

function PocoClassPage() {
  const [connectionString, setConnectionString] = useState('')
  const [dbType, setDbType] = useState('SQL_SERVER')
  const [pathGeral, setPathGeral] = useState('')
  const [projectName, setProjectName] = useState('')
  const [nameSpace, setNameSpace] = useState('')
  const [selectedTables, setSelectedTables] = useState('')
  const [availableTables, setAvailableTables] = useState<string[]>([])
  const [checkedTables, setCheckedTables] = useState<Set<string>>(new Set())

  const tablesMutation = useMutation({
    mutationFn: async (variables) => {
      console.log('🔍 Carregando tabelas...', variables)
      const response = await graphqlClient.request(graphqlQueries.getTables, variables)
      console.log('✅ Resposta da API:', response)
      return response
    },
    onSuccess: (data) => {
      console.log('📊 Tabelas recebidas:', data.tables)
      setAvailableTables(data.tables || [])
      setCheckedTables(new Set())
    },
    onError: (error) => {
      console.error('❌ Erro ao carregar tabelas:', error)
    },
  })

  // Atualiza o campo de texto quando as tabelas selecionadas mudam
  useEffect(() => {
    setSelectedTables(Array.from(checkedTables).join(', '))
  }, [checkedTables])

  const handleTableToggle = (table: string) => {
    const newChecked = new Set(checkedTables)
    if (newChecked.has(table)) {
      newChecked.delete(table)
    } else {
      newChecked.add(table)
    }
    setCheckedTables(newChecked)
  }

  const handleSelectAll = () => {
    setCheckedTables(new Set(availableTables))
  }

  const handleClearAll = () => {
    setCheckedTables(new Set())
  }

  const generateMutation = useMutation({
    mutationFn: async (variables) => {
      return await graphqlClient.request(graphqlMutations.createPocoClass, variables)
    },
  })

  const handleLoadTables = () => {
    if (!connectionString) {
      alert('Preencha a string de conexão')
      return
    }

    tablesMutation.mutate({
      connectionString,
      dbType,
    })
  }

  const handleGenerate = () => {
    if (!connectionString || !pathGeral || !projectName || !nameSpace || !selectedTables) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const tables = selectedTables
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    if (tables.length === 0) {
      alert('Informe pelo menos uma tabela')
      return
    }

    generateMutation.mutate({
      input: {
        connectionString,
        dbType,
        tables,
        pathGeral,
        projectName,
        nameSpace,
      },
    })
  }

  const handleReset = () => {
    setConnectionString('')
    setPathGeral('')
    setProjectName('')
    setNameSpace('')
    setSelectedTables('')
    setAvailableTables([])
    setCheckedTables(new Set())
    tablesMutation.reset()
    generateMutation.reset()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gerar Classes POCO</h1>
        <p className="text-gray-600">
          Gere classes POCO e camadas completas de arquitetura a partir de tabelas do banco
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Conexão com Banco de Dados
              </CardTitle>
              <CardDescription>
                Configure a conexão e carregue as tabelas disponíveis
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
                    <SelectItem value="SQL_SERVER">SQL Server</SelectItem>
                    <SelectItem value="MY_SQL">MySQL</SelectItem>
                    <SelectItem value="ORACLE">Oracle</SelectItem>
                    <SelectItem value="POSTGRE_SQL">PostgreSQL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="connString">Connection String</Label>
                <Input
                  id="connString"
                  placeholder="Server=localhost;Database=mydb;User=user;Password=pass;"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                />
              </div>

              <Button
                onClick={handleLoadTables}
                disabled={tablesMutation.isPending}
                className="w-full"
                variant="outline"
              >
                {tablesMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando Tabelas...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Carregar Tabelas
                  </>
                )}
              </Button>

              {tablesMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro ao Carregar Tabelas</AlertTitle>
                  <AlertDescription>
                    {tablesMutation.error?.response?.errors?.[0]?.message ||
                     tablesMutation.error?.message ||
                     'Verifique a connection string e se o banco de dados está acessível.'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuração de Geração
              </CardTitle>
              <CardDescription>
                Configure os detalhes para geração das classes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pathGeral" className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Caminho de Saída
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="pathGeral"
                  placeholder="C:\Projects\Output"
                  value={pathGeral}
                  onChange={(e) => setPathGeral(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Diretório onde os arquivos serão gerados
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="projectName">
                    Nome do Projeto
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    placeholder="MyProject"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameSpace">
                    Namespace
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="nameSpace"
                    placeholder=".Core"
                    value={nameSpace}
                    onChange={(e) => setNameSpace(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="flex-1"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando Classes...
                    </>
                  ) : (
                    <>
                      <Settings className="mr-2 h-4 w-4" />
                      Gerar Classes POCO
                    </>
                  )}
                </Button>

                {generateMutation.isSuccess && (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {generateMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro na Geração</AlertTitle>
              <AlertDescription>
                {generateMutation.error?.message || 'Ocorreu um erro ao gerar as classes'}
              </AlertDescription>
            </Alert>
          )}

          {generateMutation.isSuccess && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Classes Geradas com Sucesso!</AlertTitle>
              <AlertDescription>
                {generateMutation.data?.createPocoClass?.message || 'As classes POCO e camadas foram geradas no diretório especificado.'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Coluna 2: Lista de Tabelas */}
        <div>
          {availableTables.length > 0 && (
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Tabelas Disponíveis ({availableTables.length})
                </CardTitle>
                <CardDescription>
                  {checkedTables.size > 0 && (
                    <span className="text-blue-600 font-semibold">
                      ✓ {checkedTables.size} selecionada{checkedTables.size > 1 ? 's' : ''}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={checkedTables.size === availableTables.length}
                    className="flex-1"
                  >
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Todas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    disabled={checkedTables.size === 0}
                    className="flex-1"
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                  <div className="grid grid-cols-1 gap-2">
                    {availableTables.map((table, idx) => (
                      <div
                        key={idx}
                        className={`
                          flex items-center gap-2.5 px-3 py-2.5 rounded-md border-2 transition-all duration-200 cursor-pointer
                          ${checkedTables.has(table)
                            ? 'bg-blue-50 border-blue-500 shadow-md scale-[1.02]'
                            : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-sm hover:scale-[1.01]'
                          }
                        `}
                        onClick={() => handleTableToggle(table)}
                      >
                        <Checkbox
                          id={`table-${idx}`}
                          checked={checkedTables.has(table)}
                          onCheckedChange={() => handleTableToggle(table)}
                          className="flex-shrink-0"
                        />
                        <label
                          htmlFor={`table-${idx}`}
                          className="flex-1 font-mono text-sm font-medium cursor-pointer select-none truncate"
                          title={table}
                        >
                          {table}
                        </label>
                        {checkedTables.has(table) && (
                          <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 animate-in zoom-in duration-200" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <Database className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <p>
                    {checkedTables.size > 0 ? (
                      <span className="font-semibold text-blue-700">
                        {checkedTables.size} tabela{checkedTables.size > 1 ? 's' : ''} será{checkedTables.size > 1 ? 'ão' : ''} gerada{checkedTables.size > 1 ? 's' : ''}
                      </span>
                    ) : (
                      'Clique nas tabelas para selecioná-las'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna 3: Informações */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg">O que será gerado?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">📁 Estrutura de Pastas:</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>1 - Api/Controllers</li>
                    <li>2 - App/Dto</li>
                    <li>2 - App/Interfaces</li>
                    <li>2 - App/Services</li>
                    <li>3 - Domain/Interfaces/Repository</li>
                    <li>3 - Domain/Interfaces/Services</li>
                    <li>3 - Domain/Models</li>
                    <li>3 - Domain/Services</li>
                    <li>4 - Repository</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">⚙️ Por Tabela:</h4>
                  <ul className="space-y-1 text-gray-600 ml-4">
                    <li>✓ Controller (API)</li>
                    <li>✓ DTO (App layer)</li>
                    <li>✓ Interfaces de App</li>
                    <li>✓ Interfaces de Domain</li>
                    <li>✓ Models de Domain</li>
                    <li>✓ Services (App e Domain)</li>
                    <li>✓ Repository</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-4">
                  <p className="text-xs text-purple-800">
                    <strong>Arquitetura em Camadas:</strong> Todas as classes seguem
                    os princípios de Clean Architecture com separação de responsabilidades.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/poco-class')({
  component: PocoClassPage,
})
