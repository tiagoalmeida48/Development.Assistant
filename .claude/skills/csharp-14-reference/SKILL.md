---
name: csharp-14-reference
description: Referência dos recursos de C# 14 / .NET 10 aplicáveis a este projeto (backend ASP.NET Core, Dapper, JWT). Use ao escrever ou revisar código C# para aplicar os idiomas modernos corretos — extension members (bloco extension), field keyword, null-conditional assignment no LHS, user-defined compound assignment, nameof de genéricos unbound, modificadores em lambdas. Disparar quando a tarefa envolver sintaxe C# moderna, dúvida sobre "isso é válido em C# 14?", ou revisão de idiomas de linguagem.
---

# Referência C# 14 / .NET 10 (aplicada a este projeto)

O projeto roda em `net10.0` com `<LangVersion>14</LangVersion>`. Use os recursos abaixo — todos já compilam aqui. Exemplos validados contra a doc oficial da Microsoft (C# 14, novembro/2025).

> Recursos do C# 14 **não cobertos** aqui por não se aplicarem ao backend (Dapper/JWT, sem Blazor/EF/Span pesado): conversões implícitas de `Span<T>`/`ReadOnlySpan<T>`, partial events/constructors. Consulte a doc oficial se precisar.

## Extension members (bloco `extension`)

A grande novidade. Permite **extension properties** e membros estáticos, não só métodos. A sintaxe é um **bloco `extension(receiver)`** dentro de uma classe estática — **não** o antigo `this` no parâmetro.

```csharp
public static class Enumerable
{
    extension<TSource>(IEnumerable<TSource> source)   // membros de instância
    {
        public bool IsEmpty => !source.Any();                       // extension property
        public IEnumerable<TSource> Where(Func<TSource, bool> p) { ... }  // extension method
    }

    extension<TSource>(IEnumerable<TSource>)          // só o tipo → membros estáticos
    {
        public static IEnumerable<TSource> Identity => Enumerable.Empty<TSource>();
    }
}
```

**Já em uso no projeto** — `Modules/Common/Serializer.cs`:
```csharp
extension(object entityToSer)
{
    public string Serialize() => JsonSerializer.Serialize(entityToSer, JsonOptions);
    public TDestiny MapTo<TDestiny>() where TDestiny : class
        => entityToSer.Serialize().Deserialize<TDestiny>();
}
```
> Ao ver `extension(...)` no código, **não confunda com erro de sintaxe** — é recurso válido do C# 14.

## `field` keyword (field-backed properties)

Acessa o backing field gerado sem declarar um campo privado manual. Útil para validação em setter:
```csharp
public int Value
{
    get => field;
    set => field = value > 0 ? value : 0;
}
```
> Cuidado: se a classe já tiver um membro chamado `field`, há ambiguidade — qualifique com `this.field` ou renomeie.

## Null-conditional assignment (no LHS)

`?.` e `?[]` agora funcionam no **lado esquerdo** de uma atribuição. O RHS só é avaliado se o LHS não for nulo:
```csharp
customer?.Order = GetCurrentOrder();   // equivale a: if (customer is not null) customer.Order = GetCurrentOrder();
dict?[key] = value;
```

## User-defined compound assignment

Tipos podem definir `+=`, `-=` etc. diretamente (e operadores de incremento/decremento), em vez de só o operador binário. Relevante apenas se criar tipos numéricos/valor — não há caso no backend atual.

## `nameof` de genéricos unbound

```csharp
nameof(List<>)         // "List"
nameof(Dictionary<,>)  // "Dictionary"
```

## Modificadores em lambdas simples

Lambdas com parâmetros sem tipo explícito aceitam `ref`/`in`/`out`/`scoped`:
```csharp
var increment = (ref int x) => x++;
```

---

## Idiomas já adotados no projeto (manter)

Estes não são novidade do C# 14, mas são o padrão deste repo — use sempre:

- **File-scoped namespaces**: `namespace Development.Assistant.Domain.Services;`
- **Primary constructors** em services/repositories/controllers: `public class AuthService(UserRepository userRep, PasswordService pwd)`
- **Records** para DTOs/VOs: `public record LoginDto(string Login, string Password);`
  - Exceção: **Models do Dapper são classes com setters públicos** (Dapper popula via reflection).
- **Collection expressions**: `Task[] tasks = [GenA(), GenB()];`
- **Switch expressions** e **pattern matching** (incl. property/relational/logical patterns — disponíveis desde versões anteriores), como em `IntrospectionRepository` e `ErrorHandlingMiddleware`.

## Notas .NET 10 relevantes ao backend

- **APIs retornam 401/403 em vez de redirects** — alinhado ao uso de JWT Bearer aqui (sem cookie auth).
- **System.Text.Json** é o serializador do projeto (não Newtonsoft) — ver `JsonOptions` em `Serializer.cs`.
- LTS até novembro/2028.

Convenções completas do projeto em `docs/ARCHITECTURE.md` → "Convenções de código". Doc oficial: https://learn.microsoft.com/dotnet/csharp/whats-new/csharp-14
