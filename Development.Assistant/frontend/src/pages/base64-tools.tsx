import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  UploadFile as UploadFileIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";

function sanitizeBase64Input(value: string) {
  return value.trim();
}

function isDataUrl(value: string) {
  return /^data:.*;base64,/.test(value.trim());
}

function inferMimeType(base64: string) {
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("iVBOR")) return "image/png";
  if (base64.startsWith("R0lGOD")) return "image/gif";
  if (base64.startsWith("JVBERi0")) return "application/pdf";
  if (base64.startsWith("UEsDB")) return "application/zip";
  return "application/octet-stream";
}

function inferExtension(mimeType: string) {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "application/pdf": "pdf",
    "application/zip": "zip",
    "text/plain": "txt",
  };

  return map[mimeType] || "bin";
}

export default function Base64ToolsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [base64Value, setBase64Value] = useState("");
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFileToBase64 = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setBase64Value(result);
      setFileName(file.name);
      setPreviewUrl(file.type.startsWith("image/") ? result : "");
      enqueueSnackbar("Arquivo convertido para Base64", { variant: "success" });
    };
    reader.readAsDataURL(file);
  };

  const handleBase64ToFile = () => {
    try {
      const input = sanitizeBase64Input(base64Value);
      if (!input) {
        enqueueSnackbar("Informe um conteúdo Base64", { variant: "error" });
        return;
      }

      let mimeType = "application/octet-stream";
      let pureBase64 = input;

      if (isDataUrl(input)) {
        const [meta, content] = input.split(",");
        mimeType = meta.match(/data:(.*);base64/)?.[1] || mimeType;
        pureBase64 = content;
      } else {
        pureBase64 = input.replace(/\s+/g, "");
        mimeType = inferMimeType(pureBase64);
      }

      const byteCharacters = atob(pureBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i += 1) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `arquivo-convertido.${inferExtension(mimeType)}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      enqueueSnackbar("Base64 convertido para arquivo", { variant: "success" });
    } catch {
      enqueueSnackbar("Base64 inválido para conversão", { variant: "error" });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(base64Value);
    enqueueSnackbar("Base64 copiado", { variant: "success" });
  };

  const handleClear = () => {
    setBase64Value("");
    setFileName("");
    setPreviewUrl("");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Conversor Base64
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Converta arquivo para Base64 ou Base64 para arquivo na mesma tela
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="info">
              Envie um arquivo para gerar Base64, ou cole um Base64 e clique em
              converter para baixar o arquivo.
            </Alert>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                Selecionar arquivo
                <input
                  hidden
                  type="file"
                  onChange={(event) => handleFileToBase64(event.target.files?.[0] ?? null)}
                />
              </Button>

              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleBase64ToFile}
              >
                Converter
              </Button>

              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={handleCopy}
                disabled={!base64Value}
              >
                Copiar Base64
              </Button>

              <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear}>
                Limpar
              </Button>
            </Stack>

            {fileName && <Alert severity="success">Arquivo carregado: {fileName}</Alert>}

            {previewUrl && (
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  maxWidth: 320,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
            )}

            <TextField
              label="Base64"
              multiline
              minRows={18}
              value={base64Value}
              onChange={(event) => setBase64Value(event.target.value)}
              placeholder="Cole aqui um Base64 ou carregue um arquivo para converter"
            />
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
