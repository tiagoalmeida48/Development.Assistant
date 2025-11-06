import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/api";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { validateFields } from "@/utils";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { InputWithHistory, type InputWithHistoryRef } from "@/components/ui/input-with-history";
import { ScrollToTop } from "@/components/ScrollToTop";
import {
  CheckCircle2,
  Settings,
  Loader2,
  Database,
  FolderOpen,
  CheckSquare,
  Square,
  FileCode,
  Layers,
  Copy,
} from "lucide-react";

export default function GenerateClassPage() {
  const [connectionString, setConnectionString] = useState("");
  const [dbType, setDbType] = useLocalStorage("gen-db-type", "0");
  const [template, setTemplate] = useLocalStorage("gen-template", "0");
  const [pathGeral, setPathGeral] = useState("");
  const [projectName, setProjectName] = useState("");
  const [nameSpace, setNameSpace] = useState("");
  const [excludePrefixTable, setExcludePrefixTable] = useState("");
  const [selectedTables, setSelectedTables] = useState("");
  const [checkedTables, setCheckedTables] = useState<Set<string>>(new Set());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedPath, setGeneratedPath] = useState("");

  const connStringRef = useRef<InputWithHistoryRef>(null);
  const pathGeralRef = useRef<InputWithHistoryRef>(null);
  const projectNameRef = useRef<InputWithHistoryRef>(null);
  const nameSpaceRef = useRef<InputWithHistoryRef>(null);
  const excludePrefixRef = useRef<InputWithHistoryRef>(null);

  const {
    loading: loadingTables,
    data: availableTables,
    execute: executeFetchTables,
  } = useAsyncAction<string[]>();
  const {
    loading: generating,
    success: generateSuccess,
    execute: executeGenerate,
    reset: resetGenerate,
  } = useAsyncAction();

  useEffect(() => {
    setSelectedTables(Array.from(checkedTables).join(", "));
  }, [checkedTables]);

  const handleTableToggle = (table: string) => {
    const newChecked = new Set(checkedTables);
    if (newChecked.has(table)) {
      newChecked.delete(table);
    } else {
      newChecked.add(table);
    }
    setCheckedTables(newChecked);
  };

  const handleSelectAll = () => {
    if (availableTables) {
      setCheckedTables(new Set(availableTables));
    }
  };

  const handleClearAll = () => {
    setCheckedTables(new Set());
  };

  const handleLoadTables = async () => {
    if (!validateFields({ connectionString }, "Preencha a string de conexão")) {
      return;
    }

    await executeFetchTables(() =>
      api.codeGenerator.getAllTables(connectionString, parseInt(dbType)),
    );
    setCheckedTables(new Set());
  };

  const handleGenerate = async () => {
    if (
      !validateFields({
        connectionString,
        pathGeral,
        projectName,
        nameSpace,
        selectedTables,
      })
    ) {
      return;
    }

    const tables = selectedTables
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tables.length === 0) {
      toast.error("Informe pelo menos uma tabela");
      return;
    }

    await executeGenerate(async () => {
      await api.codeGenerator.createClass({
        connectionString,
        dbType: parseInt(dbType),
        template: parseInt(template),
        tables,
        pathGeral,
        projectName,
        nameSpace,
        excludePrefixTable
      });

      // Salva o caminho e mostra o modal
      setGeneratedPath(pathGeral);
      setShowSuccessModal(true);

      toast.success("Classes geradas com sucesso!", {
        description:
          "As classes e camadas foram geradas no diretório especificado.",
      });
    });
  };

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(generatedPath);
      toast.success("Caminho copiado!", {
        description: "Cole no explorador de arquivos"
      });
      // Fecha o modal após copiar
      setShowSuccessModal(false);
    } catch (err) {
      toast.error("Erro ao copiar", {
        description: "Não foi possível copiar o caminho para a área de transferência"
      });
    }
  };

  const handleReset = () => {
    setConnectionString("");
    setPathGeral("");
    setProjectName("");
    setNameSpace("");
    setExcludePrefixTable("");
    setSelectedTables("");
    setCheckedTables(new Set());
    resetGenerate();
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl text-secondary-foreground font-bold mb-2">Gerar Classes</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Card de Configuração */}
          <Card className="shadow-sm hover:shadow-md border-border transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Configuração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 grid-cols-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="dbType" className="text-sm font-medium">
                    Tipo de Banco
                  </Label>
                  <select
                    id="dbType"
                    value={dbType}
                    onChange={(e) => setDbType(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-input text-foreground px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="0">MariaDb</option>
                    <option value="1">Oracle</option>
                    <option value="2">PostgreSQL</option>
                    <option value="3">SQL Server</option>
                  </select>
                </div>

                <div className="space-y-2 col-span-2 w-full">
                  <Label htmlFor="connString" className="text-sm font-medium">
                    Connection String
                  </Label>
                  <InputWithHistory
                    ref={connStringRef}
                    id="connString"
                    placeholder="Server=localhost;Database=mydb;User=user;Password=pass;"
                    value={connectionString}
                    onValueChange={setConnectionString}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label
                    htmlFor="pathGeral"
                    className="flex items-center gap-1.5 text-sm font-medium"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Caminho
                  </Label>
                  <div className="flex gap-2">
                    <InputWithHistory
                      ref={pathGeralRef}
                      id="pathGeral"
                      placeholder="C:\Projects\Output"
                      value={pathGeral}
                      onValueChange={setPathGeral}
                      className="h-10 flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template" className="text-sm font-medium">
                    Template
                  </Label>
                  <select
                      id="template"
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-input text-foreground px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="0">DDD</option>
                    <option value="1">Arquitetura Limpa</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-sm font-medium">
                    Projeto
                  </Label>
                  <InputWithHistory
                    ref={projectNameRef}
                    id="projectName"
                    placeholder="MyProject"
                    value={projectName}
                    onValueChange={setProjectName}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameSpace" className="text-sm font-medium">
                    Ultimo nome do namespace
                  </Label>
                  <InputWithHistory
                    ref={nameSpaceRef}
                    id="nameSpace"
                    placeholder=".Core"
                    value={nameSpace}
                    onValueChange={setNameSpace}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excludePrefixTable" className="text-sm font-medium">
                    Excluir prefixo das tabelas
                  </Label>
                  <InputWithHistory
                    ref={excludePrefixRef}
                    id="excludePrefixTable"
                    placeholder="Base"
                    value={excludePrefixTable}
                    onValueChange={setExcludePrefixTable}
                    className="h-10"
                  />
                </div>

                <div className="sm:col-span-3">
                  <Button
                    onClick={handleLoadTables}
                    disabled={loadingTables}
                    className="w-full h-10"
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Tabelas */}
          <Card className="shadow-sm border-border">
            <CardContent className="space-y-3 mt-5">
              {availableTables && availableTables.length > 0 ? (
                <>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      disabled={
                        !availableTables ||
                        checkedTables.size === availableTables.length
                      }
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
                    <div className="columns-1 sm:columns-2 gap-2 space-y-2">
                      {[...availableTables]
                        .sort((a, b) => a.localeCompare(b))
                        .map((table, idx) => (
                          <button
                            type="button"
                            key={idx}
                            className={`
                          w-full flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 break-inside-avoid
                          ${
                            checkedTables.has(table)
                              ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-[1.02]"
                              : "bg-card border-border hover:border-primary/50 hover:bg-accent hover:shadow-sm active:scale-[0.98]"
                          }
                        `}
                            onClick={() => handleTableToggle(table)}
                          >
                            <Checkbox
                              id={`table-${idx}`}
                              checked={checkedTables.has(table)}
                              className={`flex-shrink-0 pointer-events-none h-4 w-4 ${checkedTables.has(table) ? "border-primary-foreground" : ""}`}
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
                  <Database className="h-4 w-4 text-secondary-foreground flex-shrink-0" />
                  <p>
                    <span className="font-semibold text-secondary-foreground">
                      {checkedTables.size} tabela
                      {checkedTables.size > 1 ? "s" : ""} selecionada
                      {checkedTables.size > 1 ? "s" : ""}
                    </span>
                  </p>
                </div>
              ) : null}

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

        <div>
          <Card className="shadow-sm h-full border-border w-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5" />
                Estrutura de Classes DDD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                {/* Presentation Layer */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>1 - Api/Controllers</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>2 - App/Dto</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>2 - App/Interfaces</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>2 - App/Services</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>3 - Domain/Interfaces</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>3 - Domain/Models</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>3 - Domain/Services</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>4 - Repository</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-5 w-5" />
                Estrutura de Classes Arquitetura Limpa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                {/* Presentation Layer */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>1 - Domain/Entities</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>1 - Domain/Interfaces Repositories</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>2 - Application/Interfaces Services</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>2 - Application/Services</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>2 - Application/Records</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>3 - Infra/Repositories</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>3 - Infra/Models</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>4 - Api/Controllers</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>4 - Api/GraphQl</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Sucesso */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <DialogTitle className="text-xl text-secondary-foreground">Classes Geradas com Sucesso!</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-2">
            <div className="p-4 bg-muted/30 dark:bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <FolderOpen className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1 text-secondary-foreground">Localização dos arquivos:</p>
                  <p className="text-sm text-muted-foreground break-all font-mono px-2 py-1 rounded border border-border/50">
                    {generatedPath}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Button
                onClick={handleCopyPath}
                className="w-full"
                variant="default"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Caminho
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Botão Voltar ao Topo */}
      <ScrollToTop />
    </div>
  );
}
