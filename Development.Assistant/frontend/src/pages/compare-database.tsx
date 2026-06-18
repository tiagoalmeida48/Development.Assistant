import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import {
  Storage as DatabaseIcon,
  CheckCircle as CheckCircleIcon,
  CompareArrows as CompareIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useCompareDatabases } from "@/hooks/queries/useDatabase";
import { InputSelect } from "@/components/InputSelect";
import { InputWithHistory } from "@/components/InputWithHistory";
import { useDatabaseTypes } from "@/shared/hooks/use-metadata";

export default function CompareDatabasePage() {
  const [connectionString1, setConnectionString1] = useState("");
  const [connectionString2, setConnectionString2] = useState("");
  const [dbType1, setDbType1] = useState("");
  const [dbType2, setDbType2] = useState("");

  const compareMutation = useCompareDatabases();
  const {
    data: databaseTypes,
    isLoading: isLoadingDbTypes,
    error: isErrorDbTypes,
  } = useDatabaseTypes();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (databaseTypes && databaseTypes.length > 0) {
      if (!dbType1) setDbType1(databaseTypes[0].id);
      if (!dbType2) setDbType2(databaseTypes[0].id);
    }
  }, [databaseTypes, dbType1, dbType2]);

  const result = compareMutation.data;

  const handleCompare = async () => {
    if (!connectionString1 || !connectionString2) {
      enqueueSnackbar("Preencha todas as strings de conexão", { variant: "error" });
      return;
    }
    try {
      await compareMutation.mutate({ connectionString1, connectionString2, dbType1, dbType2 });
      enqueueSnackbar("Comparação concluída!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : "Erro ao comparar bancos",
        { variant: "error" }
      );
    }
  };

  const hasDifferences =
    result &&
    ((result.tables && result.tables.length > 0) ||
      (result.columns && result.columns.length > 0) ||
      (result.registerTables && result.registerTables.length > 0));

  const db1Label = result?.database1 ?? "Banco 1";
  const db2Label = result?.database2 ?? "Banco 2";

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Comparar Bancos de Dados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Compare estruturas e dados entre dois bancos de dados
        </Typography>
      </Box>

      {/* Formulário */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "250px 1fr" }, gap: 2 }}>
              <InputSelect
                value={dbType1}
                onChange={setDbType1}
                label="Tipo Banco 1"
                options={databaseTypes}
                isLoading={isLoadingDbTypes}
                error={!!isErrorDbTypes}
                errorMessage="Erro ao carregar tipos de banco"
              />
              <InputWithHistory
                value={connectionString1}
                onChange={setConnectionString1}
                inputName="conn1"
                databaseType={dbType1}
                textFieldProps={{
                  fullWidth: true,
                  label: "Connection String - Banco 1",
                  placeholder: "Server=localhost;Database=db1;",
                  disabled: compareMutation.isLoading,
                }}
              />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "250px 1fr" }, gap: 2 }}>
              <InputSelect
                value={dbType2}
                onChange={setDbType2}
                label="Tipo Banco 2"
                options={databaseTypes}
                isLoading={isLoadingDbTypes}
                error={!!isErrorDbTypes}
                errorMessage="Erro ao carregar tipos de banco"
              />
              <InputWithHistory
                value={connectionString2}
                onChange={setConnectionString2}
                inputName="conn2"
                databaseType={dbType2}
                textFieldProps={{
                  fullWidth: true,
                  label: "Connection String - Banco 2",
                  placeholder: "Server=localhost;Database=db2;",
                  disabled: compareMutation.isLoading,
                }}
              />
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleCompare}
              disabled={compareMutation.isLoading}
              startIcon={compareMutation.isLoading ? <CircularProgress size={20} /> : <CompareIcon />}
            >
              {compareMutation.isLoading ? "Comparando..." : "Comparar Bancos"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Comparação de Tabelas */}
          {result.tables && result.tables.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <DatabaseIcon />
                  <Typography variant="h6" fontWeight={600}>
                    Comparação de Tabelas
                  </Typography>
                  <Chip label={`${result.tables.length} diferença${result.tables.length > 1 ? "s" : ""}`} color="warning" size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Tabelas presentes em um banco mas ausentes no outro
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>{db1Label}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{db2Label}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.tables.map((row, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>
                            {row.table1 ? (
                              <Typography variant="body2" fontWeight={500}>{row.table1}</Typography>
                            ) : (
                              <Typography variant="body2" color="text.disabled">—</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {row.table2 ? (
                              <Typography variant="body2" fontWeight={500}>{row.table2}</Typography>
                            ) : (
                              <Typography variant="body2" color="text.disabled">—</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Comparação de Campos */}
          {result.columns && result.columns.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <DatabaseIcon />
                  <Typography variant="h6" fontWeight={600}>
                    Comparação de Campos
                  </Typography>
                  <Chip label={`${result.columns.length} tabela${result.columns.length > 1 ? "s" : ""}`} color="warning" size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Colunas presentes em um banco mas ausentes no outro
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Tabela</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Coluna {db1Label}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Coluna {db2Label}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.columns.flatMap((tableEntry) =>
                        tableEntry.columns.map((col, colIdx) => (
                          <TableRow key={`${tableEntry.table}-${colIdx}`} hover>
                            <TableCell>
                              {colIdx === 0 ? (
                                <Typography variant="body2" fontWeight={600}>
                                  {tableEntry.table}
                                </Typography>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              {col.column1 ? (
                                <Box>
                                  <Typography variant="body2" fontFamily="monospace">{col.column1}</Typography>
                                  {col.type1 && (
                                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">{col.type1}</Typography>
                                  )}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.disabled">—</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {col.column2 ? (
                                <Box>
                                  <Typography variant="body2" fontFamily="monospace">{col.column2}</Typography>
                                  {col.type2 && (
                                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">{col.type2}</Typography>
                                  )}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.disabled">—</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Diferenças de Registros */}
          {result.registerTables && result.registerTables.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <DatabaseIcon />
                  <Typography variant="h6" fontWeight={600}>
                    Diferenças de Quantidade de Registros
                  </Typography>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Tabela</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{db1Label}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{db2Label}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Diferença</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.registerTables.map((reg, idx) => {
                        const diff = (reg.totalRegisters1 ?? 0) - (reg.totalRegisters2 ?? 0);
                        const absDiff = Math.abs(diff);
                        return (
                          <TableRow key={idx} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>{reg.table}</Typography>
                            </TableCell>
                            <TableCell align="right">{(reg.totalRegisters1 ?? 0).toLocaleString()}</TableCell>
                            <TableCell align="right">{(reg.totalRegisters2 ?? 0).toLocaleString()}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={diff > 0 ? `+${absDiff}` : `-${absDiff}`}
                                color={diff > 0 ? "success" : "info"}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {!hasDifferences && (
            <Card>
              <CardContent sx={{ py: 8, textAlign: "center" }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Bancos Idênticos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Os bancos de dados possuem a mesma estrutura e quantidade de registros
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
