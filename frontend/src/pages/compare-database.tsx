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
import { useDatabaseTypes } from "@/hooks/queries/useMetadata";

export default function CompareDatabasePage() {
  const [connectionString1, setConnectionString1] = useState("");
  const [connectionString2, setConnectionString2] = useState("");
  const [dbType, setDbType] = useState("");

  const compareMutation = useCompareDatabases();
  const {
    data: databaseTypes,
    isLoading: isLoadingDbTypes,
    isError: isErrorDbTypes,
  } = useDatabaseTypes();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (databaseTypes && databaseTypes.length > 0 && !dbType) {
      setDbType(databaseTypes[0].id);
    }
  }, [databaseTypes, dbType]);

  const result = compareMutation.data;

  const handleCompare = async () => {
    if (!connectionString1 || !connectionString2) {
      enqueueSnackbar("Preencha todas as strings de conexão", {
        variant: "error",
      });
      return;
    }

    try {
      await compareMutation.mutateAsync({
        connectionString1,
        connectionString2,
        dbType: dbType,
      });
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
      (result.registerTables && result.registerTables.length > 0));

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

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "250px 1fr" },
                gap: 2,
              }}
            >
              <InputSelect
                value={dbType}
                onChange={setDbType}
                label="Tipo de Banco"
                options={databaseTypes}
                isLoading={isLoadingDbTypes}
                isError={isErrorDbTypes}
                errorMessage="Erro ao carregar tipos de banco"
              />

              <InputWithHistory
                value={connectionString1}
                onChange={setConnectionString1}
                inputName="conn1"
                textFieldProps={{
                  fullWidth: true,
                  label: "Connection String - Banco 1",
                  placeholder: "Server=localhost;Database=db1;",
                  disabled: compareMutation.isPending,
                }}
              />
            </Box>
            <InputWithHistory
              value={connectionString2}
              onChange={setConnectionString2}
              inputName="conn2"
              textFieldProps={{
                fullWidth: true,
                label: "Connection String - Banco 2",
                placeholder: "Server=localhost;Database=db2;",
                disabled: compareMutation.isPending,
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleCompare}
              disabled={compareMutation.isPending}
              startIcon={
                compareMutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  <CompareIcon />
                )
              }
            >
              {compareMutation.isPending ? "Comparando..." : "Comparar Bancos"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Diferenças de Estrutura */}
          {result.tables && result.tables.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <DatabaseIcon />
                  <Typography variant="h6" fontWeight={600}>
                    Diferenças de Estrutura
                  </Typography>
                  <Chip
                    label={`${result.tables.length} diferença${
                      result.tables.length > 1 ? "s" : ""
                    }`}
                    color="warning"
                    size="small"
                  />
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tabela</TableCell>
                        <TableCell>Banco</TableCell>
                        <TableCell align="right">Total Registros</TableCell>
                        <TableCell align="right">Colunas</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.tables.map((table, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {table.table}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                table.database === result.database1
                                  ? "Banco 1"
                                  : "Banco 2"
                              }
                              size="small"
                              color={
                                table.database === result.database1
                                  ? "primary"
                                  : "secondary"
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            {table.totalRegisters.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {table.columns?.length || 0}
                          </TableCell>
                        </TableRow>
                      ))}
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
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <DatabaseIcon />
                  <Typography variant="h6" fontWeight={600}>
                    Diferenças de Quantidade de Registros
                  </Typography>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tabela</TableCell>
                        <TableCell align="right">{result.database1}</TableCell>
                        <TableCell align="right">{result.database2}</TableCell>
                        <TableCell align="center">Diferença</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.registerTables.map((reg, idx) => {
                        const diff = reg.totalRegisters1 - reg.totalRegisters2;
                        const absDiff = Math.abs(diff);

                        return (
                          <TableRow key={idx} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {reg.table}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {reg.totalRegisters1.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              {reg.totalRegisters2.toLocaleString()}
                            </TableCell>
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

          {/* Bancos Idênticos */}
          {!hasDifferences && (
            <Card>
              <CardContent sx={{ py: 8, textAlign: "center" }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Bancos Idênticos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Os bancos de dados possuem a mesma estrutura e quantidade de
                  registros
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
