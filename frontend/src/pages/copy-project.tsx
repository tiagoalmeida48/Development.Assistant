import { useState } from 'react'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Stack,
  CircularProgress,
} from '@mui/material'
import {
  ContentCopy as CopyIcon,
  FolderOpen as FolderIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useCopyProject } from '@/hooks/queries/useProject'
import { InputWithHistory } from '@/components/InputWithHistory'

export default function CopyProjectPage() {
  const [sourceProjectPath, setSourceProjectPath] = useState('')
  const [destinationProjectPath, setDestinationProjectPath] = useState('')
  const [oldNamespace, setOldNamespace] = useState('')
  const [newNamespace, setNewNamespace] = useState('')
  const [success, setSuccess] = useState(false)

  const copyProjectMutation = useCopyProject()
  const { enqueueSnackbar } = useSnackbar()

  const handleCopy = async () => {
    if (!sourceProjectPath || !destinationProjectPath || !oldNamespace || !newNamespace) {
      enqueueSnackbar('Preencha todos os campos', { variant: 'error' })
      return
    }

    try {
      await copyProjectMutation.mutateAsync({
        sourceProjectPath,
        destinationProjectPath,
        oldNamespace,
        newNamespace,
      })
      enqueueSnackbar('Projeto copiado com sucesso!', { variant: 'success' })
      setSuccess(true)
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Erro ao copiar projeto',
        { variant: 'error' }
      )
    }
  }

  const handleReset = () => {
    setSourceProjectPath('')
    setDestinationProjectPath('')
    setOldNamespace('')
    setNewNamespace('')
    setSuccess(false)
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Copiar Projeto
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Copie projetos e renomeie namespaces
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <InputWithHistory
                value={sourceProjectPath}
                onChange={setSourceProjectPath}
                inputName="sourceProjectPath"
                textFieldProps={{
                  fullWidth: true,
                  label: 'Projeto Origem',
                  placeholder: 'C:\\Projects\\Source',
                  disabled: copyProjectMutation.isPending,
                  InputProps: {
                    startAdornment: <FolderIcon sx={{ mr: 1, color: 'action.active' }} />,
                  },
                }}
              />

              <InputWithHistory
                value={destinationProjectPath}
                onChange={setDestinationProjectPath}
                inputName="destinationProjectPath"
                textFieldProps={{
                  fullWidth: true,
                  label: 'Projeto Destino',
                  placeholder: 'C:\\Projects\\Destination',
                  disabled: copyProjectMutation.isPending,
                  InputProps: {
                    startAdornment: <FolderIcon sx={{ mr: 1, color: 'action.active' }} />,
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <InputWithHistory
                value={oldNamespace}
                onChange={setOldNamespace}
                inputName="oldNamespace"
                textFieldProps={{
                  fullWidth: true,
                  label: 'Namespace Antigo',
                  placeholder: 'OldProject.Core',
                  disabled: copyProjectMutation.isPending,
                }}
              />

              <InputWithHistory
                value={newNamespace}
                onChange={setNewNamespace}
                inputName="newNamespace"
                textFieldProps={{
                  fullWidth: true,
                  label: 'Namespace Novo',
                  placeholder: 'NewProject.Core',
                  disabled: copyProjectMutation.isPending,
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleCopy}
                disabled={copyProjectMutation.isPending}
                startIcon={
                  copyProjectMutation.isPending ? (
                    <CircularProgress size={20} />
                  ) : (
                    <CopyIcon />
                  )
                }
              >
                {copyProjectMutation.isPending ? 'Copiando...' : 'Copiar'}
              </Button>

              {success && (
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
  )
}
