import {
  Autocomplete,
  TextField,
  TextFieldProps,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  History as HistoryIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  useInputHistory,
  useDeleteInputHistory,
  useCreateInputHistory,
} from "@/shared/hooks/use-input-history";
import { useState } from "react";

interface InputWithHistoryProps {
  value: string;
  onChange: (value: string) => void;
  inputName: string;
  databaseType?: string;
  textFieldProps?: Omit<TextFieldProps, "value" | "onChange">;
}

export function InputWithHistory({
  value,
  onChange,
  inputName,
  databaseType,
  textFieldProps,
}: InputWithHistoryProps) {
  const { data: history, refetch } = useInputHistory(
    inputName,
    undefined,
    databaseType
  );
  const deleteHistoryMutation = useDeleteInputHistory();
  const createHistoryMutation = useCreateInputHistory();
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const options = history?.map((item) => item.valueInput) || [];
  const uniqueOptions = [...new Set(options)];

  const handleDeleteOption = async (e: React.MouseEvent, option: string) => {
    e.stopPropagation();
    const itemToDelete = history?.find((item) => item.valueInput === option);
    if (itemToDelete) {
      await deleteHistoryMutation.mutate(itemToDelete.id).then(() => {
        refetch();
      });
    }
  };

  const handleOnFocus = () => {
    refetch();
  }

  const handleOnBlur = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const alreadyExists = history?.some((item) => item.valueInput === trimmed);
    if (alreadyExists) return;

    await createHistoryMutation
      .mutate({ input: inputName, valueInput: trimmed, databaseType })
      .then(() => refetch())
      .catch(() => {});
  };

  return (
    <Autocomplete
      freeSolo
      value={value}
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
      onChange={(_, newValue) => {
        onChange(newValue || "");
      }}
      onInputChange={(_, newValue) => {
        onChange(newValue);
      }}
      options={uniqueOptions}
      filterOptions={(options, { inputValue }) => {
        if (!inputValue) return options.slice(0, 10);
        return options
          .filter((option) =>
            option.toLowerCase().includes(inputValue.toLowerCase())
          )
          .slice(0, 10);
      }}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <Box
            component="li"
            key={key}
            {...otherProps}
            onMouseEnter={() => setHoveredOption(option)}
            onMouseLeave={() => setHoveredOption(null)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
              height: "40px",
              "&:hover": {
                bgcolor: "primary.lighter",
              },
              "&.Mui-focused": {
                bgcolor: "primary.lighter",
              },
            }}
          >
          <HistoryIcon sx={{ fontSize: 18, color: "primary.main" }} />
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {option}
          </Typography>
          {hoveredOption === option && (
            <Tooltip title="Deletar este item">
              <IconButton
                size="small"
                onClick={(e) => handleDeleteOption(e, option)}
                sx={{
                  p: 0.5,
                  "&:hover": {
                    color: "error.main",
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        );
      }}
      noOptionsText={
        <Box sx={{ py: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Nenhum histórico encontrado
          </Typography>
        </Box>
      }
      renderInput={(params) => {
        const { InputProps: autocompleteInputProps, ...otherParams } = params;
        const { InputProps: textFieldInputProps, ...otherTextFieldProps } =
          textFieldProps || {};

        return (
          <TextField
            {...otherParams}
            {...otherTextFieldProps}
            InputProps={{
              ...autocompleteInputProps,
              ...textFieldInputProps,
              startAdornment:
                textFieldInputProps?.startAdornment ||
                autocompleteInputProps.startAdornment,
            }}
          />
        );
      }}
      ListboxProps={{
        sx: {
          maxHeight: "300px",
          padding: 0,
          "& .MuiAutocomplete-option": {
            py: 1.5,
            px: 2,
          },
        },
      }}
      componentsProps={{
        paper: {
          sx: {
            mt: 1,
            boxShadow: 3,
          },
        },
      }}
    />
  );
}
