---
name: add-db-dialect
description: Use ao adicionar suporte a um novo banco de dados (dialeto SQL) no introspector/gerador — além de MariaDB, SQL Server, Oracle e PostgreSQL. Cobre os pontos a atualizar juntos — Constants.DbType, SqlQueries por dialeto, os switch de MetadataRepository, CreateDbConnection com o driver ADO.NET correto, e o mapeamento de tipos SQL→C# em Constants.DataType. Disparar quando a tarefa mencionar "suportar <banco>", "novo dialeto", "adicionar driver de banco" ou "introspectar outro banco".
---

# Adicionar suporte a um novo banco (dialeto)

O acesso multi-banco vive em `Infrastructure/Repositories/MetadataRepository.cs` (seleção por `switch` sobre `dbType`) e `Infrastructure/Database/SqlQueries.cs` (SQL por dialeto). Os 4 dialetos atuais: `MariaDb`, `SqlServer`, `Oracle`, `PostgreSql`.

## Checklist

1. **Driver ADO.NET** (`Development.Assistant.csproj`): adicione o `PackageReference` do provider (ex.: `MySqlConnector`, `Microsoft.Data.SqlClient`, `Npgsql`, `Oracle.ManagedDataAccess`). Confira que o tipo de `IDbConnection` correspondente existe.

2. **Constante** em `Constants.DbType` (`Shared/Constants.cs`): adicione `public const string <Novo> = "<Novo>";`. O valor string é o que trafega da API (`dbType`).
   - Se o banco deve aparecer na UI, ele também precisa estar na tabela `database_type` do banco interno (lida por `MetadataService.AllDatabaseType`).

3. **SQL por dialeto** em `SqlQueries.cs`: crie a classe/seção do novo dialeto com as queries equivalentes às existentes — no mínimo: `GetTables`, `GetColumns`, `GetCountRegisters`, `GetDatabaseName`. As colunas retornadas por `GetColumns` devem mapear para `ColumnInfo` (`Name`, `Type`, `IsPrimaryKey`, `IsIdentity`, `IsNullable`).
   - Atenção a placeholders: algumas queries usam `string.Format` (`{0}` = tabela, `{1}` = schema). Mantenha a mesma ordem dos argumentos usada no `MetadataRepository`.

4. **`MetadataRepository`**: adicione o `case` do novo `Constants.DbType` em **cada** `switch` que existe — `GetColumnsQuery`, `GetCountRegistersQuery`, `GetTablesQuery`, `GetDatabaseName` e **`CreateDbConnection`** (este último retornando a conexão concreta do novo driver). O branch `_ =>` lança `ArgumentException("DbType não suportado: ...")` — não esqueça nenhum switch, ou o banco falha só em algumas operações.
   - Preserve a chamada a `ValidateIdentifier` para nomes de tabela/schema (proteção contra injeção via identificador).

5. **Mapeamento de tipos** em `Constants.DataType` (`Shared/Constants.cs`): adicione as entradas `tipo_sql → tipo_csharp` específicas do novo banco que ainda não existam (ex.: tipos próprios do dialeto). `GetCSharpType` normaliza para lowercase e corta o `(` de tamanho; o default é `"string"`.

## Validação

- `dotnet build` (0 warnings).
- Teste com uma conexão real do novo banco: `POST /api/CodeGenerator/AllTables` (lista tabelas), `POST /api/Database/CompareDatabases` e `POST /api/CodeGenerator/CreateClass`. Confira que tabelas, colunas, tipos e contagem vêm corretos e que o código gerado tem os tipos C# certos.

Panorama em `docs/ARCHITECTURE.md` (seção "Suporte multi-banco").
