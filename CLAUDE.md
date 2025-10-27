# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

Development Assistant é uma aplicação **ASP.NET Core + React SPA** (.NET 10.0) que fornece ferramentas de desenvolvimento para:
- Copiar projetos e renomear namespaces
- Comparar estruturas de bancos de dados
- Gerar classes POCO e camadas completas de arquitetura a partir de tabelas de banco de dados

**Arquitetura:**
- Backend: ASP.NET Core com GraphQL API
- Frontend: React 19 + TypeScript + TanStack Router + Zustand
- Build integrado: Frontend é compilado e servido pelo backend

## Comandos Comuns

### Build e Execução
```bash
# Build do projeto
dotnet build Development.Assistant.csproj

# Executar a aplicação
dotnet run --project Development.Assistant.csproj

# Publicar a aplicação
dotnet publish Development.Assistant.csproj -c Release
```

### Desenvolvimento
```bash
# Restaurar dependências
dotnet restore

# Watch mode (recarrega automaticamente)
dotnet watch run
```

### Testar GraphQL
```bash
# Após executar a aplicação, acesse:
# http://localhost:5000/graphql
# Interface Banana Cake Pop para testar queries e mutations

# Exemplos de queries estão em: Back/GraphQL/Examples.graphql
```

## Arquitetura

### Estrutura de Camadas

O projeto segue uma arquitetura em camadas organizada no diretório `Back/`:

```
Back/
├── Controllers/          # Controladores MVC
├── Domain/
│   ├── Interfaces/
│   │   ├── Repository/   # Interfaces de repositórios
│   │   └── Services/     # Interfaces de serviços
│   ├── Models/           # Modelos de domínio e classes auxiliares
│   │   └── GeneratorClass/  # Classes geradoras de código (partial classes)
│   └── Services/         # Implementações de serviços de domínio
├── GraphQL/              # API GraphQL (Query, Mutation, tipos)
└── Infra/
    ├── CrossCutting/     # Utilitários e constantes compartilhadas
    └── Repository/       # Implementações de repositórios
```

### Funcionalidades Principais

#### 1. CopyProjectService
- Copia projetos completos recursivamente
- Renomeia namespaces em todos os arquivos
- Ignora pastas: bin, obj, .vs, .git, .editorconfig, .gitattributes, .gitignore

#### 2. CompareDatabaseService
- Compara estruturas de dois bancos de dados
- Identifica diferenças em tabelas, colunas e quantidade de registros
- Suporta MySQL, SQL Server, Oracle e PostgreSQL
- **Performance:** Use `CompareAsync()` para melhor performance (até 100x mais rápido em bancos grandes)
  - Versão assíncrona paraleliza queries ao banco de dados
  - Usa Dictionary/HashSet para comparações O(n) em vez de O(n²)
  - Processa ambos bancos simultaneamente em vez de sequencialmente

#### 3. PocoClassService
- Gera camadas completas de código a partir de tabelas do banco de dados
- Cria automaticamente:
  - Controllers (Api)
  - DTOs (App layer)
  - Interfaces e Services (App e Domain)
  - Models (Domain)
  - Repositories

### Gerador de Código

O sistema de geração usa classes parciais em `Back/Domain/Models/GeneratorClass/`:
- `__GeneratorClass.cs` - Classe base partial
- `AppInterfaceClass.cs` - Gera interfaces da camada App
- `AppServicesClass.cs` - Gera serviços da camada App
- `DomainIRepositoryClass.cs` - Gera interfaces de repositório
- `DomainIServicesClass.cs` - Gera interfaces de serviço do domínio
- `DomainServicesClass.cs` - Gera serviços do domínio
- `RepositoryClass.cs` - Gera repositórios

A estrutura de pastas gerada segue o padrão:
```
1 - Api/Controllers
2 - App/Dto
2 - App/Interfaces
2 - App/Services
3 - Domain/Interfaces/Repository
3 - Domain/Interfaces/Services
3 - Domain/Models
3 - Domain/Services
4 - Repository
```

### Suporte a Bancos de Dados

O `BaseRepository` fornece queries específicas para cada tipo de banco:
- **MySQL** - Usa `SHOW TABLES`, `SHOW COLUMNS`
- **SQL Server** - Usa `INFORMATION_SCHEMA`
- **Oracle** - Usa `USER_TABLES`, `USER_TAB_COLUMNS`
- **PostgreSQL** - Usa `information_schema` com schema `dbo_schema`

### Dependências Principais

- **Dapper** (2.1.66) - Micro-ORM para acesso a dados
- **HotChocolate.AspNetCore** (14.1.0) - GraphQL server
- **HotChocolate.Data** (14.1.0) - GraphQL filtering/sorting
- **MySqlConnector** (2.4.0) - Driver MySQL
- **Microsoft.Data.SqlClient** (6.1.2) - Driver SQL Server
- **Oracle.EntityFrameworkCore** (9.23.26000) - Driver Oracle
- **Npgsql.EntityFrameworkCore.PostgreSQL** (9.0.4) - Driver PostgreSQL

### Injeção de Dependências

Registrado em `Program.cs`:
```csharp
// Serviços
builder.Services.AddScoped<ICopyProjectService, CopyProjectService>();
builder.Services.AddScoped<ICompareDatabaseService, CompareDatabaseService>();
builder.Services.AddScoped<IPocoClassService, PocoClassService>();
builder.Services.AddScoped<IBaseRepository, BaseRepository>();

// GraphQL
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>();
```

### API GraphQL

Endpoint disponível em: `/graphql`

**Queries disponíveis:**
- `compareDatabases` - Compara dois bancos de dados (async, otimizado)
- `getTables` - Lista tabelas de um banco
- `databaseTypes` - Retorna tipos de bancos suportados

**Mutations disponíveis:**
- `createPocoClass` - Gera classes POCO e camadas completas
- `copyProject` - Copia projeto e renomeia namespaces

**Exemplos:** Ver `Back/GraphQL/Examples.graphql`

### Utilitários

`Back/Infra/CrossCutting/Extensions.cs` - Métodos de extensão para:
- Conversão de strings para PascalCase
- Conversão de strings para camelCase
- Remoção de tipos de colunas em strings

`Back/Infra/CrossCutting/Constants.cs` - Contém:
- Enum `DbType` para tipos de banco de dados
- Dicionário `DataType` para mapeamento de tipos SQL para C#
- Método `GetPath()` para obter caminhos de geração de arquivos

## Frontend React (wwwroot/)

### Stack Tecnológica 2025

O frontend utiliza as tecnologias mais modernas do ecossistema React:

**Core:**
- React 19 - Server Components support
- TypeScript 5.7 - Type-safety completo
- Vite 6 - Build tool com HMR ultra-rápido

**UI & Styling:**
- TailwindCSS v4 - Utility-first CSS
- shadcn/ui - Componentes acessíveis (Button, Card, Input)
- lucide-react - Ícones modernos
- class-variance-authority - Gerenciamento de variantes

**Routing & Data:**
- TanStack Router v1.99 - Type-safe routing
- TanStack Query v5.62 - Server state management

**State Management:**
- Zustand v5 - State global minimalista

**API:**
- graphql-request - Cliente GraphQL leve

### Comandos Frontend

```bash
cd wwwroot

# Instalar dependências
yarn install

# Desenvolvimento (http://localhost:3000)
yarn dev

# Build para produção (output: ../dist/)
yarn build

# Preview do build
yarn preview

# Lint
yarn lint
```

### Estrutura Frontend

```
wwwroot/
├── src/
│   ├── api/              # Cliente e queries GraphQL
│   ├── components/ui/    # Componentes shadcn/ui
│   ├── lib/              # Utilitários (cn helper)
│   ├── pages/            # Páginas da aplicação
│   ├── routes/           # TanStack Router routes
│   ├── stores/           # Zustand stores
│   ├── styles/           # CSS global + Tailwind
│   └── types/            # TypeScript types
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md             # Documentação completa do frontend
```

### Proxy de Desenvolvimento

O Vite está configurado para fazer proxy de `/graphql` para `http://localhost:5000` durante desenvolvimento.

### Páginas Implementadas

- **Home** (`/`) - Dashboard com links para funcionalidades
- **Compare Database** (`/compare-database`) - Comparação de bancos
- **Copy Project** (`/copy-project`) - Cópia de projetos
- **POCO Class** (`/poco-class`) - Geração de classes

Ver `wwwroot/README.md` para documentação detalhada do frontend, incluindo exemplos de código e próximos passos.
