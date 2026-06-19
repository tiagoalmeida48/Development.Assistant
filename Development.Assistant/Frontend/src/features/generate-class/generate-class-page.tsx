import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Stack,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Storage as DatabaseIcon,
  Code as CodeIcon,
  CheckCircle as CheckCircleIcon,
  Clear as ClearIcon,
  Layers as LayersIcon,
  Search as SearchIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Download as DownloadIcon,
  FolderZip as FolderZipIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  useGetAllTables,
  useCreateClass,
} from "./use-code-generator";
import { InputSelect } from "@/shared/components/input-select";
import { InputWithHistory } from "@/shared/components/input-with-history";
import { useTemplates, useDatabaseTypes } from "@/shared/hooks/use-metadata";

// Camadas geradas por template — os grupos espelham os níveis arquiteturais
// que antes apareciam como prefixos "1 -", "2 -" nos caminhos de saída.
const dddLayers = [
  { name: "API", paths: ["Api/Controllers"] },
  { name: "Aplicação", paths: ["App/Dto", "App/Interfaces", "App/Services"] },
  { name: "Domínio", paths: ["Domain/Interfaces", "Domain/Models", "Domain/Services"] },
  { name: "Infraestrutura", paths: ["Repository"] },
] as const;

const cleanLayers = [
  { name: "Domínio", paths: ["Domain/Entities", "Domain/Interfaces Repositories"] },
  { name: "Aplicação", paths: ["Application/Interfaces Services", "Application/Services", "Application/Records"] },
  { name: "Infraestrutura", paths: ["Infra/Repositories", "Infra/Models"] },
  { name: "API", paths: ["Api/Controllers", "Api/GraphQl"] },
] as const;

export default function GenerateClassPage() {
  const [connectionString, setConnectionString] = useState("");
  const [dbType, setDbType] = useState("");
  const [template, setTemplate] = useState("");
  const [projectName, setProjectName] = useState("");
  const [nameSpace, setNameSpace] = useState("");
  const [excludePrefixTable, setExcludePrefixTable] = useState("");
  const [checkedTables, setCheckedTables] = useState<Set<string>>(new Set());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchTable, setSearchTable] = useState("");
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [generatedFilename, setGeneratedFilename] = useState<string>("");

  const getAllTablesMutation = useGetAllTables();
  const createClassMutation = useCreateClass();
  const {
    data: templates,
    isLoading: isLoadingTemplates,
    error: isErrorTemplates,
  } = useTemplates();
  const {
    data: databaseTypes,
    isLoading: isLoadingDatabaseTypes,
    error: isErrorDatabaseTypes,
  } = useDatabaseTypes();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (databaseTypes && databaseTypes.length > 0 && !dbType) {
      setDbType(databaseTypes[0].id);
    }
  }, [databaseTypes]);

  useEffect(() => {
    if (templates && templates.length > 0 && !template) {
      setTemplate(templates[0].id);
    }
  }, [templates]);

  const availableTables = getAllTablesMutation.data;

  const filteredTables = availableTables
    ? [...availableTables]
        .filter((table) =>
          table.toLowerCase().includes(searchTable.toLowerCase())
        )
        .sort((a, b) => a.localeCompare(b))
    : [];

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
    if (!connectionString) {
      enqueueSnackbar("Preencha a string de conexão", { variant: "error" });
      return;
    }

    try {
      await getAllTablesMutation.mutate({
        connectionString,
        dbType: dbType,
      });
      setCheckedTables(new Set());
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : "Erro ao carregar tabelas",
        { variant: "error" }
      );
    }
  };

  const handleGenerate = async () => {
    if (
      !connectionString ||
      !projectName ||
      !nameSpace ||
      checkedTables.size === 0
    ) {
      enqueueSnackbar(
        "Preencha todos os campos e selecione pelo menos uma tabela",
        {
          variant: "error",
        }
      );
      return;
    }

    try {
      const result = await createClassMutation.mutate({
        connectionString,
        dbType: dbType,
        template: template,
        tables: Array.from(checkedTables),
        projectName,
        nameSpace,
        excludePrefixTable,
      });
      setGeneratedBlob(result.blob);
      setGeneratedFilename(result.filename);
      setShowSuccessModal(true);
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : "Erro ao gerar classes",
        { variant: "error" }
      );
    }
  };

  const handleDownload = () => {
    if (!generatedBlob) {
      enqueueSnackbar("Nenhum arquivo para baixar", { variant: "error" });
      return;
    }

    try {
      const url = window.URL.createObjectURL(generatedBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = generatedFilename || `${projectName || "classes"}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setShowSuccessModal(false);
    } catch (err) {
      enqueueSnackbar("Erro ao fazer download", { variant: "error" });
    }
  };

  const handleReset = () => {
    setConnectionString("");
    setProjectName("");
    setNameSpace("");
    setExcludePrefixTable("");
    setCheckedTables(new Set());
    setSearchTable("");
  };

  const getVerticalOrderedTables = (tables: string[], columns: number) => {
    if (tables.length === 0) return [];

    const rows = Math.ceil(tables.length / columns);
    const result: string[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const index = col * rows + row;
        if (index < tables.length) {
          result.push(tables[index]);
        }
      }
    }

    return result;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gerar Classes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gere as camadas C# a partir do schema e baixe o .zip — sem manter
          arquivos no servidor.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            alignItems: "stretch",
          }}
        >
          <Card sx={{ mb: 3, minHeight: 355 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "200px 1fr" },
                    gap: 2,
                  }}
                >
                  <InputSelect
                    value={dbType}
                    onChange={setDbType}
                    label="Tipo de Banco"
                    options={databaseTypes}
                    isLoading={isLoadingDatabaseTypes}
                    error={!!isErrorDatabaseTypes}
                    errorMessage="Erro ao carregar tipos de banco"
                  />

                  <InputWithHistory
                    value={connectionString}
                    onChange={setConnectionString}
                    inputName="connString"
                    databaseType={dbType}
                    textFieldProps={{
                      fullWidth: true,
                      label: "Connection String",
                      placeholder: "Server=localhost;Database=mydb;",
                      disabled: getAllTablesMutation.isLoading,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "200px 1fr" },
                    gap: 2,
                  }}
                >
                  <InputSelect
                    value={template}
                    onChange={setTemplate}
                    label="Template"
                    options={templates}
                    isLoading={isLoadingTemplates}
                    error={!!isErrorTemplates}
                    errorMessage="Erro ao carregar templates"
                    selectProps={{ sx: { width: 200 } }}
                  />

                  <InputWithHistory
                    value={projectName}
                    onChange={setProjectName}
                    inputName="projectName"
                    textFieldProps={{
                      fullWidth: true,
                      label: "Projeto",
                      placeholder: "MyProject",
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 2,
                  }}
                >
                  <InputWithHistory
                    value={nameSpace}
                    onChange={setNameSpace}
                    inputName="nameSpace"
                    textFieldProps={{
                      fullWidth: true,
                      label: "Último nome do namespace",
                      placeholder: ".Core",
                    }}
                  />

                  <InputWithHistory
                    value={excludePrefixTable}
                    onChange={setExcludePrefixTable}
                    inputName="excludePrefixTable"
                    textFieldProps={{
                      fullWidth: true,
                      label: "Excluir Prefixo das tabelas",
                      placeholder: "base_",
                    }}
                  />
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleLoadTables}
                  disabled={getAllTablesMutation.isLoading}
                  startIcon={
                    getAllTablesMutation.isLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <DatabaseIcon />
                    )
                  }
                >
                  {getAllTablesMutation.isLoading
                    ? "Carregando..."
                    : "Carregar Tabelas"}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              width: "100%",
              minHeight: 355,
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <LayersIcon sx={{ color: "primary.main" }} />
                <Typography variant="h6">
                  {template === "DDD" ? "Estrutura DDD" : "Clean Architecture"}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Camadas geradas para cada tabela selecionada.
              </Typography>

              <Stack spacing={2}>
                {(template === "DDD" ? dddLayers : cleanLayers).map((layer) => (
                  <Box key={layer.name}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 0.75 }}
                    >
                      {layer.name}
                    </Typography>
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      sx={{ gap: 0.75 }}
                    >
                      {layer.paths.map((path) => (
                        <Box
                          key={path}
                          component="code"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.8125rem",
                            color: "text.secondary",
                            px: 1,
                            py: 0.375,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "action.hover",
                          }}
                        >
                          {path}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
        <Card>
          <CardContent sx={{ p: 3 }}>
            {availableTables && availableTables.length > 0 ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 3,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="Buscar tabelas..."
                    value={searchTable}
                    onChange={(e) => setSearchTable(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleSelectAll}
                      disabled={
                        !availableTables ||
                        checkedTables.size === availableTables.length
                      }
                      startIcon={<CheckBoxIcon />}
                    >
                      Todas
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleClearAll}
                      disabled={checkedTables.size === 0}
                      startIcon={<CheckBoxOutlineBlankIcon />}
                    >
                      Limpar
                    </Button>
                  </Box>
                </Box>

                {filteredTables.length > 0 ? (
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "action.hover",
                      mb: 2,
                      maxHeight: 400,
                      overflow: "auto",
                      "&::-webkit-scrollbar": {
                        width: 8,
                      },
                      "&::-webkit-scrollbar-track": {
                        bgcolor: "transparent",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        bgcolor: "divider",
                        borderRadius: 4,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "1fr 1fr",
                          md: "repeat(4, 1fr)",
                        },
                        gap: 1,
                      }}
                    >
                      {getVerticalOrderedTables(filteredTables, 4).map(
                        (table) => (
                          <FormControlLabel
                            key={table}
                            control={
                              <Checkbox
                                checked={checkedTables.has(table)}
                                onChange={() => handleTableToggle(table)}
                                size="small"
                              />
                            }
                            label={
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "monospace",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {table}
                              </Typography>
                            }
                            sx={{
                              m: 0,
                              py: 0.5,
                              px: 1,
                              borderRadius: 1,
                              bgcolor: checkedTables.has(table)
                                ? "primary.lighter"
                                : "transparent",
                              transition: "background-color 0.2s ease",
                              "&:hover": {
                                bgcolor: checkedTables.has(table)
                                  ? "primary.light"
                                  : "action.hover",
                              },
                            }}
                          />
                        )
                      )}
                    </Box>
                  </Paper>
                ) : (
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma tabela encontrada com o termo "{searchTable}"
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 2,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {checkedTables.size > 0 && (
                    <Chip
                      icon={<DatabaseIcon />}
                      label={`${checkedTables.size} de ${
                        availableTables.length
                      } tabela${checkedTables.size > 1 ? "s" : ""} selecionada${
                        checkedTables.size > 1 ? "s" : ""
                      }`}
                      color="primary"
                      variant="filled"
                    />
                  )}
                  {searchTable && (
                    <Chip
                      icon={<SearchIcon />}
                      label={`${filteredTables.length} resultado${
                        filteredTables.length !== 1 ? "s" : ""
                      }`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleGenerate}
                    disabled={createClassMutation.isLoading}
                    startIcon={
                      createClassMutation.isLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <CodeIcon />
                      )
                    }
                  >
                    {createClassMutation.isLoading ? "Gerando..." : "Gerar"}
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleReset}
                    startIcon={<ClearIcon />}
                  >
                    Limpar
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="body2" color="text.secondary">
                  Carregue as tabelas do banco de dados para começar
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      <Dialog
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <CheckCircleIcon color="success" />
          Classes geradas
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {checkedTables.size} tabela{checkedTables.size > 1 ? "s" : ""} no
            template {template === "DDD" ? "DDD" : "Clean Architecture"}.
            Pronto para baixar.
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1.5,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <FolderZipIcon fontSize="small" sx={{ color: "primary.main" }} />
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
            >
              {generatedFilename || `${projectName || "classes"}.zip`}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1.5 }}>
          <Button onClick={() => setShowSuccessModal(false)}>Fechar</Button>
          <Button
            variant="contained"
            onClick={handleDownload}
            startIcon={<DownloadIcon />}
          >
            Baixar .zip
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
