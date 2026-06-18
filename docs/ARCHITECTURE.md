# Arquitetura — Development Assistant

Documento técnico único do projeto: camadas, padrões, fluxo de request, geração de código, autenticação, referência da API e convenções de código. Reflete a estrutura atual em camadas (`Api/`, `Domain/`, `Infrastructure/`, `Shared/`).

> Para visão geral, setup e comandos, veja o [`README.md`](../README.md) na raiz.

---

## 🏛 Visão geral das camadas

Arquitetura em camadas (N-tier) com separação clara de responsabilidades, inspirada em DDD mas sem o padrão tático completo (sem Aggregates nem Value Objects imutáveis ricos).

```
ASP.NET Core Host (Kestrel / Program.cs)
        │
        ▼
1. Middleware / Pipeline
   • ErrorHandlingMiddleware (exception → HTTP status + ResultApi)
   • CORS permissivo apenas em Development
   • Authentication (JWT Bearer) + Authorization
   • Static Files + SPA Fallback (MapFallbackToFile "index.html")
   • Swagger UI (apenas em Development)
        │
        ▼
2. Api/Controllers  — herdam de BaseController ([ApiController], rota api/[controller]/[action])
   recebem DTO → chamam Service → retornam ResultApi<T> via OkResult(...)
        │
        ▼
3. Domain/Services  — regras de negócio, orquestração, mapping
        │
        ▼
4. Infrastructure/Repositories  — Dapper + SQL parametrizado
        │
        ▼
5. Infrastructure
   • MySQL/MariaDB (banco interno da aplicação)
   • MySQL/SQL Server/Oracle/PostgreSQL (bancos-alvo do usuário)
   • Templates Scriban (.scriban) em disco
```

### Mapa de pastas

| Pasta | Responsabilidade |
|-------|------------------|
| `Api/Controllers` | Endpoints HTTP (herdam `BaseController`) |
| `Api/Dtos` | Contratos de entrada/saída (records) |
| `Api/Middleware` | `ErrorHandlingMiddleware` |
| `Domain/Models` | Modelos de domínio/dados (classes, sufixo `Mod`) |
| `Domain/Services` | Casos de uso e regras de negócio |
| `Domain/ValueObjects` | Objetos de valor internos (sufixo `Vo`) |
| `Infrastructure/Repositories` | Acesso a dados com Dapper |
| `Infrastructure/Database` | `SqlQueries.cs` (SQL por dialeto) |
| `Infrastructure/Templates` | Templates Scriban (`DDD_*`, `Clean_*`) |
| `Shared` | Constantes, exceptions, extensions, helpers |
| `Shared/Http` | `AccessExtensions` (extração de token/JWT do `HttpContext`) |

---

## 🧩 Serviços (Domain/Services)

| Serviço | Responsabilidade |
|---------|------------------|
| `AuthService` | Login, validação e geração de JWT. Delega verificação de senha a `PasswordService` |
| `PasswordService` | Hash e verificação de senha com **Argon2id** (isolado do `AuthService`) |
| `UserService` | CRUD de usuários (separado do `AuthService`) |
| `MetadataService` | Lista templates e tipos de banco (do banco interno) |
| `CompareDatabaseService` | Diff de schemas entre dois bancos (tabelas, colunas, contagens) |
| `ScribanCodeGeneratorService` | Geração de código via templates Scriban (núcleo do projeto) |
| `CopyProjectService` | Clonagem de projeto por path local ou por upload de `.zip`, com troca de namespace |
| `InputHistoryService` | Histórico de inputs do usuário (autocomplete) |

---

## 🔄 Fluxo de uma requisição (exemplo: login)

```
Cliente → POST /api/Auth/Login { login, password }
  AuthController.Login  → mapeia LoginDto para LoginVo (MapTo<LoginVo>)
    AuthService.Login(LoginVo)
      UserRepository.Search(login) → SELECT no banco interno
      PasswordService.VerifyPassword (Argon2id, FixedTimeEquals)
      AuthService.GenerateToken (JWT HS256, expira em 12h)
    ← ResultApi<string> (o JWT)
```

Se qualquer camada lança exceção, o `ErrorHandlingMiddleware` captura e converte para `ResultApi<object>` com `Success=false`, aplicando o status HTTP via pattern matching:

```csharp
var (statusCode, internalError) = exception switch
{
    UnauthorizedException => (HttpStatusCode.Unauthorized, 401),
    NotFoundException     => (HttpStatusCode.NotFound, 404),
    BadRequestException   => (HttpStatusCode.BadRequest, 400),
    _                     => (HttpStatusCode.InternalServerError, 500)
};
```

Todas essas exceções estão em `Shared/Exceptions/` (`AppException` é a base). **Sempre lance a exceção semântica adequada** — `throw new Exception(...)` genérico cai em 500 e perde a semântica HTTP. (Serviços como `AuthService`/`CopyProjectService` já seguem isso, lançando `UnauthorizedException`/`BadRequestException`/`NotFoundException`.)

---

## 🧱 Padrões utilizados

### Controllers

Todos herdam de `Api/Controllers/_BaseController.cs`:

```csharp
[ApiController]
[Route("api/[controller]/[action]")]
public abstract class BaseController : ControllerBase
{
    protected static ResultApi<T> OkResult<T>(T result) => new() { Result = result };
}
```

Consequências importantes:
- **A rota de cada endpoint é `api/<Controller>/<Método>`** em PascalCase. Ex.: `AuthController.Login` → `POST /api/Auth/Login`; `DatabaseController.CompareDatabases` → `POST /api/Database/CompareDatabases`.
- `[Authorize]` é aplicado **no controller** (não por método). `AuthController` usa `[AllowAnonymous]`.
- Endpoints que retornam arquivo (`.zip`) devolvem `IActionResult` via `File(...)` em vez de `ResultApi<T>`.

### Repository Pattern

Herança clássica via `Infrastructure/Repositories/_BaseRepository.cs`:

```csharp
public class BaseRepository
{
    protected readonly string _ConnStr;
    protected readonly int _UserLogged;

    public BaseRepository(ApiContext apiContext)
    {
        _UserLogged = apiContext.User;
        _ConnStr = apiContext.Conn;
    }

    protected IDbConnection Conn => new MySqlConnection(_ConnStr);
}
```

- `Conn` abre uma nova `MySqlConnection` **por operação** (`using var con = Conn`), confiando no connection pooling do driver.
- `BaseRepository` é fixo em **MySQL** para o banco interno. As queries multi-banco do `MetadataRepository` abrem conexões dos **bancos-alvo** separadamente (ver seção multi-banco).
- Não há interfaces (`IUserRepository`) nem CRUD genérico — cada repo escreve suas queries. Nomenclatura `_ConnStr`/`_UserLogged` (PascalCase com `_`) é uma inconsistência conhecida, mantida por consistência interna.

### Unit of Work — não implementado

Cada operação abre sua própria conexão e roda atomicamente (uma query por call). `InputHistoryService.Create(inputs)` faz N inserts em loop sem transação — aceitável para o caso de uso. Não há operações cross-repository que exijam atomicidade.

### Dependency Injection (Program.cs)

Todos os Services e Repositories são `Scoped`. O `ApiContext` é `Transient`, construído por request a partir do header `Authorization`:

```csharp
builder.Services.AddTransient(provider =>
{
    var apiContext = new ApiContext(connectionString);
    var http = provider.GetRequiredService<IHttpContextAccessor>();
    if (http.HttpContext == null) return apiContext;
    var token = http.HttpContext.GetToken();
    if (token.IsEmpty()) return apiContext;
    apiContext.User = token.DecodeJwt();   // userId do claim 'nameid'
    return apiContext;
});
```

Serviços registrados: `AuthService`, `PasswordService`, `UserService`, `MetadataService`, `CompareDatabaseService`, `ScribanCodeGeneratorService`, `CopyProjectService`, `InputHistoryService`. Repositórios: `BaseRepository`, `UserRepository`, `MetadataRepository`, `InputHistoryRepository`.

### `ApiContext` (Shared/ApiContext.cs)

```csharp
public class ApiContext
{
    public ApiContext(string conn) { Conn = conn; }
    public string Conn { get; set; }   // connection string interna (appsettings)
    public int User { get; set; }      // userId do JWT, 0 se anônimo
}
```

Injetado em `BaseRepository`, deixa o `userId` logado disponível em toda query (ex.: `input_history WHERE user = @user`).

### DTO / Mapping — `MapTo<T>()`

Mapping entre camadas via **extension member do C# 14** em `Shared/SerializerExt.cs` (classe `Serializer`):

```csharp
extension(object entityToSer)
{
    public string Serialize() => JsonSerializer.Serialize(entityToSer, JsonOptions);
    public TDestiny MapTo<TDestiny>() where TDestiny : class
        => entityToSer.Serialize().Deserialize<TDestiny>();
}
```

> ⚠️ O bloco `extension(...)` **não é erro de sintaxe** — é o recurso *extension members* do C# 14. Exige `LangVersion` 14 (configurado no `.csproj`).

É uma cópia via round-trip JSON (sem AutoMapper). `JsonOptions` usa `CamelCase`, ignora nulls na escrita e cicla referências. Pragmático para volumes pequenos; se virar gargalo, migrar para um source generator (Mapperly).

### Error Handling

Centralizado em `Api/Middleware/ErrorHandlingMiddleware.cs` (ver pattern matching acima). Resposta sempre no envelope `ResultApi<object>`.

---

## 🎨 Geração de código (pipeline Scriban)

`Domain/Services/ScribanCodeGeneratorService.cs` é o núcleo do projeto.

`CreateClassAsync(InfoClassDto)`:
1. Para cada tabela **em paralelo** (`Task.WhenAll`):
   - `MetadataRepository.GetColumnsQuery` lê colunas da tabela do banco-alvo.
   - Tipos SQL → C# via `Constants.GetCSharpType` (dicionário `Constants.DataType`).
   - Monta `DatabaseMetadataVo` (record).
   - Dispara N tarefas paralelas — uma por tipo de arquivo (Controller, Service, Repository, Dto, Model…), com a lista de tipos **diferente entre DDD e Clean** (hardcoded em `GenerateForTableAsync`).
   - Cada arquivo: lê o `.scriban` de `Templates/` → injeta `ScriptObject` montado por `Constants.MapInfo` → renderiza → adiciona ao `Dictionary<path, content>` (protegido por `lock`).
2. Empacota o dicionário num `.zip` em memória (`ZipArchive`) e retorna `byte[]`.

Regras especiais:
- Tabelas terminadas em `Text` geram um **subconjunto** reduzido de arquivos (ver `allowedTextTypes` em `GenerateAndSaveAsync`).
- `ExcludePrefixTable` remove um prefixo (ex.: `tb_`) do nome gerado.
- O caminho de saída de cada arquivo vem de `Constants.GetPath(typeClass)`.

**Os 4 pontos a manter em sincronia ao adicionar/alterar um tipo de arquivo gerado** (mais o `.scriban`):
1. enum `Constants.TypeClass`
2. `Constants.GetTemplateName` (TypeClass → nome do arquivo `.scriban`)
3. `Constants.GetPath` (TypeClass → pasta de saída)
4. a lista em `ScribanCodeGeneratorService.GenerateForTableAsync` (bloco `DDD` ou `Clean`)

Dados disponíveis dentro do template (definidos em `Constants.MapInfo`): `table_name`, `table_name_original`, `table_prop`, `project_name`, `namespace`, `columns`, `columns_key` (+ variações `columns_key_names`, `columns_key_assignments`, `columns_key_required_condition`), `exist_text`, `database`.

Templates copiados para `Templates/` no output via `<Content>` no `.csproj` (`PreserveNewest`). Ver a skill `add-scriban-template` em `.claude/skills/` para o passo a passo.

---

## 🗄 Suporte multi-banco

`Infrastructure/Repositories/MetadataRepository.cs` seleciona o SQL por dialeto via `switch` sobre `dbType` (constantes em `Constants.DbType`: `MariaDb`, `SqlServer`, `Oracle`, `PostgreSql`). O SQL fica em `Infrastructure/Database/SqlQueries.cs`, organizado por dialeto. A conexão certa é criada por `CreateDbConnection` (`MySqlConnection`/`SqlConnection`/`OracleConnection`/`NpgsqlConnection`).

Segurança: nomes de tabela/schema entram via `string.Format` mas passam por `ValidateIdentifier` (whitelist regex `^[A-Za-z_][A-Za-z0-9_]*$`). **Preserve essa validação** ao tocar nessas queries. Os valores de dados sempre vão por parâmetros Dapper (`@param`).

`CompareDatabaseService` aceita `dbType1`/`dbType2` distintos, permitindo comparar bancos de **tipos diferentes**.

Ver a skill `add-db-dialect` para adicionar um novo banco.

---

## 🔐 Autenticação

JWT Bearer com assinatura HMAC-SHA256; senhas com hash **Argon2id**. Todas as rotas exigem token, exceto as de `AuthController` (`[AllowAnonymous]`).

**Geração do token** (`AuthService.GenerateToken`): claims `NameIdentifier` (= userId, lido depois como `nameid`), `Name`, `Sub`, `Jti`; expira em 12h; issuer/audience de `Constants.JwtConfig`.

**Validação**: `Constants.JwtConfig.GetValidationParameters()` valida issuer, audience, lifetime e assinatura com `ClockSkew = TimeSpan.Zero` (expira no instante exato). Configurado no `Program.cs` via `AddJwtBearer`; o evento `OnChallenge` devolve 401 no envelope `ResultApi`.

**Extração do userId** (`Shared/Http/AccessExtensions.cs`): `GetToken` lê o header `Authorization`; `DecodeJwt` busca o claim `nameid` e retorna o `int` (lança `UnauthorizedException` se ausente/malformado).

**Hashing** (`PasswordService`): Argon2id com `DegreeOfParallelism=8`, `Iterations=4`, `MemorySize=65536` (64 MB), salt aleatório de 16 bytes (`RandomNumberGenerator`). Armazena `salt(16) + hash(32)` em Base64 (48 bytes). Verificação com `CryptographicOperations.FixedTimeEquals` (resistente a timing attack).

**Secrets**: `Constants.JwtConfig.SecretKey` vem de `Jwt:SecretKey` (user-secrets) ou da env `JWT_SECRET` — sem ele a app lança na inicialização. `ConnectionStrings:Default` idem (ver README).

> Nota: `Shared/HashHelper.cs` é coisa **diferente** — é cifra **simétrica AES reversível** (com IV aleatório prefixado) usada pelo `CryptographyController` para encriptar/decriptar connection strings, não para senhas.

---

## 🌐 Referência da API

- **Base URL** (dev): `http://localhost:5000` · **Swagger**: `/swagger`
- **Rota**: `api/<Controller>/<Método>` (PascalCase — ver seção Controllers)
- **Auth**: JWT Bearer em todos, exceto `AuthController`

### Envelope `ResultApi<T>`

```json
{ "success": true, "message": "", "internalError": 0, "result": <T> }
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `success` | bool | `false` em erro |
| `message` | string | mensagem de erro (vazia em sucesso) |
| `internalError` | long | 0 em sucesso; 400/401/404/500 em erro |
| `result` | T \| null | payload |

Endpoints de download (`CreateClass`, `CopyProjectZip`) **não** usam esse envelope — retornam `application/zip` binário.

### Endpoints

| Controller | Método / Rota | Verbo | Auth | DTO de entrada | Service |
|-----------|---------------|-------|------|----------------|---------|
| Auth | `/api/Auth/Login` | POST | 🔓 | `LoginDto` → `LoginVo` | `AuthService.Login` |
| Auth | `/api/Auth/ValidateToken?token=` | GET | 🔓 | — | `AuthService.ValidateToken` |
| User | `/api/User/Get?id=` | GET | 🔒 | — | `UserService.Get` |
| User | `/api/User/All` | GET | 🔒 | — | `UserService.All` |
| User | `/api/User/Create` | POST | 🔒 | `UserCreateDto` | `UserService.Create` |
| User | `/api/User/Update` | PUT | 🔒 | `UserUpdateDto` | `UserService.Update` |
| Metadata | `/api/Metadata/AllTemplate` | GET | 🔒 | — | `MetadataService.AllTemplate` |
| Metadata | `/api/Metadata/AllDatabaseType` | GET | 🔒 | — | `MetadataService.AllDatabaseType` |
| Database | `/api/Database/CompareDatabases` | POST | 🔒 | `ConnectionStringDto` | `CompareDatabaseService.CompareAsync` |
| CodeGenerator | `/api/CodeGenerator/AllTables` | POST | 🔒 | `ConnectionStringForSearchTablesDto` | `ScribanCodeGeneratorService.AllTables` |
| CodeGenerator | `/api/CodeGenerator/CreateClass` | POST | 🔒 | `InfoClassDto` | `ScribanCodeGeneratorService.CreateClassAsync` → **zip** |
| Project | `/api/Project/CopyProject` | POST | 🔒 | `CopyProjectDto` (paths locais) | `CopyProjectService.CopyProject` |
| Project | `/api/Project/CopyProjectZip` | POST | 🔒 | `multipart/form-data` (IFormFile + namespaces) | `CopyProjectService.CopyProjectZipAsync` → **zip** |
| Cryptography | `/api/Cryptography/Process` | POST | 🔒 | `CryptographyDto` (`Key`,`Operation`,`Text`) | `HashHelper.Encrypt/DecryptConnectionString` |
| InputHistory | `/api/InputHistory/All?input=&valueInput=&databaseType=` | GET | 🔒 | — (`input` é `[BindRequired]`) | `InputHistoryService.All` |
| InputHistory | `/api/InputHistory/Create` | POST | 🔒 | `CreateInputHistoryDto` | `InputHistoryService.Create` |
| InputHistory | `/api/InputHistory/Delete?id=` | DELETE | 🔒 | — | `InputHistoryService.Delete` |

Notas:
- `CompareDatabases` aceita `DbType1`/`DbType2` opcionais no `ConnectionStringDto` (fallback para `DbType`) → compara bancos de tipos diferentes.
- `Cryptography/Process` faz `switch` em `Operation` (`"Encrypt"`/`"Decrypt"`); valor inválido → `BadRequestException`.

### CORS

Permissivo **apenas em Development** (`AllowAnyHeader/Origin/Method`). Em produção não há política aberta por padrão — configure origens explícitas se a SPA for servida separadamente.

---

## ✍️ Convenções de código (C# 14 / .NET 10)

**Princípios**: simplicidade > complexidade empresarial; idiomas C# 14; consistência sobre preferência; build com **0 warnings**.

**Formatação**: 4 espaços; Allman braces; `if` de uma linha sem chaves quando trivial; preferir ternário/`switch expression` a blocos verbosos.

**Idiomas C# 14 (preferir)**:
- File-scoped namespaces (sempre). Namespace acompanha a pasta física.
- Primary constructors em Services/Repositories/Controllers.
- Records para DTOs/VOs. **Exceção**: Models do Dapper são **classes com setters públicos** (Dapper popula via reflection).
- Collection expressions (`[a, b]`), switch expressions, pattern matching em `switch` de exceções.
- Extension members (bloco `extension(...)`) — ver `MapTo<T>()`.

**Nomenclatura**:

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Classes/Métodos | PascalCase | `AuthService`, `GenerateToken` |
| Parâmetros/locais | camelCase | `connectionString` |
| Campos privados | `_camelCase` | *(exceção: `_ConnStr`/`_UserLogged` no BaseRepository)* |
| Sufixo DTO | `Dto` | `LoginDto`, `InfoClassDto` |
| Sufixo Model/Entity | `Mod` | `UserMod`, `TemplateMod` |
| Sufixo Value Object | `Vo` | `LoginVo`, `DatabaseMetadataVo` |

**Idioma**: mensagens de erro/logs voltadas ao usuário em **português** (usuários são pt-BR); nomes de código/entidades em inglês. Um módulo novo não deve introduzir mensagens de runtime em inglês.

**Evitar**: `throw new Exception("msg")` genérico (use as exceções de `Shared/Exceptions/`); `.Result`/`.Wait()` (use `await`); interpolar input em SQL (use `@param` + `ValidateIdentifier`); `Dictionary` compartilhado entre threads sem `lock`.

**Antes do commit**: `dotnet format --verify-no-changes` e `dotnet build` (0 warnings).

---

## 📊 Decisões arquiteturais (ADRs informais)

| # | Decisão | Justificativa | Descartado |
|---|---------|--------------|-----------|
| 1 | Dapper em vez de EF Core | Introspecção performática, queries simples | EF Core (overkill) |
| 2 | `MapTo<T>()` via JSON | Zero dependências | AutoMapper, Mapperly |
| 3 | JWT Bearer + Argon2id | Padrão de indústria, resistente a GPU | Cookie auth, bcrypt |
| 4 | System.Text.Json | Built-in, mais rápido | Newtonsoft.Json |
| 5 | Middleware único de erro | Centraliza exception→HTTP | try/catch por controller |
| 6 | Banco interno MySQL fixo | 1 driver interno, 4 externos | Banco interno plugável |
| 7 | SPA + API no mesmo host | 1 deploy, 1 porta | Frontend separado |

---

## ✅ Pendências conhecidas

- Ausência de testes (unitários/integração) e de logging estruturado.
- Templates Scriban devem ser validados compilando projetos gerados reais.
- `MetadataRepository` ainda monta SQL por dialeto com identificadores via `string.Format` (mitigado por `ValidateIdentifier`).
- Possível evolução: extrair interfaces de repositório, trocar `Dictionary`+`lock` por `ConcurrentDictionary` na geração.

---

**Última atualização**: 2026-06-18
