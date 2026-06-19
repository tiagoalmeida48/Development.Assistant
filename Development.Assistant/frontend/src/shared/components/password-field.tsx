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

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      disabled={disabled}
      InputProps={{
        ...InputProps,
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip title={visible ? "Ocultar senha" : "Mostrar senha"}>
              <span>
                <IconButton
                  onClick={() => setVisible((value) => !value)}
                  edge="end"
                  size="small"
                  disabled={disabled}
                  aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                  tabIndex={-1}
                >
                  {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </span>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
}
