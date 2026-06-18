---
name: add-scriban-template
description: Use ao adicionar, alterar ou remover um TIPO de arquivo gerado pelo gerador de código Scriban (templates DDD_* ou Clean_* em Infrastructure/Templates). Garante que os 4 pontos de sincronização sejam atualizados juntos — enum Constants.TypeClass, GetTemplateName, GetPath e a lista em ScribanCodeGeneratorService.GenerateForTableAsync — além do próprio .scriban. Disparar sempre que a tarefa mencionar "novo template", "tipo de classe gerada", "adicionar arquivo ao código gerado" ou editar arquivos .scriban.
---

# Adicionar/alterar um tipo de arquivo gerado (Scriban)

O gerador (`Domain/Services/ScribanCodeGeneratorService.cs`) produz N arquivos por tabela. Cada **tipo** de arquivo está amarrado em 4 lugares + o template físico. Esquecer um deles quebra a geração em runtime (exceção de dicionário ou template não encontrado), **não** em compilação. Sempre atualize os 5 pontos.

## Checklist (na ordem)

1. **Criar o template** em `Development.Assistant/Infrastructure/Templates/<Nome>.scriban`.
   - Prefixo `DDD_` ou `Clean_` no nome do arquivo, conforme o padrão alvo.
   - Use os dados expostos por `Constants.MapInfo`: `{{ table_name }}`, `{{ table_name_original }}`, `{{ table_prop }}`, `{{ project_name }}`, `{{ namespace }}`, `{{ columns }}` (cada item: `Name`, `Type`, `IsPrimaryKey`, `IsIdentity`, `IsNullable`), `{{ columns_key }}` (+ `columns_key_names`, `columns_key_assignments`, `columns_key_required_condition`), `{{ exist_text }}`, `{{ database }}`.
   - O `.csproj` já copia `Infrastructure\Templates\*.scriban` para `Templates/` no output (`PreserveNewest`) — não precisa registrar o arquivo individualmente.

2. **Enum** `Constants.TypeClass` (`Shared/Constants.cs`): adicione o novo valor no grupo `DDD_*` ou `Clean_*`.

3. **`Constants.GetTemplateName`**: mapeie `TypeClass` → nome do `.scriban` (sem extensão). O nome do arquivo e o do mapa devem bater exatamente (atenção a maiúsculas, ex.: `Clean_GraphqlQuery`).

4. **`Constants.GetPath`**: mapeie `TypeClass` → pasta de saída dentro do zip (ex.: `@"2 - Application\Services"`). Esses caminhos definem a estrutura do projeto gerado.

5. **`ScribanCodeGeneratorService.GenerateForTableAsync`**: adicione um `GenerateAndSaveAsync(Constants.TypeClass.<Novo>, databaseMetadata, "<prefix>", "<suffix>", generatedFiles)` na lista correta (`infoClass.Template == Constants.Template.DDD` ou o `else` do Clean).
   - `prefix`/`suffix` compõem o nome do arquivo: `{prefix}{tableName}{suffix}.cs` (ex.: prefix `"I"`, suffix `"Service"` → `IClienteService.cs`).

## Regras especiais a considerar

- **Tabelas `*Text`**: em `GenerateAndSaveAsync`, a lista `allowedTextTypes` filtra quais tipos são gerados para tabelas terminadas em `Text`. Se o novo tipo deve existir para tabelas `Text`, inclua-o lá.
- **Agrupamento por pasta**: alguns tipos Clean (AppService/Get/Validation/GraphQl) são agrupados numa subpasta com o nome da tabela (`groupFolder`). Se o novo tipo precisar disso, adicione-o à condição correspondente.
- **Pós-processamento**: há ajustes pontuais de string (ex.: `Clean_AppRecord` faz `result.Replace(", )", ")")`). Replique se o template novo tiver o mesmo problema de vírgula pendente.

## Validação

Não há testes automatizados. Valide gerando de fato:
1. `dotnet build` (0 warnings).
2. Rode a app, chame `POST /api/CodeGenerator/CreateClass` com `template` e `tables` reais, e **abra o zip** conferindo: arquivo presente, no caminho certo, com conteúdo válido.
3. Idealmente, cole o arquivo gerado num projeto e confirme que **compila**.

Ver `docs/ARCHITECTURE.md` (seção "Geração de código") para o panorama do pipeline.
