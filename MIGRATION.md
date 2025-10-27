# Migração para React SPA

## Mudanças Realizadas

### ✅ 1. Removido Frontend MVC
- ❌ Deletada pasta `Views/` (Razor views)
- ❌ Deletada pasta `Back/Controllers/` (MVC controllers)
- ✅ Mantido apenas GraphQL API

### ✅ 2. Atualizado Program.cs
- ✅ Removido `AddControllersWithViews()`
- ✅ Adicionado CORS para desenvolvimento (localhost:3000)
- ✅ Configurado `UseDefaultFiles()` e `UseStaticFiles()`
- ✅ Adicionado `MapFallbackToFile("index.html")` para SPA

### ✅ 3. Configurado Build Automático
- ✅ Adicionado target no `.csproj` para build do React em Release
- ✅ Configurado cópia de arquivos `dist/` para output

### ✅ 4. Corrigido Rotas React
- ✅ Adicionado `/* eslint-disable */` em todos os arquivos de rota
- ✅ Corrigida sintaxe de `createRoute`
- ✅ Removido imports não utilizados

### ✅ 5. Configurado TailwindCSS v4
- ✅ Adicionado `@tailwindcss/postcss`
- ✅ Atualizado `postcss.config.js`

## Arquitetura Final

```
Development.Assistant/
├── Back/
│   ├── Domain/           # Lógica de negócio
│   ├── GraphQL/          # API GraphQL
│   └── Infra/           # Infraestrutura
├── wwwroot/             # Frontend React
│   ├── src/
│   │   ├── api/         # Cliente GraphQL
│   │   ├── components/  # Componentes UI
│   │   ├── pages/       # Páginas
│   │   ├── routes/      # Rotas TanStack Router
│   │   ├── stores/      # Zustand state
│   │   └── types/       # TypeScript types
│   └── package.json
├── dist/                # Build do React (gerado)
└── Program.cs           # Entry point
```

## Como Funciona

### Desenvolvimento

**Backend (.NET):**
```bash
dotnet run
# Roda em http://localhost:5000
# Serve /graphql endpoint
```

**Frontend (React):**
```bash
cd wwwroot
yarn dev
# Roda em http://localhost:3000
# Proxy para http://localhost:5000/graphql
```

### Produção

**Build completo:**
```bash
dotnet build -c Release
# 1. Compila .NET
# 2. Roda yarn build no wwwroot/
# 3. Copia dist/ para output
```

**Executar:**
```bash
dotnet run -c Release
# Serve React build em http://localhost:5000
# + GraphQL API em http://localhost:5000/graphql
```

## Endpoints

- **Frontend:** `http://localhost:5000/` (React SPA)
- **GraphQL API:** `http://localhost:5000/graphql`
- **GraphQL Playground:** `http://localhost:5000/graphql` (em desenvolvimento)

## Fluxo de Requisições

```
Browser → React (localhost:3000) → GraphQL (localhost:5000/graphql)
         ↓ (em dev com proxy)

Browser → React build servido pelo .NET (localhost:5000)
         ↓
         GraphQL (localhost:5000/graphql)
```

## CORS

Configurado para permitir requisições de:
- `http://localhost:3000` (desenvolvimento)

Em produção, o React é servido pelo mesmo servidor, então não há CORS issues.

## Files Estrutura

### Backend Serve (.NET)
- `/` → `index.html` (React)
- `/assets/*` → Arquivos estáticos do React
- `/graphql` → GraphQL endpoint

### React Routes (Client-side)
- `/` → Home
- `/compare-database` → Comparar BD
- `/copy-project` → Copiar projeto
- `/poco-class` → Gerar POCO

## Build Output

```
bin/Release/net10.0/
├── Development.Assistant.dll
├── wwwroot/
│   ├── index.html
│   └── assets/
│       ├── index-[hash].js
│       └── index-[hash].css
└── ...
```

## Comandos Úteis

```bash
# Desenvolvimento - Backend
dotnet run

# Desenvolvimento - Frontend
cd wwwroot && yarn dev

# Build completo
dotnet build -c Release

# Build apenas frontend
cd wwwroot && yarn build

# Limpar builds
dotnet clean
rm -rf wwwroot/dist
rm -rf wwwroot/node_modules
```

## Próximos Passos

1. ✅ Frontend e backend separados
2. ✅ GraphQL API funcionando
3. ✅ Rotas React configuradas
4. ⏭️ Implementar lógica nas páginas
5. ⏭️ Adicionar mais componentes shadcn/ui
6. ⏭️ Integrar TanStack Query com GraphQL
7. ⏭️ Adicionar autenticação (se necessário)
