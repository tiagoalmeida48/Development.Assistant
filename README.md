# Development Assistant

Gerador de código C# multi-banco com interface web. Introspecta o schema de um banco de dados e gera um projeto C# completo nos padrões **DDD** ou **Clean Architecture** a partir das suas tabelas, empacotado como `.zip`. Inclui ainda comparação de schemas entre dois bancos, cópia de projetos com troca de namespace e ferramentas utilitárias (criptografia, Base64, JSON).

A aplicação é um único deploy: a **API ASP.NET Core** serve a **SPA React** a partir da mesma porta.

---

## ✨ Funcionalidades

- 🔍 **Introspecção de schema** de 4 bancos: MySQL/MariaDB, SQL Server, Oracle e PostgreSQL
- 🛠️ **Geração de código C#** (Controllers, Services, Repositories, DTOs, Models) nos padrões DDD ou Clean Architecture, via templates Scriban
- 📦 **Download em `.zip`** do projeto gerado
- 🔄 **Comparação de schemas** entre dois bancos (diferenças de tabelas/colunas + contagem de registros)
- 📁 **Cópia de projetos** com substituição de namespace em massa
- 🔐 **Autenticação** JWT Bearer com hash de senha Argon2id
- 📝 **Histórico de inputs** por usuário (autocomplete dos formulários)
- 🧰 **Ferramentas**: criptografia, Base64, formatação de JSON

---

## 🛠 Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime / Linguagem | .NET 10 (LTS) / C# 14 |
| Framework Web | ASP.NET Core |
| Acesso a dados | Dapper (sem EF Core) |
| Template engine | Scriban |
| Autenticação | JWT Bearer + Argon2id (Konscious) |
| Banco interno | MySQL / MariaDB |
| Frontend | React 19, MUI 7, Vite, react-router |
| Gerenciador de pacotes (front) | pnpm |

> Os pacotes EF Core no `.csproj` estão presentes apenas porque trazem os drivers ADO.NET (Npgsql/Oracle). O projeto usa **apenas Dapper**.

---

## 📦 Pré-requisitos

| Requisito | Versão mínima |
|-----------|---------------|
| .NET SDK | 10.0 |
| Node.js + pnpm | Node 18+ / pnpm 10 |
| MySQL ou MariaDB | 8.0+ / 10.6+ |
| Sistema operacional | Windows (`.csproj` usa `OutputType=WinExe`) |

A aplicação precisa de um banco **MySQL/MariaDB interno** para armazenar usuários, templates, tipos de banco e histórico de inputs — distinto dos bancos-alvo que você introspecta.

---

## 🚀 Início rápido

### 1. Backend

Configure os secrets locais (sem eles a aplicação não sobe):

```bash
dotnet user-secrets set "Jwt:SecretKey" "<uma chave com 32+ caracteres>"
dotnet user-secrets set "ConnectionStrings:Default" "Server=localhost;Database=development_assistant;User=<usuario>;Password=<senha>;"
```

> `JWT_SECRET` (variável de ambiente) é um fallback aceito para `Jwt:SecretKey`.

Restaure, compile e rode:

```bash
dotnet restore
dotnet build
dotnet run --project Development.Assistant
```

Disponível em:
- **API**: `http://localhost:5000`
- **Swagger UI**: `http://localhost:5000/swagger`
- **SPA (fallback)**: `http://localhost:5000/`

### 2. Frontend (desenvolvimento)

```bash
cd Development.Assistant/frontend
pnpm install
pnpm dev        # dev server em http://localhost:3000
```

Para gerar o build que a API serve (sai em `Development.Assistant/wwwroot`):

```bash
pnpm build
```

### 3. Autenticação

Faça login para obter o token e use-o como `Authorization: Bearer <token>` nos demais requests:

```bash
curl -X POST http://localhost:5000/api/Auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"senha"}'
```

---

## 🧩 Como funciona a geração de código

1. A SPA envia uma connection string, o tipo de banco, o template alvo (`DDD` ou `Clean`) e a lista de tabelas.
2. O backend lê o metadata de cada tabela (colunas, chaves, tipos), mapeia os tipos SQL para C# e renderiza os templates Scriban correspondentes.
3. Os arquivos gerados são organizados na estrutura de pastas do padrão escolhido e devolvidos como um `.zip` para download.

Detalhes do pipeline em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 📁 Estrutura

```
Development.Assistant/
├── Modules/          # Maior parte do código, organizado por tipo de artefato:
│   ├── Record/       #   DTOs/records de contrato da API (sufixo Record)
│   ├── Models/       #   Models do Dapper (sufixo Mod)
│   ├── Services/     #   Regras de negócio + Templates/ (.scriban)
│   ├── Vo/           #   Value objects de comparação (sufixo Vo)
│   ├── Repository/   #   Repositórios Dapper
│   └── Common/       #   Constantes, exceptions, helpers, SQL e ApiContext
├── Controllers/      # Controllers HTTP
├── Middleware/       # Middleware HTTP (ex.: ErrorHandlingMiddleware)
├── frontend/         # SPA React (Vite + MUI)
└── Program.cs        # Startup, DI e pipeline HTTP
docs/                 # Documentação detalhada
```

---

## 🔌 Modo "dynamic" do frontend

Por padrão a URL da API vem de `VITE_API_URL` no build. No build `dynamic` (`pnpm build:dynamic`), a URL é lida em **runtime** de `window.environment.URL` (definido em `frontend/public/config.js`) — permite apontar para outro endpoint sem recompilar.

---

## 📚 Documentação

| Documento | Conteúdo |
|-----------|----------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Documento técnico único: camadas, padrões, pipeline Scriban, multi-banco, autenticação, referência da API e convenções de código |
| [`CLAUDE.md`](CLAUDE.md) | Guia para o agente Claude Code |

---

## 📄 Licença

Projeto interno / pessoal. Sem licença pública declarada.
