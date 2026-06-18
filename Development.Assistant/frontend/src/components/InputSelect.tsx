import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectProps,
    FormHelperText,
    CircularProgress,
    Box,
    Typography,
  } from '@mui/material'
  import { ErrorOutline as ErrorIcon } from '@mui/icons-material'

  interface MetadataOption {
    id: string
    name: string
  }

  interface InputSelectProps {
    value: string
    onChange: (value: string) => void
    label: string
    options?: MetadataOption[]
    isLoading?: boolean
    isError?: boolean
    errorMessage?: string
    fullWidth?: boolean
    disabled?: boolean
    helperText?: string
    error?: boolean
    placeholder?: string
    selectProps?: Omit<SelectProps, 'value' | 'onChange' | 'label'>
  }

  export function InputSelect({
    value,
    onChange,
    label,
    options = [],
    isLoading = false,
    isError = false,
    errorMessage,
    fullWidth = true,
    disabled = false,
    helperText,
    error = false,
    placeholder,
    selectProps,
  }: InputSelectProps) {
    return (
      <FormControl fullWidth={fullWidth} disabled={disabled || isLoading} error={error || isError}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value as string)}
          label={label}
          displayEmpty={!!placeholder}
          sx={{
            bgcolor: 'background.paper',
            '& .MuiSelect-select': {
              bgcolor: 'background.paper',
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: 'background.paper',
                backgroundImage: 'none',
                '& .MuiList-root': {
                  padding: 0,
                  bgcolor: 'background.paper',
                },
                '& .MuiMenuItem-root': {
                  bgcolor: 'background.paper',
                },
                '& .MuiMenuItem-root.Mui-selected': {
                  bgcolor: 'primary.lighter',
                },
                '& .MuiMenuItem-root.Mui-selected:hover': {
                  bgcolor: 'primary.lighter',
                },
                '& .MuiMenuItem-root:hover': {
                  bgcolor: 'action.hover',
                },
              },
            },
          }}
          startAdornment={
            isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                <CircularProgress size={20} />
              </Box>
            ) : null
          }
          {...selectProps}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              <Typography variant="body2" color="text.secondary">
                {placeholder}
              </Typography>
            </MenuItem>
          )}

          {isError ? (
            <MenuItem disabled>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                <ErrorIcon fontSize="small" />
                <Typography variant="body2">
                  {errorMessage || 'Erro ao carregar opções'}
                </Typography>
              </Box>
            </MenuItem>
          ) : isLoading ? (
            <MenuItem disabled>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2">Carregando...</Typography>
              </Box>
            </MenuItem>
          ) : !options || options.length === 0 ? (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                Nenhuma opção disponível
              </Typography>
            </MenuItem>
          ) : (
            options.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))
          )}
        </Select>
        {(helperText || (isError && errorMessage)) && (
          <FormHelperText>{isError && errorMessage ? errorMessage : helperText}</FormHelperText>
        )}
      </FormControl>
    )
  }
