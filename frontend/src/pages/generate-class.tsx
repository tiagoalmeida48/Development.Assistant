import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { validateFields } from '@/utils'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Checkbox } from '@/components/ui'
import { CheckCircle2, Settings, Loader2, Database, FolderOpen, CheckSquare, Square } from 'lucide-react'

export default function GenerateClassPage() {
  const [connectionString, setConnectionString] = useState('')
  const [dbType, setDbType] = useState('MySQL')
  const [pathGeral, setPathGeral] = useState('')
  const [projectName, setProjectName] = useState('')
  const [nameSpace, setNameSpace] = useState('')
  const [selectedTables, setSelectedTables] = useState('')
  const [checkedTables, setCheckedTables] = useState<Set<string>>(new Set())

  const { loading: loadingTables, data: availableTables, execute: executeFetchTables } = useAsyncAction<string[]>()
  const { loading: generating, success: generateSuccess, execute: executeGenerate, reset: resetGenerate } = useAsyncAction()

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
    if (availableTables) {
      setCheckedTables(new Set(availableTables))
    }
  }

  const handleClearAll = () => {
    setCheckedTables(new Set())
  }

  const handleLoadTables = async () => {
    if (!validateFields({ connectionString }, 'Preencha a string de conexão')) {
      return
    }

    await executeFetchTables(() => api.codeGenerator.getAllTables(connectionString, dbType))
    setCheckedTables(new Set())
  }

  const handleGenerate = async () => {
    if (!validateFields({ connectionString, pathGeral, projectName, nameSpace, selectedTables })) {
      return
    }

    const tables = selectedTables
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    if (tables.length === 0) {
      toast.error('Informe pelo menos uma tabela')
      return
    }

    await executeGenerate(async () => {
      await api.codeGenerator.createClass({
        connectionString,
        dbType,
        tables,
        pathGeral,
        projectName,
        nameSpace,
      })
      toast.success('Classes geradas com sucesso!', {
        description: 'As classes POCO e camadas foram geradas no diretório especificado.'
      })
    })
  }

  const handleReset = () => {
    setConnectionString('')
    setPathGeral('')
    setProjectName('')
    setNameSpace('')
    setSelectedTables('')
    setCheckedTables(new Set())
    resetGenerate()
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Gerar Classes</h1>
      </div>

      <div className="space-y-4">
        {/* Card único de Conexão e Configuração */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              Configuração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-4">
              <div className="space-y-2 col-span-1">
                <Label htmlFor="dbType" className="text-sm font-medium">Tipo de Banco</Label>
                <select
                  id="dbType"
                  value={dbType}
                  onChange={(e) => setDbType(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="0">MySQL</option>
                  <option value="1">Oracle</option>
                  <option value="2">PostgreSQL</option>
                  <option value="3">SQL Server</option>
                </select>
              </div>

              <div className="space-y-2 col-span-3">
                <Label htmlFor="connString" className="text-sm font-medium">Connection String</Label>
                <Input
                  id="connString"
                  placeholder="Server=localhost;Database=mydb;User=user;Password=pass;"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="pathGeral" className="flex items-center gap-1.5 text-sm font-medium">
                  <FolderOpen className="h-4 w-4" />
                  Caminho
                </Label>
                <Input
                  id="pathGeral"
                  placeholder="C:\Projects\Output"
                  value={pathGeral}
                  onChange={(e) => setPathGeral(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-2 col-span-1">
                <Label htmlFor="projectName" className="text-sm font-medium">
                  Projeto
                </Label>
                <Input
                  id="projectName"
                  placeholder="MyProject"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-2 col-span-1">
                <Label htmlFor="nameSpace" className="text-sm font-medium">
                  Namespace
                </Label>
                <Input
                  id="nameSpace"
                  placeholder=".Core"
                  value={nameSpace}
                  onChange={(e) => setNameSpace(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            <Button
              onClick={handleLoadTables}
              disabled={loadingTables}
              className="w-full h-10"
              variant="outline"
            >
              {loadingTables ? (
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
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              Tabelas {availableTables && `(${availableTables.length})`}
            </CardTitle>
            <CardDescription className="text-sm">
              {checkedTables.size > 0 && (
                <span className="text-primary font-semibold">
                  ✓ {checkedTables.size} selecionada{checkedTables.size > 1 ? 's' : ''}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableTables && availableTables.length > 0 ? (
              <>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={!availableTables || checkedTables.size === availableTables.length}
                    className="flex-1 h-9"
                  >
                    <CheckSquare className="h-4 w-4 mr-1.5" />
                    Todas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    disabled={checkedTables.size === 0}
                    className="flex-1 h-9"
                  >
                    <Square className="h-4 w-4 mr-1.5" />
                    Limpar
                  </Button>
                </div>

                <div className="bg-gradient-to-br from-muted/50 to-muted border rounded-lg p-3">
                  <div className="columns-2 lg:columns-3 xl:columns-4 gap-2 space-y-2">
                    {[...availableTables].sort((a, b) => a.localeCompare(b)).map((table, idx) => (
                      <button
                        type="button"
                        key={idx}
                        className={`
                          w-full flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 break-inside-avoid
                          ${checkedTables.has(table)
                            ? 'bg-primary text-primary-foreground border-primary shadow-md transform scale-[1.02]'
                            : 'bg-card border-border hover:border-primary/50 hover:bg-accent hover:shadow-sm active:scale-[0.98]'
                          }
                        `}
                        onClick={() => handleTableToggle(table)}
                      >
                        <Checkbox
                          id={`table-${idx}`}
                          checked={checkedTables.has(table)}
                          className={`flex-shrink-0 pointer-events-none h-4 w-4 ${checkedTables.has(table) ? 'border-primary-foreground' : ''}`}
                        />
                        <span
                          className={`flex-1 font-mono text-xs font-medium select-none text-left truncate`}
                          title={table}
                        >
                          {table}
                        </span>
                        {checkedTables.has(table) && (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 animate-in zoom-in duration-200" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Carregue as tabelas do banco de dados para começar
              </div>
            )}
            
            {checkedTables.size > 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg p-3">
                <Database className="h-4 w-4 text-primary flex-shrink-0" />
                <p>
                    <span className="font-semibold text-primary">
                      {checkedTables.size} tabela{checkedTables.size > 1 ? 's' : ''} selecionada{checkedTables.size > 1 ? 's' : ''}
                    </span>
                </p>
              </div>
            ) : null }
            
            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 h-10"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Gerar
                  </>
                )}
              </Button>

              {generateSuccess && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="h-10"
                >
                  Limpar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
