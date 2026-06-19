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
  alpha,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  ContentCopy as CopyIcon,
  Difference as CompareIcon,
  AutoFixHigh as FormatIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";

/** Esconde visualmente, mantendo o texto disponível ao leitor de tela. */
const visuallyHiddenSx = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

type DiffType = "missing-left" | "missing-right" | "different";

type DiffPath = {
  path: string;
  type: DiffType;
};

type PaletteColor = "success" | "error" | "warning";

/**
 * Descritor por tipo de divergência: cada tipo carrega cor, glyph e rótulo,
 * de modo que a diferença seja comunicada por três canais (cor + símbolo +
 * texto), nunca só por cor. `missing-left` = só existe no JSON B (adicionado);
 * `missing-right` = só existe no JSON A (removido); `different` = valor alterado.
 */
const DIFF_META: Record<DiffType, { glyph: string; label: string; color: PaletteColor }> = {
  "missing-left": { glyph: "+", label: "adicionado", color: "success" },
  "missing-right": { glyph: "−", label: "removido", color: "error" },
  different: { glyph: "~", label: "alterado", color: "warning" },
};

/**
 * Cor do glyph do diff. No modo claro usa o tom `.dark` (Regra do Tom Escuro
 * do DESIGN.md): o `.main` ocre do warning fica no limite de contraste como
 * símbolo pequeno; o `.dark` o firma com folga. No escuro o `.main` já contrasta.
 */
function glyphColor(color: PaletteColor, theme: Theme) {
  return theme.palette.mode === "light"
    ? theme.palette[color].dark
    : theme.palette[color].main;
}

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

/**
 * Resolve o tipo de divergência relevante para um branch. Uma correspondência
 * exata no path (folha) vence; caso contrário, devolve o tipo de qualquer
 * descendente divergente. Retorna null quando o branch é idêntico nos dois lados.
 */
function resolveDiffType(path: string, diffs: Map<string, DiffType>): DiffType | null {
  const exact = diffs.get(path);
  if (exact) return exact;
  for (const [diffPath, type] of diffs) {
    if (diffPath.startsWith(`${path}.`) || diffPath.startsWith(`${path}[`)) {
      return type;
    }
  }
  return null;
}

const sharedSx = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 13,
  lineHeight: 1.7,
} as const;

/**
 * Gutter monospace com o glyph do diff (+ / − / ~) à esquerda da linha. É o
 * canal não-cromático: junto da cor e do aria-label, garante que a divergência
 * seja perceptível sem depender de cor (WCAG 1.4.1).
 */
function DiffGutter({ type }: { type: DiffType | null }) {
  const meta = type ? DIFF_META[type] : null;
  return (
    <Box
      component="span"
      aria-hidden={!meta}
      sx={{
        ...sharedSx,
        display: "inline-block",
        width: "1.4ch",
        flexShrink: 0,
        textAlign: "center",
        fontWeight: 800,
        color: meta ? (theme: Theme) => glyphColor(meta.color, theme) : "transparent",
        userSelect: "none",
      }}
    >
      {meta ? meta.glyph : " "}
    </Box>
  );
}

function renderJsonNode(
  value: unknown,
  currentPath: string,
  diffPaths: Map<string, DiffType>,
  depth = 0
): React.ReactNode {
  const diffType = resolveDiffType(currentPath, diffPaths);
  const branchColor = diffType ? DIFF_META[diffType].color : null;

  const containerSx = {
    ...sharedSx,
    pl: depth === 0 ? 0 : 2,
    borderLeft: depth === 0 ? "none" : "1px solid",
    borderColor: branchColor ? `${branchColor}.main` : "divider",
    ml: depth === 0 ? 0 : 1,
    bgcolor: branchColor
      ? (theme: Theme) => alpha(theme.palette[branchColor].main, 0.08)
      : "transparent",
    borderRadius: 1,
  };

  if (Array.isArray(value)) {
    return (
      <Box sx={containerSx}>
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
      <Box sx={containerSx}>
        <Typography component="span" sx={sharedSx}>
          {"{"}
        </Typography>
        {entries.map(([key, item], index) => {
          const childPath = currentPath === "$" ? `$.${key}` : `${currentPath}.${key}`;
          const childType = resolveDiffType(childPath, diffPaths);
          const childMeta = childType ? DIFF_META[childType] : null;

          return (
            <Box
              key={childPath}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                pl: 0.5,
                py: 0.25,
                bgcolor: childMeta
                  ? (theme) => alpha(theme.palette[childMeta.color].main, 0.14)
                  : "transparent",
                borderRadius: 1,
              }}
              title={childMeta ? `Campo ${childMeta.label}` : undefined}
            >
              <DiffGutter type={childType} />
              <Box component="span" sx={{ ...sharedSx, minWidth: 0 }}>
                {childMeta && (
                  <Box component="span" sx={visuallyHiddenSx}>
                    {`(${childMeta.label}) `}
                  </Box>
                )}
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
                      color: "text.primary",
                      fontWeight: childMeta ? 800 : 500,
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
        color: "text.primary",
        bgcolor: branchColor
          ? (theme) => alpha(theme.palette[branchColor].main, 0.14)
          : "transparent",
        borderRadius: 1,
        fontWeight: diffType ? 800 : 500,
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
        diffPathMap: new Map(diffs.map((item) => [item.path, item.type])),
        error: null as string | null,
      };
    } catch (error) {
      return {
        leftParsed: null,
        rightParsed: null,
        diffs: [],
        diffPathMap: new Map<string, DiffType>(),
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
        <Typography variant="h4" gutterBottom>
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
                  <Stack
                    direction="row"
                    spacing={2}
                    useFlexGap
                    flexWrap="wrap"
                    alignItems="center"
                  >
                    <Chip
                      icon={<CompareIcon />}
                      label={
                        comparison.diffs.length === 0
                          ? "JSONs equivalentes"
                          : `${comparison.diffs.length} divergência(s) encontrada(s)`
                      }
                      color={comparison.diffs.length === 0 ? "success" : "warning"}
                    />
                    {comparison.diffs.length > 0 && (
                      <Stack
                        direction="row"
                        spacing={2}
                        useFlexGap
                        flexWrap="wrap"
                        component="ul"
                        aria-label="Legenda das divergências"
                        sx={{ listStyle: "none", m: 0, p: 0 }}
                      >
                        {(Object.keys(DIFF_META) as DiffType[]).map((type) => {
                          const meta = DIFF_META[type];
                          return (
                            <Stack
                              key={type}
                              component="li"
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                            >
                              <Box
                                component="span"
                                aria-hidden
                                sx={{
                                  ...sharedSx,
                                  fontWeight: 800,
                                  color: (theme) => glyphColor(meta.color, theme),
                                  width: "1.4ch",
                                  textAlign: "center",
                                }}
                              >
                                {meta.glyph}
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {meta.label}
                              </Typography>
                            </Stack>
                          );
                        })}
                      </Stack>
                    )}
                  </Stack>

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
                          {renderJsonNode(comparison.leftParsed, "$", comparison.diffPathMap)}
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
                          {renderJsonNode(comparison.rightParsed, "$", comparison.diffPathMap)}
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
