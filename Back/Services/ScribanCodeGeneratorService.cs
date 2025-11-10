using Development.Assistant.Back.Dto;
using Development.Assistant.Back.Models;
using Development.Assistant.Back.Repository;
using Development.Assistant.Back.Utils;
using Development.Assistant.Back.Vo;
using Scriban;
using Scriban.Runtime;
using Path = System.IO.Path;

namespace Development.Assistant.Back.Services;

public class ScribanCodeGeneratorService(MetadataRepository repository, InputHistoryService inputHistorySrv)
{
    public IEnumerable<string> AllTables(string connectionString, string dbType)
    {
        return repository.GetTablesQuery(connectionString, dbType);
    }

    public bool CreateClass(InfoClassDto infoClass)
    {
        try
        {
            if (Directory.Exists(infoClass.PathGeral))
                Directory.Delete(infoClass.PathGeral, true);
            
            var tasks = infoClass.Tables.Select(table => GenerateForTableAsync(table, infoClass));
            Task.WhenAll(tasks).Wait();
            
            var inputsValue = new List<InputHistoryMod>();
            inputsValue.Add(new InputHistoryMod(Constants.InputName.ConnString, infoClass.ConnectionString));
            inputsValue.Add(new InputHistoryMod(Constants.InputName.PathGeral, infoClass.PathGeral));
            inputsValue.Add(new InputHistoryMod(Constants.InputName.ProjectName, infoClass.ProjectName));
            inputsValue.Add(new InputHistoryMod(Constants.InputName.NameSpace, infoClass.NameSpace));
            inputsValue.Add(new InputHistoryMod(Constants.InputName.ExcludePrefixTable, infoClass.ExcludePrefixTable));

            inputHistorySrv.Create(inputsValue);

            return true;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao gerar classes: {ex.Message}");
        }
    }

    private async Task GenerateForTableAsync(string table, InfoClassDto infoClass)
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
    
        var databaseMetadata = new DatabaseMetadataVo
        {
            PathGeral = infoClass.PathGeral,
            ProjectName = infoClass.ProjectName,
            Namespace = infoClass.NameSpace,
            TableName = tbName,
            TableNameOriginal = table,
            TableProp = tbProp,
            ColumnsKey = columnsKey,
            Columns = columns,
            ExistText = existText,
            Database = infoClass.DbType,
            ExcludePrefixTable = infoClass.ExcludePrefixTable
        };

        Task[] generateTasks;

        if (infoClass.Template == Constants.Template.DDD)
        {
            generateTasks = [
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Controller, databaseMetadata, "", "Controller"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Dto, databaseMetadata, "", "DisplayDto"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Dto, databaseMetadata, "", "CreateDto"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Dto, databaseMetadata, "", "UpdateDto"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_InterfaceApp, databaseMetadata, "I", "AppService"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_ServiceApp, databaseMetadata, "", "AppService"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Model, databaseMetadata, "", "Mod"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Service, databaseMetadata, "", "Service"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_InterfaceRepo, databaseMetadata, "I", "Repository"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_InterfaceSrv, databaseMetadata, "I", "Service"),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Repository, databaseMetadata, "", "Repository")
            ];
        }
        else
        {
            generateTasks = [
                GenerateAndSaveAsync(Constants.TypeClass.Clean_DomainEntity, databaseMetadata, "", "Entity"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_DomainInterface, databaseMetadata, "I", "Repository"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppRecord, databaseMetadata, "", "Record"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppInterface, databaseMetadata, "I", "Service"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppService, databaseMetadata, "_", "Service"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppServiceGet, databaseMetadata, "", "GetService"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppServiceValidation, databaseMetadata, "", "ValidationService"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_Repository, databaseMetadata, "", "Repository"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_RepositoryModel, databaseMetadata, "", "Mod"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_Controller, databaseMetadata, "", "Controller"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_GraphQlMutation, databaseMetadata, "", "Mutation"),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_GraphQlQuery, databaseMetadata, "", "Query")
            ];
        }
        
        await Task.WhenAll(generateTasks);
    }

    private static async Task GenerateAndSaveAsync(Constants.TypeClass typeClass, DatabaseMetadataVo data, string prefix, string suffix)
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

        var tableNameStartWithPrefix = data.TableName.StartsWith(data.ExcludePrefixTable, StringComparison.OrdinalIgnoreCase);
        var tablePropStartWithPrefix = data.TableProp.StartsWith(data.ExcludePrefixTable, StringComparison.OrdinalIgnoreCase);
        
        var newTableName = tableNameStartWithPrefix ? data.TableName.Replace(data.ExcludePrefixTable, "", StringComparison.OrdinalIgnoreCase) : data.TableName;
        var newTableProp = tablePropStartWithPrefix ? data.TableProp.Replace(data.ExcludePrefixTable, "", StringComparison.OrdinalIgnoreCase) : data.TableProp;

        var model = Constants.MapInfo(data.TableNameOriginal, newTableName, newTableProp.ConvertToCamelCase(), data);
        
        context.PushGlobal(model);
        var result = await template.RenderAsync(context);
        
        if (typeClass == Constants.TypeClass.Clean_AppRecord)
            result = result.Replace(", )", ")");

        var groupFolder = string.Empty;
        if (typeClass is Constants.TypeClass.Clean_AppService or Constants.TypeClass.Clean_AppServiceGet or Constants.TypeClass.Clean_AppServiceValidation
                      or Constants.TypeClass.Clean_GraphQlMutation or Constants.TypeClass.Clean_GraphQlQuery)
            groupFolder = newTableName;

        var path = Constants.GetPath(typeClass, data.PathGeral);
        var newPath = Path.Combine(path, groupFolder);
        if (!Directory.Exists(newPath))
            Directory.CreateDirectory(newPath);

        await File.WriteAllTextAsync($"{Path.Combine(newPath, $"{prefix}{newTableName}{suffix}")}.cs", result);
    }
}