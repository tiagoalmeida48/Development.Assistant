using Development.Assistant.Back.Domain.Interfaces.Services;
using Development.Assistant.Back.Domain.Models;
using Development.Assistant.Back.Infra.CrossCutting;

namespace Development.Assistant.Back.GraphQL;

public class Mutation
{
    public async Task<CreatePocoClassResult> CreatePocoClass([Service] IScribanCodeGeneratorService pocoClassService, PocoClassInput input)
    {
        var pocoClass = new InfoClass
        {
            ConnectionString = input.ConnectionString,
            DbType = input.DbType,
            Tables = input.Tables,
            PathGeral = input.PathGeral,
            ProjectName = input.ProjectName,
            NameSpace = input.NameSpace
        };

        var success = await pocoClassService.CreateClassAsync(pocoClass);
        return new CreatePocoClassResult
        {
            Success = success,
            Message = success ? "Classes geradas com sucesso!" : "Erro ao gerar classes"
        };
    }

    public async Task<CopyProjectResult> CopyProject([Service] ICopyProjectService copyProjectService, string sourceProjectPath, string destinationProjectPath, string oldNamespace, string newNamespace)
    {
        try
        {
            await Task.Run(() => copyProjectService.CopyProject(sourceProjectPath, destinationProjectPath, oldNamespace, newNamespace));

            return new CopyProjectResult
            {
                Success = true,
                Message = "Projeto copiado com sucesso!"
            };
        }
        catch (Exception ex)
        {
            return new CopyProjectResult
            {
                Success = false,
                Message = $"Erro ao copiar projeto: {ex.Message}"
            };
        }
    }
}

public class PocoClassInput
{
    public string ConnectionString { get; set; }
    public Constants.DbType DbType { get; set; }
    public List<string> Tables { get; set; }
    public string PathGeral { get; set; }
    public string ProjectName { get; set; }
    public string NameSpace { get; set; }
}

public class CreatePocoClassResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
}

public class CopyProjectResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
}
