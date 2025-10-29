using Development.Assistant.Back.Models;
using Development.Assistant.Back.Utils;
using Scriban;
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
        var tbProp = table.ConvertToCamelCase();

        var dbColumns = repository.GetColumnsQuery(infoClass.ConnectionString, infoClass.DbType, table);

        var columns = dbColumns.Select(c => new ColumnInfo
        {
            Name = c.Name,
            Type = Constants.DataType[c.Type.Split('(')[0]], // Mapear tipo SQL para C#
            IsPrimaryKey = c.IsPrimaryKey,
            IsIdentity = c.IsIdentity,
            IsNullable = c.IsNullable
        }).ToList();

        var columnsKey = string.Join(", ", columns.Where(c => c.IsPrimaryKey).Select(c => $"{c.Type} {c.Name.ConvertToCamelCase()}"));

        var generateTasks = new[]
        {
            GenerateAndSaveAsync(Constants.TypeClass.Controller, infoClass, table, tbName, tbProp, columnsKey,columns),
            GenerateAndSaveAsync(Constants.TypeClass.Dto, infoClass, table, tbName, tbProp, columnsKey,columns),
            GenerateAndSaveAsync(Constants.TypeClass.InterfaceApp, infoClass, table, tbName, tbProp, columnsKey,columns),
            GenerateAndSaveAsync(Constants.TypeClass.ServiceApp, infoClass, table, tbName, tbProp, columnsKey,columns),
            GenerateAndSaveAsync(Constants.TypeClass.Model, infoClass, table, tbName, tbProp, columnsKey,columns),
            GenerateAndSaveAsync(Constants.TypeClass.Service, infoClass, table, tbName, tbProp, columnsKey,columns),
            GenerateAndSaveAsync(Constants.TypeClass.InterfaceRepo, infoClass, table, tbName, tbProp, columnsKey,columns),
            GenerateAndSaveAsync(Constants.TypeClass.InterfaceSrv, infoClass, table, tbName, tbProp, columnsKey,columns),
            GenerateAndSaveAsync(Constants.TypeClass.Repository, infoClass, table, tbName, tbProp, columnsKey,columns),
        };

        await Task.WhenAll(generateTasks);
    }

    private static async Task GenerateAndSaveAsync(Constants.TypeClass typeClass, InfoClass infoClass, string tableNameOriginal, string tableName, string tableProp, string columnsKey, IEnumerable<ColumnInfo> columns)
    {
        var templatesPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Back", "Templates");
        var templateName = Constants.GetTemplateName(typeClass);
        var templatePath = Path.Combine(templatesPath, $"{templateName}.scriban");
        var templateText = await File.ReadAllTextAsync(templatePath);
        var template = Template.Parse(templateText);

        var context = new TemplateContext { MemberRenamer = member => member.Name };
        var model = Constants.CreateBaseModel(tableNameOriginal, tableName, tableProp, infoClass.ProjectName, infoClass.NameSpace, columnsKey, columns);
        context.PushGlobal(model);
        var result = await template.RenderAsync(context);

        var path = Constants.GetPath(typeClass, infoClass.PathGeral);
        if (!Directory.Exists(path))
            Directory.CreateDirectory(path);

        await File.WriteAllTextAsync($"{Path.Combine(path, tableName)}.cs", result);
    }
}