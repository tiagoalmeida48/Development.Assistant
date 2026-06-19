import { useState } from "react";
import { IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import {
  VisibilityOutlined as VisibilityIcon,
  VisibilityOffOutlined as VisibilityOffIcon,
} from "@mui/icons-material";

/**
 * Campo de senha com botão de olho para revelar/ocultar o valor digitado.
 * Repassa todas as props de TextField; preserva qualquer startAdornment
 * informado via InputProps e adiciona o toggle como endAdornment.
 */
export function PasswordField({ InputProps, disabled, ...props }: TextFieldProps) {
  const [visible, setVisible] = useState(false);

  // O olho só aparece quando há algo digitado; campo vazio volta a ocultar.
  const hasValue = props.value != null && String(props.value).length > 0;
  const visibleWithValue = visible && hasValue;

  return (
    <TextField
      {...props}
      type={visibleWithValue ? "text" : "password"}
      disabled={disabled}
      InputProps={{
        ...InputProps,
        endAdornment: hasValue ? (
          <InputAdornment position="end">
            <Tooltip title={visibleWithValue ? "Ocultar senha" : "Mostrar senha"}>
              <span>
                <IconButton
                  onClick={() => setVisible((value) => !value)}
                  edge="end"
                  size="small"
                  disabled={disabled}
                  aria-label={visibleWithValue ? "Ocultar senha" : "Mostrar senha"}
                  tabIndex={-1}
                  sx={{
                    color: "text.disabled",
                    "&:hover": { color: "text.secondary" },
                  }}
                >
                  {visibleWithValue ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </InputAdornment>
        ) : null,
      }}
    />
  );
}
