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
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  ContentCopy as CopyIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { InputWithHistory } from "@/shared/components/input-with-history";
import {
  useCryptography,
  type CryptographyOperation,
} from "./use-cryptography";

export default function CryptographyPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [key, setKey] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cryptographyMutation = useCryptography();

  const handleProcess = async (operation: CryptographyOperation) => {
    if (!text.trim()) {
      enqueueSnackbar("Informe o texto a processar", { variant: "error" });
      return;
    }

    setError(null);

    try {
      const output = await cryptographyMutation.mutate({
        key,
        operation,
        text,
      });
      setResult(output ?? "");
      enqueueSnackbar(
        operation === "Encrypt" ? "Texto criptografado" : "Texto descriptografado",
        { variant: "success" }
      );
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Erro ao processar o texto";
      setResult("");
      setError(message);
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    enqueueSnackbar("Resultado copiado", { variant: "success" });
  };

  const handleClear = () => {
    setText("");
    setResult("");
    setError(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Criptografia
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Criptografe ou descriptografe um texto informando a chave
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="info">
              Informe a chave e o texto, e clique em criptografar ou descriptografar.
            </Alert>

            <InputWithHistory
              value={key}
              onChange={(value) => {
                setKey(value);
                if (error) setError(null);
              }}
              inputName="cryptographyKey"
              textFieldProps={{
                fullWidth: true,
                label: "Chave",
                placeholder: "Informe a chave",
              }}
            />

            <TextField
              fullWidth
              label="Texto"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                if (error) setError(null);
              }}
              placeholder="Texto a criptografar ou descriptografar"
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="contained"
                onClick={() => handleProcess("Encrypt")}
                disabled={cryptographyMutation.isLoading}
                startIcon={<LockIcon />}
              >
                Criptografar
              </Button>

              <Button
                variant="contained"
                onClick={() => handleProcess("Decrypt")}
                disabled={cryptographyMutation.isLoading}
                startIcon={<LockOpenIcon />}
              >
                Descriptografar
              </Button>

              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={handleCopy}
                disabled={!result}
              >
                Copiar Resultado
              </Button>

              <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear}>
                Limpar
              </Button>
            </Stack>

            {error && (
              <Alert
                severity="error"
                id="cryptography-error"
                role="alert"
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Resultado"
              value={result}
              error={Boolean(error)}
              helperText={error ? "A operação falhou. Verifique a chave e o texto." : " "}
              InputProps={{ readOnly: true }}
              aria-describedby={error ? "cryptography-error" : undefined}
              placeholder="O resultado aparecerá aqui"
            />
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
