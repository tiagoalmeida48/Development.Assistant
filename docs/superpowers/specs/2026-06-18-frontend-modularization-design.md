# Modularização da arquitetura do frontend

**Data:** 2026-06-18
**Escopo:** `Development.Assistant/frontend/src`
**Tipo:** Refatoração arquitetural (sem mudança de comportamento visível) + limpeza interna

## Objetivo

Transformar o frontend de uma organização **por tipo técnico** (`pages/`, `components/`, `hooks/`) para uma organização **feature-based** (por domínio), na qual cada funcionalidade é uma pasta auto-contida. Quebrar o `App.tsx` monolítico, remover arquivos mortos, centralizar tipos compartilhados e padronizar nomenclatura de arquivos. **A UI renderizada deve ficar idêntica** — nenhuma mudança de comportamento para o usuário.

## Decisões tomadas (brainstorming)

1. **Estilo de módulo:** feature-based (por domínio).
2. **Escopo:** arquitetura + limpeza de código interna (dedup de tipos, helpers repetidos, imports mortos) — sem mudar a UI.
3. **Granularidade:** uma feature por página (9 features), com `auth/` abrigando o login.
4. **`PrivateRoute` + `AuthContext`** moram em `features/auth` (pertencem ao domínio de autenticação), não em `shared/`.
5. **Nomenclatura de arquivo:** **kebab-case** para nomes de arquivo; PascalCase apenas para o identificador do componente no código. Padrão de mercado 2025/2026 (Robin Wieruch, ecossistema Vercel) — evita bug de case-sensitivity entre Windows (dev) e Linux (CI), relevante aqui pois o build sai para `wwwroot`.
6. **`public/vite.svg`** é órfão → apagar.
7. **Alias:** mantém o `@/*` único já existente (vite + tsconfig). Sem sub-aliases novos.

## Estrutura de pastas alvo

```
src/
├── main.tsx                         # entry; monta <AppProviders><App/></AppProviders>
├── vite-env.d.ts
│
├── app/                             # casca da aplicação
│   ├── app.tsx                      # <BrowserRouter><ScrollToTopButton/><AppRouter/>
│   ├── app-router.tsx               # <Routes> + <Route> (extraído do App.tsx)
│   ├── app-providers.tsx            # ThemeContext + MUI ThemeProvider + CssBaseline + Snackbar + AuthProvider
│   └── layout/
│       ├── app-layout.tsx           # componente Layout atual
│       ├── sidebar.tsx              # SidebarContent extraído
│       └── nav-items.ts             # config de navegação (label/path/icon)
│
├── features/
│   ├── auth/
│   │   ├── login-page.tsx
│   │   ├── use-auth.ts              # useLogin / useValidateToken (hooks de query)
│   │   ├── auth-context.tsx         # AuthProvider + useAuth (sessão)
│   │   ├── private-route.tsx        # guard de rota autenticada
│   │   └── index.ts                 # barrel
│   ├── profile/
│   │   ├── profile-page.tsx
│   │   └── index.ts
│   ├── users/
│   │   ├── users-page.tsx
│   │   ├── use-users.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── compare-database/
│   │   ├── compare-database-page.tsx
│   │   ├── use-database.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── copy-project/
│   │   ├── copy-project-page.tsx
│   │   ├── use-project.ts
│   │   └── index.ts
│   ├── generate-class/
│   │   ├── generate-class-page.tsx
│   │   ├── use-code-generator.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── cryptography/
│   │   ├── cryptography-page.tsx
│   │   ├── use-cryptography.ts
│   │   └── index.ts
│   ├── json-tools/
│   │   ├── json-tools-page.tsx
│   │   └── index.ts
│   └── base64-tools/
│       ├── base64-tools-page.tsx
│       └── index.ts
│
└── shared/
    ├── api/
    │   ├── axios.ts                 # cliente + interceptors
    │   └── types.ts                 # ResultApi, ApiError
    ├── components/
    │   ├── input-with-history.tsx
    │   ├── input-select.tsx
    │   └── scroll-to-top-button.tsx
    ├── hooks/
    │   ├── use-theme.ts
    │   ├── use-input-history.ts     # genérico, usado pelo InputWithHistory
    │   └── use-metadata.ts          # databaseTypes/templates — usado por 2 features
    └── theme/
        ├── index.ts
        └── theme.d.ts
```

### Critério feature vs shared

Vai para `shared/` o que é importado por **2+ features** ou é **infraestrutura** (api, theme, componentes de UI genéricos):
- `use-metadata.ts` → shared (usado por `compare-database` e `generate-class`).
- `use-input-history.ts` → shared (consumido pelo componente compartilhado `InputWithHistory`).
- `InputWithHistory`, `InputSelect`, `ScrollToTopButton` → shared (genéricos).
- `axios` + tipos de envelope → shared.

Vai para a feature o que pertence a **um único domínio**:
- `PrivateRoute`, `AuthContext` → `features/auth`.
- Tipos específicos (`InfoClass`, `DatabaseClass`, `CopyProjectParams`, `User` de usuários) → `types.ts` da feature.

## Quebra do `App.tsx` (649 linhas → arquivos focados)

| Arquivo novo | O que recebe | ~linhas |
|---|---|---|
| `app/layout/sidebar.tsx` | `SidebarContent` + `SidebarContentProps` | ~300 |
| `app/layout/app-layout.tsx` | `Layout` + constantes `EXPANDED_WIDTH`/`COLLAPSED_WIDTH` | ~200 |
| `app/layout/nav-items.ts` | array `navItems` + tipo do item | ~15 |
| `app/app-router.tsx` | `<Routes>`/`<Route>` | ~80 |
| `app/app.tsx` | composição: `<BrowserRouter><ScrollToTopButton/><AppRouter/>` | ~15 |

`AuthProvider` sai do `App.tsx` e passa para `app-providers.tsx`.

## Providers — fluxo de composição

Hoje os providers estão espalhados (Theme+Snackbar em `main.tsx`, Auth em `App.tsx`, `AppProviders` vazio). Consolidar num único `app/app-providers.tsx`:

```
main.tsx
 └─ React.StrictMode
     └─ AppProviders            (ThemeContext + MUI ThemeProvider + CssBaseline + Snackbar + AuthProvider)
         └─ App
             └─ BrowserRouter → ScrollToTopButton + AppRouter → AppLayout → páginas
```

`BrowserRouter` fica no `App` (roteamento), estado global fica nos providers. `useThemeProvider` continua em `shared/hooks/use-theme.ts`; o `app-providers.tsx` o consome para alimentar o `ThemeContext.Provider` e o `ThemeProvider` do MUI (lógica idêntica à do `Root` atual em `main.tsx`).

## Limpeza interna (sem mudar UI)

- **Tipos de envelope** (`ResultApi`, `ApiError`) → `shared/api/types.ts` (hoje presos em `axios.ts`).
- **`User` duplicado:** existe em `auth-context.tsx` (`{ username, login }`) e em `use-users.ts` (registro completo). São conceitos distintos. Manter separados e renomear o de sessão para `SessionUser` em `features/auth`, deixando `User` como o registro de domínio em `features/users/types.ts`. Não forçar união.
- **Helpers repetidos:** "copiar para clipboard" aparece em cryptography/json/base64. Extrair para `shared/hooks/use-clipboard.ts` **apenas se idêntico** em 2+ lugares (confirmar caso a caso na execução; se divergirem, deixar como está).
- **Imports mortos / redundantes:** removidos. `noUnusedLocals`/`noUnusedParameters` (já ligados no tsconfig) denunciam sobras.
- **Barrels (`index.ts`):** cada feature exporta sua página (e API pública) via barrel; `app-router.tsx` importa de `@/features/cryptography` em vez do caminho do arquivo.

## Imports e aliases

- Alias `@/*` (vite.config.ts + tsconfig.json) **mantido**. Todos os imports passam a `@/app/...`, `@/features/...`, `@/shared/...`.
- Sem sub-aliases novos — menos config para quebrar.

## Deleções

| Item | Motivo |
|---|---|
| `src/providers/app-providers.tsx` (atual, vazio) | wrapper `<>{children}</>` inútil — substituído pelo real em `app/` |
| `src/providers/` (pasta) | fica vazia após a movimentação |
| `src/contexts/` (pasta) | esvaziada (AuthContext vai para features/auth) |
| `src/lib/` (pasta) | esvaziada (axios vai para shared/api) |
| `public/vite.svg` | asset boilerplate órfão (index.html usa `/favicon.ico`) |

**Não deletados:** os 4 componentes, 8 hooks de query e 9 páginas — apenas movidos e renomeados.

## Convenção de nomenclatura (resumo)

- **Páginas:** `cryptography-page.tsx` → `export default function CryptographyPage()`.
- **Componentes:** `input-with-history.tsx` → `export function InputWithHistory()`.
- **Hooks:** `use-cryptography.ts` → `export function useCryptography()`.
- **Não-componentes:** `axios.ts`, `types.ts`, `nav-items.ts` (kebab).

## Verificação (critério de "pronto")

1. `pnpm build` (= `tsc -b && vite build`) passa com **0 erros**.
2. `pnpm tsc --noEmit` confirma nenhum import quebrado.
3. `git diff --stat` mostra apenas movimentações/renomeações esperadas + deleções listadas.
4. Inspeção: nenhum arquivo restante em `src/pages`, `src/contexts`, `src/lib`, `src/providers`, `src/hooks/queries`.
5. A árvore final bate com a "Estrutura de pastas alvo".

## Fora de escopo

- Mudanças visuais ou de comportamento nas páginas.
- Introdução de bibliotecas novas (ex.: react-query) — os hooks atuais permanecem como estão.
- Sub-aliases de import adicionais.
- Refatoração não relacionada à modularização.
```

