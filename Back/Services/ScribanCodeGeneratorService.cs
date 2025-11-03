using Development.Assistant.Back.Models;
using Development.Assistant.Back.Utils;
using Scriban;
using Scriban.Runtime;
using Path = System.IO.Path;

namespace Development.Assistant.Back.Services;

public class ScribanCodeGeneratorService(BaseRepository repository, IWebHostEnvironment env)
{
    public IEnumerable<string> AllTables(string connectionString, Constants.DbType dbType)
    {
        return repository.GetTablesQuery(connectionString, dbType);
    }

    public async Task<bool> CreateClassAsync(InfoClass infoClass)
    {
        try
        {
            if (Directory.Exists(infoClass.PathGeral))
                Directory.Delete(infoClass.PathGeral, true);
            
            var tasks = infoClass.Tables.Select(table => GenerateForTableAsync(table, infoClass));
            await Task.WhenAll(tasks);

            return true;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao gerar classes: {ex.Message}");
        }
    }

    private async Task GenerateForTableAsync(string table, InfoClass infoClass)
    { 
        var tbName = table.ConvertToPascalCase();
        var tbProp = tbName.ConvertToCamelCase();

        var dbColumns = repository.GetColumnsQuery(infoClass.ConnectionString, infoClass.DbType, table);

        var columns = dbColumns.Select(c => new ColumnInfo
        {
            Name = c.Name.ConvertToPascalCase(),
            Type = Constants.DataType[c.Type.Split('(')[0]], // Mapear tipo SQL para C#
            IsPrimaryKey = c.IsPrimaryKey,
            IsIdentity = c.IsIdentity,
            IsNullable = c.IsNullable
        }).ToList();

        var columnsKey = string.Join(", ", columns.Where(c => c.IsPrimaryKey).Select(c => $"{c.Type} {c.Name.ConvertToCamelCase()}"));
        var existText = infoClass.Tables.Any(t => t.Equals($"{table}_text", StringComparison.InvariantCultureIgnoreCase));

        Task[] generateTasks;

        if (infoClass.Template == Constants.Template.DDD)
        {
            generateTasks = [
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Controller, infoClass, table, tbName, tbProp, columnsKey, columns, "", "Controller", existText),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Dto, infoClass, table, tbName, tbProp, columnsKey, columns, "", "DisplayDto", existText),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Dto, infoClass, table, tbName, tbProp, columnsKey, columns, "", "CreateDto", existText),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Dto, infoClass, table, tbName, tbProp, columnsKey, columns, "", "UpdateDto", existText),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_InterfaceApp, infoClass, table, tbName, tbProp, columnsKey, columns, "I", "AppService", existText),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_ServiceApp, infoClass, table, tbName, tbProp, columnsKey, columns, "", "AppService", existText),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Model, infoClass, table, tbName, tbProp, columnsKey, columns, "", "Mod", existText),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Service, infoClass, table, tbName, tbProp, columnsKey, columns, "", "Service", existText),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_InterfaceRepo, infoClass, table, tbName, tbProp, columnsKey, columns, "I", "Repository", existText),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_InterfaceSrv, infoClass, table, tbName, tbProp, columnsKey, columns, "I", "Service", existText),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Repository, infoClass, table, tbName, tbProp, columnsKey, columns, "", "Repository", existText)
            ];
        }
        else
        {
            generateTasks = [
                GenerateAndSaveAsync(Constants.TypeClass.Clean_DomainEntity, infoClass, table, tbName, tbProp, columnsKey, columns, "", "Entity", existText),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_DomainInterface, infoClass, table, tbName, tbProp, columnsKey, columns, "I", "Repository", existText),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppRecord, infoClass, table, tbName, tbProp, columnsKey, columns, "", "Record", existText),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppInterface, infoClass, table, tbName, tbProp, columnsKey, columns, "I", "Service", existText),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppService, infoClass, table, tbName, tbProp, columnsKey, columns, "_", "Service", existText),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppServiceGet, infoClass, table, tbName, tbProp, columnsKey, columns, "", "GetService", existText),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppServiceValidation, infoClass, table, tbName, tbProp, columnsKey, columns, "", "ValidationService", existText),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_Repository, infoClass, table, tbName, tbProp, columnsKey, columns, "", "Repository", existText),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_RepositoryModel, infoClass, table, tbName, tbProp, columnsKey, columns, "", "Mod", existText),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_Controller, infoClass, table, tbName, tbProp, columnsKey, columns, "", "Controller", existText),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_GraphQlMutation, infoClass, table, tbName, tbProp, columnsKey, columns, "", "Mutation", existText),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_GraphQlQuery, infoClass, table, tbName, tbProp, columnsKey, columns, "", "Query", existText)
            ];
        }
        
        await Task.WhenAll(generateTasks);
    }

    private async Task GenerateAndSaveAsync(Constants.TypeClass typeClass, InfoClass infoClass, string tableNameOriginal, string tableName, string tableProp, string columnsKey, 
                                            IEnumerable<ColumnInfo> columns, string prefix, string suffix, bool existText = false)
    {
        Constants.TypeClass[] allowedTextTypes = [
            Constants.TypeClass.DDD_Dto, Constants.TypeClass.DDD_Model, Constants.TypeClass.DDD_InterfaceRepo, Constants.TypeClass.DDD_Repository,
            Constants.TypeClass.Clean_DomainEntity, Constants.TypeClass.Clean_DomainInterface, Constants.TypeClass.Clean_Repository, Constants.TypeClass.Clean_RepositoryModel
        ];
        if (tableName.EndsWith("Text") && !allowedTextTypes.Contains(typeClass)) return;
        
        var templateName = Constants.GetTemplateName(typeClass);
        var templatePath = Path.Combine(env.WebRootPath, "Templates", $"{templateName}.scriban");
        var templateText = await File.ReadAllTextAsync(templatePath);
        var template = Template.Parse(templateText);

        var context = new TemplateContext { MemberRenamer = member => member.Name };
        context.BuiltinObject.Import(typeof(Scriban.Functions.StringFunctions));
        var newTableName = tableName.StartsWith("Base") ? tableName.Substring(4) : tableName;

        var model = Constants.MapInfo(tableNameOriginal, newTableName, tableProp, infoClass.ProjectName, infoClass.NameSpace, columnsKey, columns, existText);
        
        context.PushGlobal(model);
        var result = await template.RenderAsync(context);
        
        if (typeClass == Constants.TypeClass.Clean_AppRecord)
            result = result.Replace(", )", ")");

        var groupFolder = string.Empty;
        if (typeClass is Constants.TypeClass.Clean_AppService or Constants.TypeClass.Clean_AppServiceGet or Constants.TypeClass.Clean_AppServiceValidation
                      or Constants.TypeClass.Clean_GraphQlMutation or Constants.TypeClass.Clean_GraphQlQuery)
            groupFolder = newTableName;

        var path = Constants.GetPath(typeClass, infoClass.PathGeral);
        var newPath = Path.Combine(path, groupFolder);
        if (!Directory.Exists(newPath))
            Directory.CreateDirectory(newPath);

        await File.WriteAllTextAsync($"{Path.Combine(newPath, $"{prefix}{newTableName}{suffix}")}.cs", result);
    }
}