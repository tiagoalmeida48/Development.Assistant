using Development.Assistant.Modules.Record;
using Development.Assistant.Modules.Common.Extensions;
using Development.Assistant.Modules.Models;
using Development.Assistant.Modules.Repository;
using Development.Assistant.Modules.Common;
using Scriban;
using Scriban.Functions;
using Scriban.Runtime;
using System.IO.Compression;
using Path = System.IO.Path;

namespace Development.Assistant.Modules.Services;

public class ScribanCodeGeneratorService(IntrospectionRepository repository, InputHistoryService inputHistorySrv)
{
    private static readonly Constants.TypeClass[] AllowedTextTypes =
    [
        Constants.TypeClass.DDD_Dto, Constants.TypeClass.DDD_Model, Constants.TypeClass.DDD_InterfaceRepo, Constants.TypeClass.DDD_Repository,
        Constants.TypeClass.Clean_DomainEntity, Constants.TypeClass.Clean_DomainInterface, Constants.TypeClass.Clean_Repository, Constants.TypeClass.Clean_RepositoryModel
    ];

    public IEnumerable<string> AllTables(string connectionString, string dbType)
    {
        return repository.GetTablesQuery(connectionString, dbType);
    }

    public async Task<byte[]> CreateClassAsync(InfoClassRecord infoClass)
    {
        var generatedFiles = new Dictionary<string, string>();

        var tasks = infoClass.Tables.Select(table => GenerateForTableAsync(table, infoClass, generatedFiles));
        await Task.WhenAll(tasks);

        List<InputHistoryMod> inputsValue =
        [
            new(Constants.InputName.ProjectName, infoClass.ProjectName),
            new(Constants.InputName.NameSpace, infoClass.NameSpace),
            new(Constants.InputName.ExcludePrefixTable, infoClass.ExcludePrefixTable)
        ];

        inputHistorySrv.Create(inputsValue);

        return CreateZipFile(generatedFiles);
    }

    private static byte[] CreateZipFile(Dictionary<string, string> files)
    {
        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
        {
            foreach (var file in files)
            {
                var entry = archive.CreateEntry(file.Key);
                using var entryStream = entry.Open();
                using var streamWriter = new StreamWriter(entryStream);
                streamWriter.Write(file.Value);
            }
        }
        return memoryStream.ToArray();
    }

    private async Task GenerateForTableAsync(string table, InfoClassRecord infoClass, Dictionary<string, string> generatedFiles)
    {
        var tbName = table.ConvertToPascalCase();
        var tbProp = tbName.ConvertToCamelCase();

        var dbColumns = repository.GetColumnsQuery(infoClass.ConnectionString, infoClass.DbType, table);

        var columns = dbColumns.Select(c => new ColumnInfoMod
        {
            Name = c.Name.ConvertToPascalCase(),
            Type = Constants.GetCSharpType(c.Type),
            IsPrimaryKey = c.IsPrimaryKey,
            IsIdentity = c.IsIdentity,
            IsNullable = c.IsNullable
        }).ToList();

        var columnsKey = string.Join(", ", columns.Where(c => c.IsPrimaryKey).Select(c => $"{c.Type} {c.Name.ConvertToCamelCase()}"));
        var existText = infoClass.Tables.Any(t => t.Equals($"{table}_text", StringComparison.OrdinalIgnoreCase));

        var databaseMetadata = new DatabaseMetadataRecord(
            string.Empty,
            infoClass.DbType,
            infoClass.ProjectName,
            infoClass.NameSpace,
            table,
            tbName,
            tbProp,
            columnsKey,
            columns,
            existText,
            infoClass.ExcludePrefixTable
        );

        Task[] generateTasks;

        if (infoClass.Template == Constants.Template.DDD)
        {
            generateTasks =
            [
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Controller, databaseMetadata, "", "Controller", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Dto, databaseMetadata, "", "DisplayRecord", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Dto, databaseMetadata, "", "CreateRecord", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Dto, databaseMetadata, "", "UpdateRecord", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_InterfaceApp, databaseMetadata, "I", "AppService", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_ServiceApp, databaseMetadata, "", "AppService", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Model, databaseMetadata, "", "Mod", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Service, databaseMetadata, "", "Service", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_InterfaceRepo, databaseMetadata, "I", "Repository", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_InterfaceSrv, databaseMetadata, "I", "Service", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.DDD_Repository, databaseMetadata, "", "Repository", generatedFiles)
            ];
        }
        else
        {
            generateTasks =
            [
                GenerateAndSaveAsync(Constants.TypeClass.Clean_DomainEntity, databaseMetadata, "", "Entity", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_DomainInterface, databaseMetadata, "I", "Repository", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppRecord, databaseMetadata, "", "Record", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppInterface, databaseMetadata, "I", "Service", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppService, databaseMetadata, "_", "Service", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppServiceGet, databaseMetadata, "", "GetService", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_AppServiceValidation, databaseMetadata, "", "ValidationService", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_Repository, databaseMetadata, "", "Repository", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_RepositoryModel, databaseMetadata, "", "Mod", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_Controller, databaseMetadata, "", "Controller", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_GraphQlMutation, databaseMetadata, "", "Mutation", generatedFiles),
                GenerateAndSaveAsync(Constants.TypeClass.Clean_GraphQlQuery, databaseMetadata, "", "Query", generatedFiles)
            ];
        }

        await Task.WhenAll(generateTasks);
    }

    private static async Task GenerateAndSaveAsync(Constants.TypeClass typeClass, DatabaseMetadataRecord data, string prefix, string suffix, Dictionary<string, string> generatedFiles)
    {
        if (data.TableName.EndsWith("Text", StringComparison.OrdinalIgnoreCase) && !AllowedTextTypes.Contains(typeClass)) return;
        if (data.TableName.EndsWith("Text", StringComparison.OrdinalIgnoreCase) && suffix is "CreateRecord" or "UpdateRecord") return;

        var templateName = Constants.GetTemplateName(typeClass);
        var templatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Templates", $"{templateName}.scriban");
        var templateText = await File.ReadAllTextAsync(templatePath);
        var template = Template.Parse(templateText);

        var context = new TemplateContext { MemberRenamer = member => member.Name };
        context.BuiltinObject.Import(typeof(StringFunctions));

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

        var path = Constants.GetPath(typeClass);
        var fileRelativePath = Path.Combine(path, groupFolder, $"{prefix}{newTableName}{suffix}.cs");

        lock (generatedFiles)
        {
            generatedFiles[fileRelativePath] = result;
        }
    }
}