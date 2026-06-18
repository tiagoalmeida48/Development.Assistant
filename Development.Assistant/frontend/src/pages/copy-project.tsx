import { useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Clear as ClearIcon,
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useCopyProjectZip } from "@/hooks/queries/useProject";
import { InputWithHistory } from "@/shared/components/input-with-history";

export default function CopyProjectPage() {
  const [projectZip, setProjectZip] = useState<File | null>(null);
  const [oldNamespace, setOldNamespace] = useState("");
  const [newNamespace, setNewNamespace] = useState("");
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [generatedFilename, setGeneratedFilename] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const copyProjectMutation = useCopyProjectZip();
  const { enqueueSnackbar } = useSnackbar();

  const handleCopy = async () => {
    if (!projectZip || !oldNamespace || !newNamespace) {
      enqueueSnackbar("Envie o .zip e preencha os namespaces", { variant: "error" });
      return;
    }

    try {
      const result = await copyProjectMutation.mutate({
        projectZip,
        oldNamespace,
        newNamespace,
      });
      setGeneratedBlob(result.blob);
      setGeneratedFilename(result.filename);
      enqueueSnackbar("Projeto gerado com sucesso. Faça o download do ZIP.", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : "Erro ao copiar projeto",
        { variant: "error" }
      );
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      enqueueSnackbar("Selecione um arquivo .zip", { variant: "error" });
      return;
    }

    setProjectZip(file);
    setGeneratedBlob(null);
    setGeneratedFilename("");
  };

  const handleDownload = () => {
    if (!generatedBlob) {
      enqueueSnackbar("Nenhum arquivo para baixar", { variant: "error" });
      return;
    }

    const url = window.URL.createObjectURL(generatedBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = generatedFilename || `${newNamespace || "project"}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setProjectZip(null);
    setOldNamespace("");
    setNewNamespace("");
    setGeneratedBlob(null);
    setGeneratedFilename("");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Copiar Projeto
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Envie um projeto compactado, renomeie namespaces e baixe o resultado
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2}>
            <Box
              component="label"
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                handleFileSelect(event.dataTransfer.files?.[0] ?? null);
              }}
              sx={{
                display: "flex",
                minHeight: 180,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 1.5,
                textAlign: "center",
                cursor: copyProjectMutation.isLoading ? "default" : "pointer",
                border: "1.5px dashed",
                borderColor: isDragging || projectZip ? "primary.main" : "divider",
                borderRadius: 2,
                bgcolor: isDragging ? "primary.lighter" : "action.hover",
                transition: "border-color 160ms ease, background-color 160ms ease, transform 160ms ease",
                transform: isDragging ? "translateY(-2px)" : "none",
                px: 3,
              }}
            >
              <UploadFileIcon color="primary" sx={{ fontSize: 44 }} />
              <Typography variant="h6">
                {projectZip ? projectZip.name : "Arraste o projeto aqui"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {projectZip ? "Arquivo pronto para gerar" : "ou clique para selecionar"}
              </Typography>
              <input
                hidden
                type="file"
                accept=".zip,application/zip"
                onChange={(event) => {
                  handleFileSelect(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
                disabled={copyProjectMutation.isLoading}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <InputWithHistory
                value={oldNamespace}
                onChange={setOldNamespace}
                inputName="oldNamespace"
                textFieldProps={{
                  fullWidth: true,
                  label: "Namespace Antigo",
                  placeholder: "OldProject.Core",
                  disabled: copyProjectMutation.isLoading,
                }}
              />

              <InputWithHistory
                value={newNamespace}
                onChange={setNewNamespace}
                inputName="newNamespace"
                textFieldProps={{
                  fullWidth: true,
                  label: "Namespace Novo",
                  placeholder: "NewProject.Core",
                  disabled: copyProjectMutation.isLoading,
                }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleCopy}
                disabled={copyProjectMutation.isLoading}
                startIcon={
                  copyProjectMutation.isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <CopyIcon />
                  )
                }
              >
                {copyProjectMutation.isLoading ? "Gerando..." : "Gerar ZIP"}
              </Button>

              {generatedBlob && (
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={handleDownload}
                  startIcon={<DownloadIcon />}
                >
                  Baixar
                </Button>
              )}

              {(projectZip || generatedBlob) && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleReset}
                  startIcon={<ClearIcon />}
                >
                  Limpar
                </Button>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
