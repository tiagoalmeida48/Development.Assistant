---
name: add-endpoint
description: Use ao adicionar um novo endpoint HTTP, controller, service ou repository no backend ASP.NET Core (Development.Assistant). Aplica os padrões do projeto — herança de BaseController, rota api/[controller]/[action], envelope ResultApi<T> via OkResult, exceções semânticas de Shared/Exceptions, mapping MapTo<T>, registro no DI do Program.cs, e mensagens de runtime em português. Disparar quando a tarefa mencionar "novo endpoint", "novo controller", "nova rota", "novo service" ou "expor uma operação na API".
---

# Adicionar um endpoint / controller / service

Siga os padrões já estabelecidos (veja exemplos reais em `Api/Controllers/`). Camadas: **Controller → Service → Repository**.

## Controller (`Api/Controllers/`)

- **Herde de `BaseController`** (`_BaseController.cs`) — ele já traz `[ApiController]`, a rota `api/[controller]/[action]` e o helper `OkResult<T>`.
  - Consequência: a rota do endpoint é `api/<Controller>/<Método>` em **PascalCase** (ex.: método `CompareDatabases` → `POST /api/Database/CompareDatabases`). Não invente rotas kebab-case.
- **`[Authorize]` vai no controller** (classe), não por método. Use `[AllowAnonymous]` na classe apenas para endpoints públicos (como `AuthController`).
- **Primary constructor** para injetar o service: `public class FooController(FooService fooService) : BaseController`.
- Verbo HTTP explícito em cada método (`[HttpGet]`/`[HttpPost]`/`[HttpPut]`/`[HttpDelete]`).
- **Retorno**:
  - JSON normal → `ResultApi<T>` via `return OkResult(...)`. Nunca monte o `ResultApi` de sucesso na mão.
  - Download de arquivo → `IActionResult` via `return File(bytes, "application/zip", fileName)` (ver `CodeGeneratorController.CreateClass`).
- **Mapping entrada/saída** com `MapTo<T>()`: o controller mapeia o DTO de entrada para o VO/Model do domínio e o retorno do domínio para o DTO de saída. Ex.: `authService.Login(request.MapTo<LoginVo>())`, `userService.Get(id).MapTo<UserDto>()`.

## DTOs (`Api/Dtos/`)

- **`record`** com sufixo `Dto` e construtor posicional: `public record FooDto(string Bar, int Baz);`.
- Parâmetros obrigatórios em query string: `[BindRequired]` (ver `InputHistoryController.All`).

## Service (`Domain/Services/`)

- Classe com **primary constructor** injetando repositórios/outros services.
- Contém a regra de negócio. **Lance as exceções semânticas de `Shared/Exceptions/`** conforme o caso:
  - `BadRequestException` → 400 (validação/input inválido)
  - `UnauthorizedException` → 401 (auth/permissão)
  - `NotFoundException` → 404 (recurso inexistente)
  - **Nunca `throw new Exception(...)` genérico** (vira 500 e perde semântica HTTP).
- **Mensagens de erro em português** (os usuários são pt-BR). Nomes de código/identificadores em inglês.

## Repository (`Infrastructure/Repositories/`) — se precisar de dados

- Herde de `BaseRepository` (dá `Conn` e `_UserLogged`). Primary constructor passando `ApiContext` para a base.
- Dapper com **parâmetros** (`@param`) — nunca interpole input em SQL. Se um identificador (tabela/schema) precisar entrar via `string.Format`, valide com `ValidateIdentifier` antes (ver `IntrospectionRepository`).
- `using var con = Conn;` por operação (uma conexão por query, confia no pool).
- Para queries multi-banco, ver a skill `add-db-dialect`.

## Registrar no DI (`Program.cs`)

Adicione o novo Service/Repository como `Scoped`:
```csharp
builder.Services.AddScoped<FooService>();
builder.Services.AddScoped<FooRepository>();
```
Sem isso, a injeção falha em runtime.

## Validação

`dotnet build` (0 warnings) e teste o endpoint pelo Swagger (`/swagger`) com um token Bearer válido. Confirme o envelope `ResultApi` na resposta e o status HTTP correto em caso de erro.

Referência completa de padrões e da matriz de endpoints em `docs/ARCHITECTURE.md`.
