import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Difference as CompareIcon,
  AutoFixHigh as FormatIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";

type DiffPath = {
  path: string;
  type: "missing-left" | "missing-right" | "different";
};

function compareJson(left: unknown, right: unknown, basePath = "$"): DiffPath[] {
  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLength = Math.max(left.length, right.length);
    const diffs: DiffPath[] = [];

    for (let i = 0; i < maxLength; i += 1) {
      const path = `${basePath}[${i}]`;
      if (i >= left.length) {
        diffs.push({ path, type: "missing-left" });
      } else if (i >= right.length) {
        diffs.push({ path, type: "missing-right" });
      } else {
        diffs.push(...compareJson(left[i], right[i], path));
      }
    }

    return diffs;
  }

  if (
    left &&
    right &&
    typeof left === "object" &&
    typeof right === "object" &&
    !Array.isArray(left) &&
    !Array.isArray(right)
  ) {
    const leftObj = left as Record<string, unknown>;
    const rightObj = right as Record<string, unknown>;
    const keys = Array.from(new Set([...Object.keys(leftObj), ...Object.keys(rightObj)])).sort();
    const diffs: DiffPath[] = [];

    for (const key of keys) {
      const path = `${basePath}.${key}`;
      if (!(key in leftObj)) {
        diffs.push({ path, type: "missing-left" });
      } else if (!(key in rightObj)) {
        diffs.push({ path, type: "missing-right" });
      } else {
        diffs.push(...compareJson(leftObj[key], rightObj[key], path));
      }
    }

    return diffs;
  }

  if (JSON.stringify(left) !== JSON.stringify(right)) {
    return [{ path: basePath, type: "different" }];
  }

  return [];
}

function hasDiffInBranch(path: string, diffs: Set<string>) {
  for (const diff of diffs) {
    if (diff === path || diff.startsWith(`${path}.`) || diff.startsWith(`${path}[`)) {
      return true;
    }
  }
  return false;
}

function renderJsonNode(
  value: unknown,
  currentPath: string,
  diffPaths: Set<string>,
  depth = 0
): React.ReactNode {
  const isDifferent = hasDiffInBranch(currentPath, diffPaths);
  const sharedSx = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    fontSize: 13,
    lineHeight: 1.7,
  };

  if (Array.isArray(value)) {
    return (
      <Box
        sx={{
          ...sharedSx,
          pl: depth === 0 ? 0 : 2,
          borderLeft: depth === 0 ? "none" : "1px solid",
          borderColor: isDifferent ? "warning.main" : "divider",
          ml: depth === 0 ? 0 : 1,
          bgcolor: isDifferent ? "rgba(215, 126, 0, 0.08)" : "transparent",
          borderRadius: 1,
        }}
      >
        <Typography component="span" sx={sharedSx}>
          [
        </Typography>
        {value.map((item, index) => (
          <Box key={`${currentPath}[${index}]`}>
            {renderJsonNode(item, `${currentPath}[${index}]`, diffPaths, depth + 1)}
            {index < value.length - 1 && (
              <Typography component="span" sx={sharedSx}>
                ,
              </Typography>
            )}
          </Box>
        ))}
        <Typography component="div" sx={sharedSx}>
          ]
        </Typography>
      </Box>
    );
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <Box
        sx={{
          ...sharedSx,
          pl: depth === 0 ? 0 : 2,
          borderLeft: depth === 0 ? "none" : "1px solid",
          borderColor: isDifferent ? "warning.main" : "divider",
          ml: depth === 0 ? 0 : 1,
          bgcolor: isDifferent ? "rgba(215, 126, 0, 0.08)" : "transparent",
          borderRadius: 1,
        }}
      >
        <Typography component="span" sx={sharedSx}>
          {"{"}
        </Typography>
        {entries.map(([key, item], index) => {
          const childPath = currentPath === "$" ? `$.${key}` : `${currentPath}.${key}`;
          const childDifferent = hasDiffInBranch(childPath, diffPaths);

          return (
            <Box
              key={childPath}
              sx={{
                pl: 2,
                py: 0.25,
                bgcolor: childDifferent ? "rgba(215, 126, 0, 0.14)" : "transparent",
                borderRadius: 1,
              }}
            >
              <Typography component="span" sx={sharedSx}>
                "{key}":{" "}
              </Typography>
              {typeof item === "object" && item !== null ? (
                renderJsonNode(item, childPath, diffPaths, depth + 1)
              ) : (
                <Typography
                  component="span"
                  sx={{
                    ...sharedSx,
                    color: childDifferent ? "warning.light" : "text.primary",
                    fontWeight: childDifferent ? 800 : 500,
                  }}
                >
                  {JSON.stringify(item)}
                </Typography>
              )}
              {index < entries.length - 1 && (
                <Typography component="span" sx={sharedSx}>
                  ,
                </Typography>
              )}
            </Box>
          );
        })}
        <Typography component="div" sx={sharedSx}>
          {"}"}
        </Typography>
      </Box>
    );
  }

  return (
    <Typography
      component="div"
      sx={{
        ...sharedSx,
        pl: depth === 0 ? 0 : 2,
        color: isDifferent ? "warning.light" : "text.primary",
        bgcolor: isDifferent ? "rgba(215, 126, 0, 0.14)" : "transparent",
        borderRadius: 1,
        fontWeight: isDifferent ? 800 : 500,
      }}
    >
      {JSON.stringify(value)}
    </Typography>
  );
}

export default function JsonToolsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);
  const [leftJson, setLeftJson] = useState("");
  const [rightJson, setRightJson] = useState("");
  const [singleJson, setSingleJson] = useState("");

  const comparison = useMemo(() => {
    if (!leftJson.trim() || !rightJson.trim()) return null;

    try {
      const leftParsed = JSON.parse(leftJson);
      const rightParsed = JSON.parse(rightJson);
      const diffs = compareJson(leftParsed, rightParsed);

      return {
        leftParsed,
        rightParsed,
        diffs,
        diffPathSet: new Set(diffs.map((item) => item.path)),
        error: null as string | null,
      };
    } catch (error) {
      return {
        leftParsed: null,
        rightParsed: null,
        diffs: [],
        diffPathSet: new Set<string>(),
        error: error instanceof Error ? error.message : "JSON inválido",
      };
    }
  }, [leftJson, rightJson]);

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    enqueueSnackbar("Conteúdo copiado", { variant: "success" });
  };

  const handleFormatSingleJson = () => {
    try {
      const parsed = JSON.parse(singleJson);
      setSingleJson(JSON.stringify(parsed, null, 2));
      enqueueSnackbar("JSON formatado com sucesso", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : "JSON inválido para formatação",
        { variant: "error" }
      );
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Ferramentas de JSON
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cole dois JSONs para comparar, já com formatação e destaque das divergências
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
            <Tab icon={<FormatIcon />} iconPosition="start" label="Formatar JSON" />
            <Tab icon={<CompareIcon />} iconPosition="start" label="Comparador JSON" />
          </Tabs>

          {tab === 0 ? (
            <Stack spacing={2}>
              <TextField
                label="JSON"
                multiline
                minRows={18}
                value={singleJson}
                onChange={(event) => setSingleJson(event.target.value)}
                placeholder='{"name":"Projeto","version":1}'
              />
              <Stack direction="row" spacing={1.5}>
                <Button variant="contained" onClick={handleFormatSingleJson}>
                  Formatar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={() => handleCopy(singleJson)}
                  disabled={!singleJson}
                >
                  Copiar
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  label="JSON A"
                  multiline
                  minRows={10}
                  value={leftJson}
                  onChange={(event) => setLeftJson(event.target.value)}
                  placeholder='{"name":"Projeto","version":1}'
                />
                <TextField
                  label="JSON B"
                  multiline
                  minRows={10}
                  value={rightJson}
                  onChange={(event) => setRightJson(event.target.value)}
                  placeholder='{"name":"Projeto","version":2}'
                />
              </Box>

              {comparison?.error ? (
                <Alert severity="error">{comparison.error}</Alert>
              ) : comparison ? (
                <>
                  <Chip
                    icon={<CompareIcon />}
                    label={
                      comparison.diffs.length === 0
                        ? "JSONs equivalentes"
                        : `${comparison.diffs.length} divergência(s) encontrada(s)`
                    }
                    color={comparison.diffs.length === 0 ? "success" : "warning"}
                    sx={{ alignSelf: "flex-start" }}
                  />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <Card variant="outlined">
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 2 }}
                        >
                          <Typography variant="h6">JSON A formatado</Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CopyIcon />}
                            onClick={() =>
                              handleCopy(JSON.stringify(comparison.leftParsed, null, 2))
                            }
                          >
                            Copiar
                          </Button>
                        </Stack>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            overflow: "auto",
                            maxHeight: 720,
                          }}
                        >
                          {renderJsonNode(comparison.leftParsed, "$", comparison.diffPathSet)}
                        </Box>
                      </CardContent>
                    </Card>

                    <Card variant="outlined">
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 2 }}
                        >
                          <Typography variant="h6">JSON B formatado</Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CopyIcon />}
                            onClick={() =>
                              handleCopy(JSON.stringify(comparison.rightParsed, null, 2))
                            }
                          >
                            Copiar
                          </Button>
                        </Stack>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            overflow: "auto",
                            maxHeight: 720,
                          }}
                        >
                          {renderJsonNode(comparison.rightParsed, "$", comparison.diffPathSet)}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </>
              ) : (
                <Alert severity="info">Cole dois JSONs para iniciar a comparação.</Alert>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
