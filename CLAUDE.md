# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Para visão geral, stack, setup e comandos, leia primeiro o [`README.md`](README.md). A documentação técnica detalhada está consolidada em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (camadas, padrões, pipeline Scriban, multi-banco, autenticação, referência da API e convenções) — consulte antes de mexer na área correspondente. Este arquivo cobre só o que é difícil descobrir lendo o código.

Para tarefas recorrentes há skills e um agent em `.claude/`: skills **add-scriban-template** (novo tipo de arquivo gerado), **add-endpoint** (novo controller/service/repo) e **add-db-dialect** (novo banco); agent **dotnet-reviewer** (revisão das convenções deste repo). Eles disparam sozinhos pela descrição, mas vale invocá-los explicitamente quando a tarefa casar.

## Comandos do dia a dia

```bash
dotnet run --project Development.Assistant   # API em http://localhost:5000 (Swagger em /swagger)
dotnet build                                 # deve compilar com 0 warnings
dotnet format --verify-no-changes            # checar formatação antes de commitar
```
Frontend em `Development.Assistant/frontend/` (pnpm): `pnpm dev` (porta 3000), `pnpm build` (sai em `../wwwroot`). Não há suíte de testes no repositório.

## Pré-requisitos que travam a execução

- **Banco interno MySQL/MariaDB** obrigatório (tabelas `user`, `template`, `database_type`, `input_history`) — distinto dos bancos-alvo introspectados. `BaseRepository` está acoplado a `MySqlConnection` para esse banco.
- **Secrets locais** via `dotnet user-secrets` (`Jwt:SecretKey` com 32+ chars e `ConnectionStrings:Default`) — sem eles a app não sobe. `JWT_SECRET` (env) é fallback de `Jwt:SecretKey`. UserSecretsId = `development-assistant-local`.

## Arquitetura — o que exige ler vários arquivos

**Estrutura física** (reorganizada por tipo de artefato, não por camada): a maior parte do código vive em `Modules/` — `Modules/Record` (DTOs/records de contrato, namespace `Modules.Record`), `Modules/Models` (Models do Dapper, sufixo `Mod`), `Modules/Services`, `Modules/Vo` (value objects de comparação), `Modules/Repository` e `Modules/Common` (ex-`Shared` + `SqlQueries`). `Controllers/` e `Middleware/` ficam na raiz do projeto. **Não existe mais** `Api/`, `Domain/` nem `Infrastructure/`. Os templates `.scriban` ficam em `Modules/Services/Templates/`. Mapa completo em `docs/ARCHITECTURE.md → "Mapa de pastas"`.

**Fluxo de request**: Controller (recebe DTO, retorna `OkResult(...)` → `ResultApi<T>`) → Service (regra de negócio) → Repository (Dapper). Exceções sobem para `Middleware/ErrorHandlingMiddleware.cs`, mapeadas por tipo: `UnauthorizedException→401`, `NotFoundException→404`, `BadRequestException→400`, demais→500. **Sempre lance as exceções semânticas de `Modules/Common/Exceptions.cs` (namespace `Modules.Common`), nunca `throw new Exception(...)`** (genéricas viram 500 e perdem semântica HTTP — há dívida técnica existente assim).

**`ApiContext` (Modules/Common/ApiContext.cs)**: registrado como **Transient** em `Program.cs`, construído a partir do header `Authorization` (decodifica o JWT → `User` = userId, ou 0 se anônimo) + connection string interna. É injetado em `BaseRepository`, deixando o userId logado disponível em toda query (ex.: `input_history WHERE user = @user`).

**Geração de código (coração do projeto)** — `Modules/Services/ScribanCodeGeneratorService.cs`:
1. `CreateClassAsync(InfoClassRecord)` processa cada tabela em paralelo (`Task.WhenAll`); dentro de cada tabela, gera os N arquivos também em paralelo.
2. Por tabela: `MetadataRepository.GetColumnsQuery` lê colunas → tipos SQL mapeados para C# por `Constants.GetCSharpType` → monta `DatabaseMetadataRecord` → renderiza cada template `.scriban`.
3. O dicionário `path→conteúdo` compartilhado é protegido por `lock`. Resultado vira `.zip` em memória.
- O conjunto de arquivos gerados e os caminhos de saída diferem entre template **DDD** e **Clean** — ambos estão hardcoded em `GenerateForTableAsync`, com paths em `Constants.GetPath` e nomes de template em `Constants.GetTemplateName`.
- Tabelas terminadas em `Text` geram um subconjunto reduzido (ver `allowedTextTypes` em `GenerateAndSaveAsync`).
- **Ao adicionar/alterar um tipo de arquivo gerado**, mantenha sincronizados 4 pontos: o enum `Constants.TypeClass`, `GetTemplateName`, `GetPath` e a lista em `GenerateForTableAsync` — mais o `.scriban` correspondente.

**Templates Scriban** (`Modules/Services/Templates/*.scriban`): copiados para `Templates/` no output via `<Content>` no `.csproj` (`PreserveNewest`). Os dados disponíveis dentro do template são definidos por `Constants.MapInfo` (ex.: `table_name`, `columns`, `columns_key`, `namespace`). Prefixo `DDD_*` ou `Clean_*` no nome do arquivo.

**Multi-banco** (`Modules/Repository/MetadataRepository.cs`): cada operação seleciona o SQL por dialeto via `switch` sobre `dbType` (constantes em `Constants.DbType`); o SQL fica em `Modules/Common/Database/SqlQueries.cs`. Identificadores (nomes de tabela/schema) são interpolados via `string.Format` mas passam por `ValidateIdentifier` (whitelist regex) — ao tocar nessas queries, preserve essa validação.

**Frontend** — `lib/axios.ts` **desempacota o `ResultApi`**: em sucesso, substitui `response.data` por `data.result`; em `!success` lança `ApiError` com `message`/`errors`. Respostas 401/404 limpam `localStorage` e redirecionam para `/`. Token JWT guardado em `localStorage` e injetado como `Bearer` pelo interceptor de request. Sobre o modo `dynamic` da URL da API, ver README.

## Convenções essenciais (detalhes em docs/ARCHITECTURE.md → "Convenções de código")

- C# 14: file-scoped namespaces, primary constructors em Services/Repositories, records para DTOs/VOs, collection expressions, switch expressions. **Models mapeados por Dapper continuam classes com setters públicos.**
- Sufixos de tipo: `Record` (Modules/Record — contratos de API), `Mod` (Modules/Models — "Model" do Dapper), `Vo` (Modules/Vo — value objects de comparação).
- **Idioma**: mensagens de erro/logs voltadas ao usuário em **português** (usuários são pt-BR); nomes de código/entidades em inglês.
- Namespace acompanha a pasta física. Mapping entre camadas via `MapTo<T>()` (round-trip JSON, em `Modules/Common/Serializer.cs`) — sem AutoMapper.
