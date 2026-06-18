# Modularização do Frontend — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o frontend de organização por tipo técnico para feature-based (por domínio), quebrar o `App.tsx` monolítico, remover arquivos mortos e padronizar nomenclatura — sem nenhuma mudança de comportamento visível.

**Architecture:** Estrutura em três zonas — `app/` (casca: providers, router, layout), `features/` (9 pastas auto-contidas por domínio) e `shared/` (api, components, hooks, theme). Imports via alias `@/*` já existente. Verificação por compilador, não por testes runtime.

**Tech Stack:** React 19, TypeScript 5.7 (strict, `noUnusedLocals`/`noUnusedParameters`), Vite 6, MUI 7, react-router-dom 6, notistack, axios. Gerenciador: **pnpm**.

## Global Constraints

- **Nomenclatura de arquivo:** kebab-case (`cryptography-page.tsx`); identificador do componente em PascalCase no código (`CryptographyPage`); hooks com prefixo `use` (`use-cryptography.ts`).
- **Alias único:** `@/*` → `./src/*` (já em vite.config.ts e tsconfig.json). Não criar sub-aliases.
- **Sem mudança de UI/comportamento.** Apenas mover, renomear, reorganizar e limpar imports.
- **Sem novas dependências.** Hooks atuais permanecem como estão (nada de react-query novo).
- **Mensagens de runtime/UI permanecem em português** (não tocar em texto visível).
- **Verificação por tarefa:** `pnpm exec tsc --noEmit` deve passar com 0 erros antes do commit. Não há suíte de testes runtime — o compilador TypeScript em modo strict é o "test cycle" desta refatoração.
- **Diretório de trabalho:** todos os comandos rodam em `Development.Assistant/frontend/`.

---

## Ordem e estratégia

A refatoração vai **bottom-up no grafo de dependências**: primeiro as folhas (`shared/`, que ninguém depende para existir mas todos consomem), depois `features/`, depois `app/` (topo), e por fim deleções + verificação de build completo. Cada tarefa move um conjunto coeso de arquivos e **conserta todos os imports que apontam para eles**, mantendo o `tsc` verde ao final de cada passo.

**Mecânica de mover arquivo:** use `git mv` (preserva histórico) e depois ajuste o conteúdo (imports internos + nome do símbolo) com a ferramenta de edição. Após cada tarefa, rode `tsc --noEmit` — os erros de "Cannot find module" apontam exatamente quais imports faltam ajustar.

**Nota sobre helper de clipboard:** o `handleCopy` aparece em 4 páginas mas **com assinaturas diferentes** (base64 copia `base64Value`, cryptography copia `result`, json recebe `value` por parâmetro, copy-project tem outro fluxo). NÃO são idênticos → **não extrair** `useClipboard`. Deixar cada `handleCopy` na sua página. (Decisão registrada no spec: extrair só se idêntico.)

---

## Task 1: Criar `shared/api` (axios + tipos de envelope)

**Files:**
- Create: `src/shared/api/axios.ts` (de `src/lib/axios.ts`)
- Create: `src/shared/api/types.ts`
- Modify (imports): todos os 8 hooks em `src/hooks/queries/*.ts` que importam `@/lib/axios`

**Interfaces:**
- Produces: `api` (axios instance) de `@/shared/api/axios`; `ApiError`, `ResultApi` de `@/shared/api/types`.

- [ ] **Step 1: Mover o axios com git mv**

```bash
cd Development.Assistant/frontend
mkdir -p src/shared/api
git mv src/lib/axios.ts src/shared/api/axios.ts
```

- [ ] **Step 2: Extrair os tipos de envelope para `types.ts`**

Criar `src/shared/api/types.ts` com o conteúdo (movido de axios.ts):

```typescript
export interface ResultApi<T = unknown> {
  success: boolean;
  message?: string;
  result?: T;
  errors?: Record<string, string[]>;
}

export interface ApiError extends Error {
  response?: {
    data: ResultApi;
    status: number;
    statusText: string;
  };
  errors?: Record<string, string[]>;
  statusCode?: number;
}
```

- [ ] **Step 3: Ajustar `axios.ts` para importar os tipos**

Em `src/shared/api/axios.ts`, remover as declarações `interface ResultApi` e `export interface ApiError` (agora em types.ts) e adicionar no topo, logo após o `declare global { ... }`:

```typescript
import type { ApiError, ResultApi } from "./types";
```

Reexportar `ApiError` para não quebrar quem importa de axios (compatibilidade durante a migração):

```typescript
export type { ApiError } from "./types";
```

> Nota: `ResultApi<T = any>` original usava `any`; ao mover, trocar para `unknown` é uma melhoria segura. Verificar no Step 5 que nada quebra; se `tsc` reclamar de uso de `.result` sem narrowing, reverter esse parâmetro para `any` (não é o foco desta refatoração).

- [ ] **Step 4: Atualizar os 8 hooks de query para o novo caminho**

Em cada arquivo abaixo, trocar `from '@/lib/axios'` por `from '@/shared/api/axios'`:
- `src/hooks/queries/useAuth.ts` (importa `api, ApiError`)
- `src/hooks/queries/useCodeGenerator.ts`
- `src/hooks/queries/useCryptography.ts`
- `src/hooks/queries/useDatabase.ts`
- `src/hooks/queries/useInputHistory.ts`
- `src/hooks/queries/useMetadata.ts`
- `src/hooks/queries/useProject.ts`
- `src/hooks/queries/useUsers.ts`

- [ ] **Step 5: Verificar compilação**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros. (`src/lib/` agora vazio — ok, será removido na Task de limpeza.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(frontend): move axios para shared/api e extrai tipos de envelope"
```

---

## Task 2: Criar `shared/theme`

**Files:**
- Move: `src/theme/index.ts` → `src/shared/theme/index.ts`
- Move: `src/theme/theme.d.ts` → `src/shared/theme/theme.d.ts`
- Modify (imports): `src/main.tsx` (importa `@/theme`)

**Interfaces:**
- Produces: `lightTheme`, `darkTheme` de `@/shared/theme`.

- [ ] **Step 1: Mover a pasta theme**

```bash
cd Development.Assistant/frontend
mkdir -p src/shared/theme
git mv src/theme/index.ts src/shared/theme/index.ts
git mv src/theme/theme.d.ts src/shared/theme/theme.d.ts
```

- [ ] **Step 2: Atualizar import em main.tsx**

Em `src/main.tsx`, trocar:
```typescript
import { lightTheme, darkTheme } from '@/theme'
```
por:
```typescript
import { lightTheme, darkTheme } from '@/shared/theme'
```

- [ ] **Step 3: Verificar compilação**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(frontend): move theme para shared/theme"
```

---

## Task 3: Criar `shared/hooks` (useTheme, useInputHistory, useMetadata)

**Files:**
- Move/rename: `src/hooks/useTheme.ts` → `src/shared/hooks/use-theme.ts`
- Move/rename: `src/hooks/queries/useInputHistory.ts` → `src/shared/hooks/use-input-history.ts`
- Move/rename: `src/hooks/queries/useMetadata.ts` → `src/shared/hooks/use-metadata.ts`
- Modify (imports): `src/main.tsx`, `src/App.tsx`, `src/pages/login.tsx`, `src/components/InputWithHistory.tsx`, `src/pages/compare-database.tsx`, `src/pages/generate-class.tsx`

**Interfaces:**
- Produces: `ThemeContext`, `useTheme`, `useThemeProvider` de `@/shared/hooks/use-theme`; `useInputHistory`, `useCreateInputHistory`, `useDeleteInputHistory` de `@/shared/hooks/use-input-history`; `useTemplates`, `useDatabaseTypes` de `@/shared/hooks/use-metadata`.

- [ ] **Step 1: Mover os três hooks compartilhados**

```bash
cd Development.Assistant/frontend
mkdir -p src/shared/hooks
git mv src/hooks/useTheme.ts src/shared/hooks/use-theme.ts
git mv src/hooks/queries/useInputHistory.ts src/shared/hooks/use-input-history.ts
git mv src/hooks/queries/useMetadata.ts src/shared/hooks/use-metadata.ts
```

- [ ] **Step 2: Ajustar imports internos dos hooks movidos**

Em `src/shared/hooks/use-input-history.ts` e `src/shared/hooks/use-metadata.ts`, trocar `from '@/lib/axios'` por `from '@/shared/api/axios'` (caso a Task 1 já não tenha pego — confirmar). `use-theme.ts` não importa caminhos locais.

- [ ] **Step 3: Atualizar consumidores de useTheme**

- `src/main.tsx`: `from '@/hooks/useTheme'` → `from '@/shared/hooks/use-theme'`
- `src/App.tsx`: `from "@/hooks/useTheme"` → `from "@/shared/hooks/use-theme"`
- `src/pages/login.tsx`: `from "@/hooks/useTheme"` → `from "@/shared/hooks/use-theme"`

- [ ] **Step 4: Atualizar consumidores de useInputHistory e useMetadata**

- `src/components/InputWithHistory.tsx`: `from "@/hooks/queries/useInputHistory"` → `from "@/shared/hooks/use-input-history"`
- `src/pages/compare-database.tsx`: `from "@/hooks/queries/useMetadata"` → `from "@/shared/hooks/use-metadata"`
- `src/pages/generate-class.tsx`: `from "@/hooks/queries/useMetadata"` → `from "@/shared/hooks/use-metadata"`

- [ ] **Step 5: Verificar compilação**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(frontend): move useTheme, useInputHistory e useMetadata para shared/hooks"
```

---

## Task 4: Criar `shared/components`

**Files:**
- Move/rename: `src/components/InputWithHistory.tsx` → `src/shared/components/input-with-history.tsx`
- Move/rename: `src/components/InputSelect.tsx` → `src/shared/components/input-select.tsx`
- Move/rename: `src/components/ScrollToTopButton.tsx` → `src/shared/components/scroll-to-top-button.tsx`
- Modify (imports): `src/App.tsx` (ScrollToTopButton), `src/pages/compare-database.tsx`, `src/pages/copy-project.tsx`, `src/pages/cryptography-tools.tsx`, `src/pages/generate-class.tsx` (InputWithHistory/InputSelect)

> `PrivateRoute.tsx` NÃO vai para shared — vai para `features/auth` na Task 5.

**Interfaces:**
- Produces: `InputWithHistory` de `@/shared/components/input-with-history`; `InputSelect` de `@/shared/components/input-select`; `ScrollToTopButton` de `@/shared/components/scroll-to-top-button`.

- [ ] **Step 1: Mover os três componentes genéricos**

```bash
cd Development.Assistant/frontend
mkdir -p src/shared/components
git mv src/components/InputWithHistory.tsx src/shared/components/input-with-history.tsx
git mv src/components/InputSelect.tsx src/shared/components/input-select.tsx
git mv src/components/ScrollToTopButton.tsx src/shared/components/scroll-to-top-button.tsx
```

- [ ] **Step 2: Confirmar import interno do InputWithHistory**

Em `src/shared/components/input-with-history.tsx`, o import de `useInputHistory` já deve apontar para `@/shared/hooks/use-input-history` (ajustado na Task 3 Step 4). Confirmar; se ainda apontar para o caminho antigo, corrigir.

- [ ] **Step 3: Atualizar consumidores**

- `src/App.tsx`: `from "@/components/ScrollToTopButton"` → `from "@/shared/components/scroll-to-top-button"`
- `src/pages/compare-database.tsx`: `from "@/components/InputSelect"` → `from "@/shared/components/input-select"`; `from "@/components/InputWithHistory"` → `from "@/shared/components/input-with-history"`
- `src/pages/copy-project.tsx`: `from "@/components/InputWithHistory"` → `from "@/shared/components/input-with-history"`
- `src/pages/cryptography-tools.tsx`: `from "@/components/InputWithHistory"` → `from "@/shared/components/input-with-history"`
- `src/pages/generate-class.tsx`: `from "@/components/InputSelect"` → `from "@/shared/components/input-select"`; `from "@/components/InputWithHistory"` → `from "@/shared/components/input-with-history"`

- [ ] **Step 4: Verificar compilação**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(frontend): move componentes genéricos para shared/components"
```

---

## Task 5: Criar `features/auth` (login, useAuth, AuthContext, PrivateRoute)

**Files:**
- Move/rename: `src/pages/login.tsx` → `src/features/auth/login-page.tsx`
- Move/rename: `src/hooks/queries/useAuth.ts` → `src/features/auth/use-auth.ts`
- Move/rename: `src/contexts/AuthContext.tsx` → `src/features/auth/auth-context.tsx`
- Move/rename: `src/components/PrivateRoute.tsx` → `src/features/auth/private-route.tsx`
- Create: `src/features/auth/index.ts` (barrel)
- Modify (imports): `src/App.tsx`, `src/pages/profile.tsx`

**Interfaces:**
- Produces (via barrel `@/features/auth`): `LoginPage` (default re-export), `AuthProvider`, `useAuth`, `PrivateRoute`. Internamente: `useLogin`, `useValidateToken` de `./use-auth`; `SessionUser` (tipo renomeado de `User`).

- [ ] **Step 1: Mover os arquivos de auth**

```bash
cd Development.Assistant/frontend
mkdir -p src/features/auth
git mv src/pages/login.tsx src/features/auth/login-page.tsx
git mv src/hooks/queries/useAuth.ts src/features/auth/use-auth.ts
git mv src/contexts/AuthContext.tsx src/features/auth/auth-context.tsx
git mv src/components/PrivateRoute.tsx src/features/auth/private-route.tsx
```

- [ ] **Step 2: Ajustar imports internos entre arquivos de auth**

- `src/features/auth/use-auth.ts`: `from '@/lib/axios'` → `from '@/shared/api/axios'` (se não pego antes).
- `src/features/auth/auth-context.tsx`: `from '@/hooks/queries/useAuth'` → `from './use-auth'`.
- `src/features/auth/private-route.tsx`: `from '@/contexts/AuthContext'` → `from './auth-context'`.
- `src/features/auth/login-page.tsx`: `from "@/contexts/AuthContext"` → `from "./auth-context"`; `from "@/hooks/useTheme"` → `from "@/shared/hooks/use-theme"` (se não pego na Task 3).

- [ ] **Step 3: Renomear o tipo `User` de sessão para `SessionUser`**

Em `src/features/auth/auth-context.tsx`, renomear a `interface User { username; login }` para `interface SessionUser` e atualizar todas as referências internas (`User | null` → `SessionUser | null`, `updateStoredUser(nextUser: SessionUser)`, o tipo em `useState<SessionUser | null>`). Exportar: `export type { SessionUser }`.

> Motivo: desambiguar do `User` de domínio em `features/users` (`{ id, username, login }`). Profile usa `useAuth()` (sessão) e `useUsers` (domínio) ao mesmo tempo.

- [ ] **Step 4: Criar o barrel `index.ts`**

Criar `src/features/auth/index.ts`:

```typescript
export { default as LoginPage } from "./login-page";
export { AuthProvider, useAuth } from "./auth-context";
export type { SessionUser } from "./auth-context";
export { PrivateRoute } from "./private-route";
```

- [ ] **Step 5: Atualizar consumidores externos**

- `src/pages/profile.tsx`: `from "@/contexts/AuthContext"` → `from "@/features/auth"`.
- `src/App.tsx`: `from "@/contexts/AuthContext"` (AuthProvider, useAuth) → `from "@/features/auth"`; `from "@/components/PrivateRoute"` → `from "@/features/auth"`; o import `import LoginPage from "@/pages/login"` → `import { LoginPage } from "@/features/auth"`.

- [ ] **Step 6: Verificar compilação**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(frontend): cria feature auth (login, contexto, guard) e renomeia SessionUser"
```

---

## Task 6: Criar `features/users`

**Files:**
- Move/rename: `src/pages/users.tsx` → `src/features/users/users-page.tsx`
- Move/rename: `src/hooks/queries/useUsers.ts` → `src/features/users/use-users.ts`
- Create: `src/features/users/types.ts` (extrai `User`, `UserCreateDto`, `UserUpdateDto`)
- Create: `src/features/users/index.ts` (barrel)
- Modify (imports): `src/App.tsx`, `src/pages/profile.tsx`

**Interfaces:**
- Produces (via `@/features/users`): `UsersPage` (default re-export), `useUsers`, `useUser`, `useCreateUser`, `useUpdateUser`. Tipos: `User`, `UserCreateDto`, `UserUpdateDto` de `./types`.

- [ ] **Step 1: Mover os arquivos de users**

```bash
cd Development.Assistant/frontend
mkdir -p src/features/users
git mv src/pages/users.tsx src/features/users/users-page.tsx
git mv src/hooks/queries/useUsers.ts src/features/users/use-users.ts
```

- [ ] **Step 2: Extrair tipos para `types.ts`**

Criar `src/features/users/types.ts` movendo as três interfaces de `use-users.ts`:

```typescript
export interface User {
  id: number;
  username: string;
  login: string;
}

export interface UserCreateDto {
  username: string;
  login: string;
  password: string;
}

export interface UserUpdateDto {
  id: number;
  username: string;
  login: string;
  password: string;
}
```

- [ ] **Step 3: Ajustar `use-users.ts`**

Em `src/features/users/use-users.ts`: remover as interfaces movidas, adicionar `import type { User, UserCreateDto, UserUpdateDto } from "./types";`, e trocar `from '@/lib/axios'` → `from '@/shared/api/axios'` (se não pego antes).

- [ ] **Step 4: Ajustar `users-page.tsx`**

Em `src/features/users/users-page.tsx`: a página declara seu próprio `interface User` (linha 36). Trocar por `import type { User } from "./types";` e remover a interface local. Atualizar o import do hook: `from "@/hooks/queries/useUsers"` → `from "./use-users"`.

> Confirmar que o `User` local da página é idêntico ao de types.ts (`{ id, username, login }`); se a página usar um shape diferente, manter o dela e NÃO unir — registrar no commit.

- [ ] **Step 5: Criar o barrel**

Criar `src/features/users/index.ts`:

```typescript
export { default as UsersPage } from "./users-page";
export { useUsers, useUser, useCreateUser, useUpdateUser } from "./use-users";
export type { User, UserCreateDto, UserUpdateDto } from "./types";
```

- [ ] **Step 6: Atualizar consumidores externos**

- `src/App.tsx`: `import UsersPage from "@/pages/users"` → `import { UsersPage } from "@/features/users"`.
- `src/pages/profile.tsx`: `from "@/hooks/queries/useUsers"` → `from "@/features/users"`.

- [ ] **Step 7: Verificar compilação**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(frontend): cria feature users com tipos extraídos"
```

---

## Task 7: Criar `features/profile`

**Files:**
- Move/rename: `src/pages/profile.tsx` → `src/features/profile/profile-page.tsx`
- Create: `src/features/profile/index.ts` (barrel)
- Modify (imports): `src/App.tsx`

**Interfaces:**
- Produces (via `@/features/profile`): `ProfilePage` (default re-export).
- Consumes: `useAuth` de `@/features/auth`; `useUsers`, `useUpdateUser` de `@/features/users`.

- [ ] **Step 1: Mover a página**

```bash
cd Development.Assistant/frontend
mkdir -p src/features/profile
git mv src/pages/profile.tsx src/features/profile/profile-page.tsx
```

- [ ] **Step 2: Ajustar imports internos**

Em `src/features/profile/profile-page.tsx`, os imports já devem ter sido atualizados nas Tasks 5/6 para `@/features/auth` e `@/features/users` (barrels). Confirmar que estão assim:
```typescript
import { useAuth } from "@/features/auth";
import { useUsers, useUpdateUser } from "@/features/users";
```

- [ ] **Step 3: Criar o barrel**

Criar `src/features/profile/index.ts`:

```typescript
export { default as ProfilePage } from "./profile-page";
```

- [ ] **Step 4: Atualizar App.tsx**

`src/App.tsx`: `import ProfilePage from "@/pages/profile"` → `import { ProfilePage } from "@/features/profile"`.

- [ ] **Step 5: Verificar compilação**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(frontend): cria feature profile"
```

---

## Task 8: Criar `features/compare-database`

**Files:**
- Move/rename: `src/pages/compare-database.tsx` → `src/features/compare-database/compare-database-page.tsx`
- Move/rename: `src/hooks/queries/useDatabase.ts` → `src/features/compare-database/use-database.ts`
- Create: `src/features/compare-database/types.ts` (extrai `DatabaseClass`, `ConnectionStringDto`)
- Create: `src/features/compare-database/index.ts`
- Modify (imports): `src/App.tsx`

**Interfaces:**
- Produces (via `@/features/compare-database`): `CompareDatabasePage` (default re-export), `useCompareDatabases`. Tipos: `DatabaseClass`, `ConnectionStringDto`.

- [ ] **Step 1: Mover arquivos**

```bash
cd Development.Assistant/frontend
mkdir -p src/features/compare-database
git mv src/pages/compare-database.tsx src/features/compare-database/compare-database-page.tsx
git mv src/hooks/queries/useDatabase.ts src/features/compare-database/use-database.ts
```

- [ ] **Step 2: Extrair tipos**

Criar `src/features/compare-database/types.ts` movendo `interface DatabaseClass` (linha 4) e `interface ConnectionStringDto` (linha 27) de `use-database.ts`, prefixando com `export`. Copiar o shape exato dos campos do arquivo original (ler `use-database.ts` antes de mover para preservar os campos).

- [ ] **Step 3: Ajustar `use-database.ts`**

Remover as interfaces movidas; adicionar `import type { DatabaseClass, ConnectionStringDto } from "./types";`; trocar `from '@/lib/axios'` → `from '@/shared/api/axios'` (se não pego antes).

- [ ] **Step 4: Ajustar a página**

Em `compare-database-page.tsx`: `from "@/hooks/queries/useDatabase"` → `from "./use-database"`. (Os imports de `InputSelect`/`InputWithHistory`/`useMetadata` já viraram `@/shared/...` nas Tasks 3 e 4 — confirmar.)

- [ ] **Step 5: Criar barrel**

Criar `src/features/compare-database/index.ts`:

```typescript
export { default as CompareDatabasePage } from "./compare-database-page";
export { useCompareDatabases } from "./use-database";
export type { DatabaseClass, ConnectionStringDto } from "./types";
```

- [ ] **Step 6: Atualizar App.tsx**

`import CompareDatabasePage from "@/pages/compare-database"` → `import { CompareDatabasePage } from "@/features/compare-database"`.

- [ ] **Step 7: Verificar compilação**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(frontend): cria feature compare-database"
```

---

## Task 9: Criar `features/copy-project`

**Files:**
- Move/rename: `src/pages/copy-project.tsx` → `src/features/copy-project/copy-project-page.tsx`
- Move/rename: `src/hooks/queries/useProject.ts` → `src/features/copy-project/use-project.ts`
- Create: `src/features/copy-project/index.ts`
- Modify (imports): `src/App.tsx`

> `CopyProjectParams` é o único tipo; por ser pequeno e usado só aqui, mantê-lo inline em `use-project.ts` (não criar types.ts para um tipo só). YAGNI.

**Interfaces:**
- Produces (via `@/features/copy-project`): `CopyProjectPage` (default re-export), `useCopyProject`, `useCopyProjectZip`.

- [ ] **Step 1: Mover arquivos**

```bash
cd Development.Assistant/frontend
mkdir -p src/features/copy-project
git mv src/pages/copy-project.tsx src/features/copy-project/copy-project-page.tsx
git mv src/hooks/queries/useProject.ts src/features/copy-project/use-project.ts
```

- [ ] **Step 2: Ajustar imports**

- `use-project.ts`: `from '@/lib/axios'` → `from '@/shared/api/axios'` (se não pego antes).
- `copy-project-page.tsx`: `from "@/hooks/queries/useProject"` → `from "./use-project"`. (`InputWithHistory` já é `@/shared/...` da Task 4.)

- [ ] **Step 3: Criar barrel**

Criar `src/features/copy-project/index.ts`:

```typescript
export { default as CopyProjectPage } from "./copy-project-page";
export { useCopyProject, useCopyProjectZip } from "./use-project";
```

- [ ] **Step 4: Atualizar App.tsx**

`import CopyProjectPage from "@/pages/copy-project"` → `import { CopyProjectPage } from "@/features/copy-project"`.

- [ ] **Step 5: Verificar compilação**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(frontend): cria feature copy-project"
```

---

## Task 10: Criar `features/generate-class`

**Files:**
- Move/rename: `src/pages/generate-class.tsx` → `src/features/generate-class/generate-class-page.tsx`
- Move/rename: `src/hooks/queries/useCodeGenerator.ts` → `src/features/generate-class/use-code-generator.ts`
- Create: `src/features/generate-class/types.ts` (extrai `InfoClass`)
- Create: `src/features/generate-class/index.ts`
- Modify (imports): `src/App.tsx`

**Interfaces:**
- Produces (via `@/features/generate-class`): `GenerateClassPage` (default re-export), `useGetAllTables`, `useCreateClass`. Tipo: `InfoClass`.

- [ ] **Step 1: Mover arquivos**

```bash
cd Development.Assistant/frontend
mkdir -p src/features/generate-class
git mv src/pages/generate-class.tsx src/features/generate-class/generate-class-page.tsx
git mv src/hooks/queries/useCodeGenerator.ts src/features/generate-class/use-code-generator.ts
```

- [ ] **Step 2: Extrair tipo**

Criar `src/features/generate-class/types.ts` movendo `interface InfoClass` (linha 4) de `use-code-generator.ts`, com `export`. Copiar o shape exato (ler o arquivo antes).

- [ ] **Step 3: Ajustar `use-code-generator.ts`**

Remover a interface movida; adicionar `import type { InfoClass } from "./types";`; trocar `from '@/lib/axios'` → `from '@/shared/api/axios'` (se não pego antes).

- [ ] **Step 4: Ajustar a página**

`generate-class-page.tsx`: `from "@/hooks/queries/useCodeGenerator"` (se houver) → `from "./use-code-generator"`. (`InputSelect`/`InputWithHistory`/`useMetadata` já são `@/shared/...`.) Confirmar o import do hook local — ler o topo do arquivo.

- [ ] **Step 5: Criar barrel**

Criar `src/features/generate-class/index.ts`:

```typescript
export { default as GenerateClassPage } from "./generate-class-page";
export { useGetAllTables, useCreateClass } from "./use-code-generator";
export type { InfoClass } from "./types";
```

- [ ] **Step 6: Atualizar App.tsx**

`import GenerateClassPage from "@/pages/generate-class"` → `import { GenerateClassPage } from "@/features/generate-class"`.

- [ ] **Step 7: Verificar compilação**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(frontend): cria feature generate-class"
```

---

## Task 11: Criar `features/cryptography`

**Files:**
- Move/rename: `src/pages/cryptography-tools.tsx` → `src/features/cryptography/cryptography-page.tsx`
- Move/rename: `src/hooks/queries/useCryptography.ts` → `src/features/cryptography/use-cryptography.ts`
- Create: `src/features/cryptography/index.ts`
- Modify (imports): `src/App.tsx`

> `CryptographyOperation` (type) é exportado pelo hook e consumido pela página; mantê-lo no hook (`use-cryptography.ts`) — é coeso com ele. Não criar types.ts.

**Interfaces:**
- Produces (via `@/features/cryptography`): `CryptographyPage` (default re-export), `useCryptography`, `CryptographyOperation` (type).

- [ ] **Step 1: Mover arquivos**

```bash
cd Development.Assistant/frontend
mkdir -p src/features/cryptography
git mv src/pages/cryptography-tools.tsx src/features/cryptography/cryptography-page.tsx
git mv src/hooks/queries/useCryptography.ts src/features/cryptography/use-cryptography.ts
```

- [ ] **Step 2: Renomear o componente para `CryptographyPage`**

Em `cryptography-page.tsx`, o componente já se chama `CryptographyToolsPage`. Renomear a função para `CryptographyPage` (`export default function CryptographyPage()`). É o único arquivo onde o nome do componente muda de fato (os outros já batem com o novo nome de arquivo).

- [ ] **Step 3: Ajustar imports**

- `use-cryptography.ts`: `from '@/lib/axios'` → `from '@/shared/api/axios'` (se não pego antes).
- `cryptography-page.tsx`: `from "@/hooks/queries/useCryptography"` → `from "./use-cryptography"`. (`InputWithHistory` já é `@/shared/...`.)

- [ ] **Step 4: Criar barrel**

Criar `src/features/cryptography/index.ts`:

```typescript
export { default as CryptographyPage } from "./cryptography-page";
export { useCryptography } from "./use-cryptography";
export type { CryptographyOperation } from "./use-cryptography";
```

- [ ] **Step 5: Atualizar App.tsx**

`import CryptographyToolsPage from "@/pages/cryptography-tools"` → `import { CryptographyPage } from "@/features/cryptography"`. Atualizar também o uso no `<Route>` (`<CryptographyToolsPage />` → `<CryptographyPage />`).

- [ ] **Step 6: Verificar compilação**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(frontend): cria feature cryptography e renomeia componente para CryptographyPage"
```

---

## Task 12: Criar `features/json-tools` e `features/base64-tools`

**Files:**
- Move/rename: `src/pages/json-tools.tsx` → `src/features/json-tools/json-tools-page.tsx`
- Move/rename: `src/pages/base64-tools.tsx` → `src/features/base64-tools/base64-tools-page.tsx`
- Create: `src/features/json-tools/index.ts`, `src/features/base64-tools/index.ts`
- Modify (imports): `src/App.tsx`

> Ambas são ferramentas client-side puras (sem hook de API). Só página + barrel. Os tipos locais do json-tools (`DiffType`, `DiffPath`, `PaletteColor`) ficam inline na página — são detalhes internos dela, não API pública. YAGNI.

**Interfaces:**
- Produces: `JsonToolsPage` de `@/features/json-tools`; `Base64ToolsPage` de `@/features/base64-tools` (ambos default re-export).

- [ ] **Step 1: Mover as duas páginas**

```bash
cd Development.Assistant/frontend
mkdir -p src/features/json-tools src/features/base64-tools
git mv src/pages/json-tools.tsx src/features/json-tools/json-tools-page.tsx
git mv src/pages/base64-tools.tsx src/features/base64-tools/base64-tools-page.tsx
```

- [ ] **Step 2: Criar os barrels**

`src/features/json-tools/index.ts`:
```typescript
export { default as JsonToolsPage } from "./json-tools-page";
```

`src/features/base64-tools/index.ts`:
```typescript
export { default as Base64ToolsPage } from "./base64-tools-page";
```

- [ ] **Step 3: Atualizar App.tsx**

- `import JsonToolsPage from "@/pages/json-tools"` → `import { JsonToolsPage } from "@/features/json-tools"`.
- `import Base64ToolsPage from "@/pages/base64-tools"` → `import { Base64ToolsPage } from "@/features/base64-tools"`.

- [ ] **Step 4: Verificar compilação**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros. (Neste ponto `src/pages/`, `src/hooks/queries/`, `src/contexts/`, `src/lib/` devem estar vazios.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(frontend): cria features json-tools e base64-tools"
```

---

## Task 13: Quebrar o `App.tsx` em `app/` (layout, router, providers)

**Files:**
- Create: `src/app/layout/nav-items.ts`
- Create: `src/app/layout/sidebar.tsx`
- Create: `src/app/layout/app-layout.tsx`
- Create: `src/app/app-router.tsx`
- Create: `src/app/app-providers.tsx`
- Create: `src/app/app.tsx`
- Delete (após mover conteúdo): `src/App.tsx`
- Modify: `src/main.tsx`
- Delete: `src/providers/AppProviders.tsx` (vazio)

**Interfaces:**
- Consumes: features via barrels (`@/features/*`), `ScrollToTopButton` de `@/shared/components/scroll-to-top-button`, `useTheme`/`useThemeProvider`/`ThemeContext` de `@/shared/hooks/use-theme`, `lightTheme`/`darkTheme` de `@/shared/theme`, `AuthProvider`/`useAuth`/`PrivateRoute`/`LoginPage` de `@/features/auth`.
- Produces: `App` (default) de `@/app/app`; `AppProviders` de `@/app/app-providers`.

- [ ] **Step 1: Criar `nav-items.ts`**

Criar `src/app/layout/nav-items.ts` com o array `navItems` (linhas 57-65 do App.tsx) e os imports de ícones que ele usa. Tipar o item:

```typescript
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
```

- [ ] **Step 2: Criar `sidebar.tsx`**

Criar `src/app/layout/sidebar.tsx` com o `SidebarContent` (linhas 70-372 do App.tsx) e o tipo `SidebarContentProps`. Exportar como `export function Sidebar(props: SidebarProps)` (renomear `SidebarContent`→`Sidebar`, `SidebarContentProps`→`SidebarProps`). Imports necessários: MUI components/icons usados na sidebar, `useLocation`/`useNavigate` de react-router-dom, `useTheme` de `@/shared/hooks/use-theme`, `useAuth` de `@/features/auth`, `navItems` de `./nav-items`. Copiar o corpo JSX **sem alterar o markup** (UI idêntica).

- [ ] **Step 3: Criar `app-layout.tsx`**

Criar `src/app/layout/app-layout.tsx` com o componente `Layout` (linhas 374-568) renomeado para `AppLayout`, mais as constantes `EXPANDED_WIDTH = 280` e `COLLAPSED_WIDTH = 88`. Imports: MUI (`Box`, `Drawer`, `AppBar`, `Toolbar`, `IconButton`, `Typography`, `useMediaQuery`, `useTheme as useMuiTheme`), ícones (`Menu`, `AutoAwesome`), `useLocation`/`useNavigate`, `useTheme` de `@/shared/hooks/use-theme`, `Sidebar` de `./sidebar`. `export function AppLayout({ children }: { children: React.ReactNode })`. Markup idêntico.

- [ ] **Step 4: Criar `app-router.tsx`**

Criar `src/app/app-router.tsx` com o `<Routes>` (linhas 576-644), importando as páginas pelos barrels de features e `PrivateRoute`/`LoginPage` de `@/features/auth`:

```typescript
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage, PrivateRoute } from "@/features/auth";
import { CompareDatabasePage } from "@/features/compare-database";
import { CopyProjectPage } from "@/features/copy-project";
import { GenerateClassPage } from "@/features/generate-class";
import { UsersPage } from "@/features/users";
import { JsonToolsPage } from "@/features/json-tools";
import { Base64ToolsPage } from "@/features/base64-tools";
import { CryptographyPage } from "@/features/cryptography";
import { ProfilePage } from "@/features/profile";

export function AppRouter() {
  return (
    <Routes>
      {/* copiar exatamente as <Route> do App.tsx, trocando
          <CryptographyToolsPage /> por <CryptographyPage /> */}
    </Routes>
  );
}
```

Copiar o conteúdo das `<Route>` verbatim do App.tsx (a única troca de nome é `CryptographyToolsPage` → `CryptographyPage`).

- [ ] **Step 5: Criar `app-providers.tsx`**

Criar `src/app/app-providers.tsx` consolidando os providers que hoje estão no `Root` de main.tsx (Theme + Snackbar) + `AuthProvider`:

```typescript
import { useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider } from "notistack";
import { ThemeContext, useThemeProvider } from "@/shared/hooks/use-theme";
import { lightTheme, darkTheme } from "@/shared/theme";
import { AuthProvider } from "@/features/auth";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const themeValue = useThemeProvider();
  const muiTheme = useMemo(
    () => (themeValue.theme === "dark" ? darkTheme : lightTheme),
    [themeValue.theme]
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          autoHideDuration={5000}
        >
          <AuthProvider>{children}</AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
```

- [ ] **Step 6: Criar `app.tsx`**

Criar `src/app/app.tsx` com a casca enxuta:

```typescript
import { BrowserRouter } from "react-router-dom";
import { ScrollToTopButton } from "@/shared/components/scroll-to-top-button";
import { AppLayout } from "./layout/app-layout";
import { AppRouter } from "./app-router";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTopButton />
      <AppLayout>
        <AppRouter />
      </AppLayout>
    </BrowserRouter>
  );
}
```

> Nota: `ScrollToTopButton` usa `useLocation`? Verificar — se sim, ele precisa estar DENTRO do `BrowserRouter` (está). O `App.tsx` original já o tinha dentro do BrowserRouter.

- [ ] **Step 7: Reescrever `main.tsx`**

Substituir todo o `src/main.tsx` por:

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/app";
import { AppProviders } from "@/app/app-providers";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
```

- [ ] **Step 8: Deletar o App.tsx antigo e o AppProviders vazio**

```bash
cd Development.Assistant/frontend
git rm src/App.tsx src/providers/AppProviders.tsx
```

- [ ] **Step 9: Verificar compilação**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "refactor(frontend): quebra App.tsx em app/ (layout, router, providers)"
```

---

## Task 14: Limpeza de pastas vazias e asset órfão + build final

**Files:**
- Delete: `public/vite.svg`
- Delete (pastas vazias): `src/pages/`, `src/hooks/`, `src/hooks/queries/`, `src/contexts/`, `src/lib/`, `src/components/`, `src/providers/`, `src/theme/`

- [ ] **Step 1: Remover o asset órfão**

```bash
cd Development.Assistant/frontend
git rm public/vite.svg
```

- [ ] **Step 2: Confirmar pastas vazias e removê-las**

Listar o que sobrou nas pastas antigas:
```bash
find src/pages src/hooks src/contexts src/lib src/components src/providers src/theme -type f 2>/dev/null
```
Expected: nenhuma saída (todas vazias). Git não rastreia pastas vazias, então elas somem do controle ao remover os arquivos; remover do disco se persistirem:
```bash
rmdir src/hooks/queries src/hooks src/pages src/contexts src/lib src/components src/providers src/theme 2>/dev/null || true
```

- [ ] **Step 3: Verificar a árvore final**

```bash
find src -type f | sort
```
Expected: apenas arquivos sob `src/app/`, `src/features/`, `src/shared/`, mais `src/main.tsx` e `src/vite-env.d.ts`. Conferir contra a "Estrutura de pastas alvo" do spec.

- [ ] **Step 4: Build completo de produção**

Run: `pnpm build`
Expected: `tsc -b` sem erros + `vite build` gerando `../wwwroot` sem erros. 0 warnings de TypeScript.

- [ ] **Step 5: Rodar o dev server e checar boot (sanity)**

Run: `pnpm dev` (em background); confirmar que sobe em http://localhost:3000 sem erro de console no boot; então encerrar.
Expected: app carrega, redireciona para /compare-database (ou /login se não autenticado). Sem tela branca/erro de import.

- [ ] **Step 6: Commit final**

```bash
git add -A
git commit -m "chore(frontend): remove asset órfão e pastas vazias pós-modularização"
```

---

## Verificação final (após todas as tasks)

- [ ] `pnpm build` passa com 0 erros e 0 warnings.
- [ ] `git diff --stat main..HEAD` mostra apenas movimentações/renomeações + as deleções listadas (App.tsx, AppProviders vazio, vite.svg).
- [ ] Nenhum arquivo restante em `src/pages`, `src/contexts`, `src/lib`, `src/providers`, `src/hooks/queries`, `src/components`, `src/theme`.
- [ ] A árvore de `src/` bate com a "Estrutura de pastas alvo" do spec.
- [ ] Boot do app no dev server sem erros de console.

## Self-Review (preenchido pelo autor do plano)

**Spec coverage:**
- Estrutura feature-based → Tasks 1-12 (shared + 9 features). ✅
- Quebra do App.tsx → Task 13. ✅
- Providers consolidados → Task 13 Step 5. ✅
- `User` vs `SessionUser` → Task 5 Step 3 + Task 6. ✅
- Helper de clipboard "só se idêntico" → coberto pela nota (não extrair, assinaturas divergem). ✅
- Tipos centralizados (ResultApi/ApiError) → Task 1. ✅
- Barrels → cada feature (Tasks 5-12). ✅
- Deleções (AppProviders vazio, vite.svg, pastas) → Tasks 13-14. ✅
- Nomenclatura kebab-case → aplicada em todos os `git mv`. ✅
- Alias `@/` mantido → nenhuma task altera vite/tsconfig. ✅

**Placeholder scan:** os blocos "copiar verbatim do App.tsx" (Sidebar/Layout/Routes) referenciam markup existente que o executor tem acesso ao ler o arquivo original antes de removê-lo — não são placeholders, são instruções de movimentação de código já existente e validado. Tipos extraídos (DatabaseClass, InfoClass) instruem "ler o arquivo antes de mover para copiar o shape exato" pelo mesmo motivo.

**Type consistency:** `SessionUser` (auth) e `User` (users) deliberadamente distintos. Nomes de componentes renomeados (`CryptographyToolsPage`→`CryptographyPage`, `SidebarContent`→`Sidebar`, `Layout`→`AppLayout`) usados consistentemente nos consumidores (App router). Barrels exportam exatamente os símbolos que os consumidores importam.
