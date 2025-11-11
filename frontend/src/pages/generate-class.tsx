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
  FolderOpen as FolderIcon,
  CheckCircle as CheckCircleIcon,
  ContentCopy as CopyIcon,
  Clear as ClearIcon,
  Layers as LayersIcon,
  Search as SearchIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  useGetAllTables,
  useCreateClass,
} from "@/hooks/queries/useCodeGenerator";
import { InputSelect } from "@/components/InputSelect";
import { InputWithHistory } from "@/components/InputWithHistory";
import { useTemplates, useDatabaseTypes } from "@/hooks/queries/useMetadata";

export default function GenerateClassPage() {
  const [connectionString, setConnectionString] = useState("");
  const [dbType, setDbType] = useState("");
  const [template, setTemplate] = useState("");
  const [pathGeral, setPathGeral] = useState("");
  const [projectName, setProjectName] = useState("");
  const [nameSpace, setNameSpace] = useState("");
  const [excludePrefixTable, setExcludePrefixTable] = useState("");
  const [checkedTables, setCheckedTables] = useState<Set<string>>(new Set());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedPath, setGeneratedPath] = useState("");
  const [searchTable, setSearchTable] = useState("");

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
  }, [databaseTypes, dbType]);

  useEffect(() => {
    if (templates && templates.length > 0 && !template) {
      setTemplate(templates[0].id);
    }
  }, [templates, template]);

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
      !pathGeral ||
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
      await createClassMutation.mutate({
        connectionString,
        dbType: dbType,
        template: template,
        tables: Array.from(checkedTables),
        pathGeral,
        projectName,
        nameSpace,
        excludePrefixTable,
      });
      setGeneratedPath(pathGeral);
      setShowSuccessModal(true);
      enqueueSnackbar("Classes geradas com sucesso!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : "Erro ao gerar classes",
        { variant: "error" }
      );
    }
  };

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(generatedPath);
      enqueueSnackbar("Caminho copiado!", { variant: "success" });
      setShowSuccessModal(false);
    } catch (err) {
      enqueueSnackbar("Erro ao copiar caminho", { variant: "error" });
    }
  };

  const handleReset = () => {
    setConnectionString("");
    setPathGeral("");
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
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Gerar Classes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gere classes e camadas de arquitetura
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", lg: "row" },
          }}
        >
          <Card sx={{ mb: 3, flex: 1, height: 355 }}>
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
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 200px" },
                    gap: 2,
                  }}
                >
                  <InputWithHistory
                    value={pathGeral}
                    onChange={setPathGeral}
                    inputName="pathGeral"
                    textFieldProps={{
                      fullWidth: true,
                      label: "Caminho",
                      placeholder: "C:\\Projects\\Output",
                      InputProps: {
                        startAdornment: (
                          <FolderIcon sx={{ mr: 1, color: "action.active" }} />
                        ),
                      },
                    }}
                  />

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
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                    gap: 2,
                  }}
                >
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

                  <InputWithHistory
                    value={nameSpace}
                    onChange={setNameSpace}
                    inputName="nameSpace"
                    textFieldProps={{
                      fullWidth: true,
                      label: "Namespace",
                      placeholder: ".Core",
                    }}
                  />

                  <InputWithHistory
                    value={excludePrefixTable}
                    onChange={setExcludePrefixTable}
                    inputName="excludePrefixTable"
                    textFieldProps={{
                      fullWidth: true,
                      label: "Excluir prefixo",
                      placeholder: "Base",
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

          <Card sx={{ width: 350, height: 355 }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <LayersIcon />
                <Typography variant="h6" fontWeight={600}>
                  {template === "DDD" ? "Estrutura DDD" : "Arquitetura Limpa"}
                </Typography>
              </Box>
              {template === "DDD" ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {[
                    "1 - Api/Controllers",
                    "2 - App/Dto",
                    "2 - App/Interfaces",
                    "2 - App/Services",
                    "3 - Domain/Interfaces",
                    "3 - Domain/Models",
                    "3 - Domain/Services",
                    "4 - Repository",
                  ].map((item) => (
                    <Typography
                      key={item}
                      variant="body2"
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <CodeIcon sx={{ fontSize: 16 }} />
                      {item}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {[
                    "1 - Domain/Entities",
                    "1 - Domain/Interfaces Repositories",
                    "2 - Application/Interfaces Services",
                    "2 - Application/Services",
                    "2 - Application/Records",
                    "3 - Infra/Repositories",
                    "3 - Infra/Models",
                    "4 - Api/Controllers",
                    "4 - Api/GraphQl",
                  ].map((item) => (
                    <Typography
                      key={item}
                      variant="body2"
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <CodeIcon sx={{ fontSize: 16 }} />
                      {item}
                    </Typography>
                  ))}
                </Box>
              )}
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
        aria-colspan={2}
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
          Classes Geradas com Sucesso!
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Localização dos arquivos:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
            >
              {generatedPath}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="contained"
            onClick={handleCopyPath}
            startIcon={<CopyIcon />}
            fullWidth
          >
            Copiar Caminho
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
