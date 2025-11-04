using Development.Assistant.Back.Models;
using Development.Assistant.Back.Utils;
using Scriban;
using Scriban.Runtime;
using Path = System.IO.Path;

namespace Development.Assistant.Back.Services;

public class ScribanCodeGeneratorService(BaseRepository repository)
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
        var existText = infoClass.Tables.Any(t => t.Equals($"{table}_text", StringComparison.OrdinalIgnoreCase));
        
        var infoFullClass = new InfoFullClass(infoClass.DbType, infoClass, table, tbName, tbProp, columnsKey, columns, existText);

        Task[] generateTasks;

        if (infoClass.Template == Constants.Template.DDD)
        {
            generateTasks = [
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Controller, infoFullClass, "", "Controller"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Dto, infoFullClass, "", "DisplayDto"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Dto, infoFullClass, "", "CreateDto"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Dto, infoFullClass, "", "UpdateDto"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_InterfaceApp, infoFullClass, "I", "AppService"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_ServiceApp, infoFullClass, "", "AppService"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Model, infoFullClass, "", "Mod"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Service, infoFullClass, "", "Service"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_InterfaceRepo, infoFullClass, "I", "Repository"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_InterfaceSrv, infoFullClass, "I", "Service"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Repository, infoFullClass, "", "Repository")
            ];
        }
        else
        {
            generateTasks = [
                GenerateAndSaveAsync(Constants.TypeClass.Clean_DomainEntity, infoFullClass, "", "Entity"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_DomainInterface, infoFullClass, "I", "Repository"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppRecord, infoFullClass, "", "Record"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppInterface, infoFullClass, "I", "Service"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppService, infoFullClass, "_", "Service"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppServiceGet, infoFullClass, "", "GetService"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppServiceValidation, infoFullClass, "", "ValidationService"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_Repository, infoFullClass, "", "Repository"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_RepositoryModel, infoFullClass, "", "Mod"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_Controller, infoFullClass, "", "Controller"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_GraphQlMutation, infoFullClass, "", "Mutation"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_GraphQlQuery, infoFullClass, "", "Query")
            ];
        }
        
        await Task.WhenAll(generateTasks);
    }

    private async Task GenerateAndSaveAsync(Constants.TypeClass typeClass, InfoFullClass data, string prefix, string suffix)
    {
        Constants.TypeClass[] allowedTextTypes = [
            Constants.TypeClass.DDD_Dto, Constants.TypeClass.DDD_Model, Constants.TypeClass.DDD_InterfaceRepo, Constants.TypeClass.DDD_Repository,
            Constants.TypeClass.Clean_DomainEntity, Constants.TypeClass.Clean_DomainInterface, Constants.TypeClass.Clean_Repository, Constants.TypeClass.Clean_RepositoryModel
        ];
        if (data.TableName.EndsWith("Text", StringComparison.OrdinalIgnoreCase) && !allowedTextTypes.Contains(typeClass)) return;
        if (data.TableName.EndsWith("Text", StringComparison.OrdinalIgnoreCase) && suffix is "CreateDto" or "UpdateDto") return;
        
        var templateName = Constants.GetTemplateName(typeClass);
        var templatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Templates", $"{templateName}.scriban");
        var templateText = await File.ReadAllTextAsync(templatePath);
        var template = Template.Parse(templateText);

        var context = new TemplateContext { MemberRenamer = member => member.Name };
        context.BuiltinObject.Import(typeof(Scriban.Functions.StringFunctions));

        var tableNameStartWithPrefix = data.TableName.StartsWith(data.InfoClass.ExcludePrefixTable, StringComparison.OrdinalIgnoreCase);
        var tablePropStartWithPrefix = data.TableProp.StartsWith(data.InfoClass.ExcludePrefixTable, StringComparison.OrdinalIgnoreCase);
        
        var newTableName = tableNameStartWithPrefix ? data.TableName.Replace(data.InfoClass.ExcludePrefixTable, "", StringComparison.OrdinalIgnoreCase) : data.TableName;
        var newTableProp = tablePropStartWithPrefix ? data.TableProp.Replace(data.InfoClass.ExcludePrefixTable, "", StringComparison.OrdinalIgnoreCase) : data.TableProp;

        var model = Constants.MapInfo(data.TableNameOriginal, newTableName, newTableProp.ConvertToCamelCase(), data);
        
        context.PushGlobal(model);
        var result = await template.RenderAsync(context);
        
        if (typeClass == Constants.TypeClass.Clean_AppRecord)
            result = result.Replace(", )", ")");

        var groupFolder = string.Empty;
        if (typeClass is Constants.TypeClass.Clean_AppService or Constants.TypeClass.Clean_AppServiceGet or Constants.TypeClass.Clean_AppServiceValidation
                      or Constants.TypeClass.Clean_GraphQlMutation or Constants.TypeClass.Clean_GraphQlQuery)
            groupFolder = newTableName;

        var path = Constants.GetPath(typeClass, data.InfoClass.PathGeral);
        var newPath = Path.Combine(path, groupFolder);
        if (!Directory.Exists(newPath))
            Directory.CreateDirectory(newPath);

        await File.WriteAllTextAsync($"{Path.Combine(newPath, $"{prefix}{newTableName}{suffix}")}.cs", result);
    }
}