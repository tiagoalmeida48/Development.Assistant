import type { SvgIconComponent } from "@mui/icons-material";
import {
  Storage as DatabaseIcon,
  ContentCopy as CopyIcon,
  Code as CodeIcon,
  DataObject as JsonToolsIcon,
  Memory as Base64Icon,
  Lock as CryptographyIcon,
  People as UsersIcon,
} from "@mui/icons-material";

export interface NavItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
}

export const navItems: NavItem[] = [
  { label: "Comparar Bancos", path: "/compare-database", icon: DatabaseIcon },
  { label: "Copiar Projeto", path: "/copy-project", icon: CopyIcon },
  { label: "Gerar Classes", path: "/generate-class", icon: CodeIcon },
  { label: "Ferramentas JSON", path: "/json-tools", icon: JsonToolsIcon },
  { label: "Conversor Base64", path: "/base64-tools", icon: Base64Icon },
  { label: "Criptografia", path: "/cryptography-tools", icon: CryptographyIcon },
  { label: "Usuários", path: "/users", icon: UsersIcon },
];
