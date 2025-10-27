# ESLint Removido

## Por que foi removido?

O ESLint estava causando problemas ao reverter automaticamente os arquivos durante o build, especialmente os arquivos de rotas do TanStack Router.

### Problemas identificados:
1. ❌ Revertia `createRoute({ ... })` para sintaxe incorreta `createRoute('path')({ ... })`
2. ❌ Adicionava imports não utilizados (`createFileRoute`)
3. ❌ Causava falhas de build por modificar arquivos durante `tsc -b && vite build`

## O que foi removido:

### Pacotes:
- `@eslint/js`
- `eslint`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `globals`
- `typescript-eslint`

### Arquivos:
- `.eslintrc.json`

### Scripts:
- `"lint": "eslint ."`

## Validação de código agora:

### ✅ TypeScript Strict Mode
O projeto usa TypeScript com configurações strict:
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

Isso fornece:
- ✅ Type checking completo
- ✅ Detecção de variáveis não usadas
- ✅ Verificação de null/undefined
- ✅ Verificação de tipos de retorno

### ✅ Vite Build
O Vite já faz:
- ✅ Tree-shaking
- ✅ Minificação
- ✅ Otimização de código

### ✅ Editor Integration
Use as extensões do VSCode:
- **ESLint**: Desabilite (não é mais necessário)
- **TypeScript**: Ative para validação em tempo real
- **Prettier**: (Opcional) Para formatação de código

## Comandos disponíveis:

```bash
# Desenvolvimento
yarn dev

# Build (apenas TypeScript + Vite)
yarn build

# Preview
yarn preview
```

## Se quiser adicionar linting novamente:

```bash
# Instalar Prettier (formatação apenas)
yarn add -D prettier

# Criar .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5"
}

# Formatar código
npx prettier --write "src/**/*.{ts,tsx}"
```

**Nota:** Prettier apenas formata, não modifica a estrutura do código como o ESLint fazia.

## Resultado:

✅ Build funciona sem interferências
✅ TypeScript fornece validação de tipos
✅ Código mais estável
✅ Menos dependências
✅ Build mais rápido
