using Development.Assistant.Back.Models;
using Scriban.Runtime;

namespace Development.Assistant.Back.Utils;

public class Constants
{
    public enum DbType
    {
        MySQL,
        Oracle,
        PostgreSql,
        SQLServer
    }

    public enum TypeClass
    {
        Controller,
        Dto,
        InterfaceApp,
        ServiceApp,
        InterfaceRepo,
        InterfaceSrv,
        Model,
        Service,
        Repository
    }

    public readonly static Dictionary<string, string> DataType = new()
    {
        { "int", "int" },
        { "bigint", "long" },
        { "double", "double" },
        { "longblob", "byte[]" },
        { "decimal", "decimal" },
        { "float", "float" },
        { "bool", "bool" },
        { "bit", "bool" },
        { "datetime", "DateTime" },
        { "date", "DateTime" },
        { "varchar", "string" },
        { "char", "string" },

        { "boolean", "bool" },
        { "\"char\"", "string" },
        { "character varying", "string" },
        { "character", "string" },
        { "serial4", "long" },
        { "time with time zone", "datetime" },
        { "time without time zone", "datetime" },
        { "timestamp without time zone", "datetime" },
        { "timestamp with time zone", "datetime" },
        { "bpchar", "bool" },
        { "int4", "int" },
        { "int8", "int" },
        { "integer", "int" },
        { "smallint", "int" },
        { "numeric", "decimal" },
        { "bytea", "byte[]" },
        { "text", "string" },
    };

    public static string GetTemplateName(TypeClass typeClass)
    {
        var templateNames = new Dictionary<TypeClass, string>
        {
            {TypeClass.Controller, "Controller"},
            {TypeClass.Dto, "Dto"},
            {TypeClass.InterfaceApp, "AppInterface"},
            {TypeClass.ServiceApp, "AppService"},
            {TypeClass.InterfaceRepo, "RepositoryInterface"},
            {TypeClass.InterfaceSrv, "DomainServiceInterface"},
            {TypeClass.Model, "Model"},
            {TypeClass.Service, "DomainService"},
            {TypeClass.Repository, "Repository"}
        };
        return templateNames[typeClass];
    }

    public static string GetPath(TypeClass typeClass, string pathGeral)
    {
        var paths = new Dictionary<TypeClass, string>
        {
            {TypeClass.Controller, Path.Combine(pathGeral, @"1 - Api\Controllers")},
            {TypeClass.Dto, Path.Combine(pathGeral, @"2 - App\Dto")},
            {TypeClass.InterfaceApp, Path.Combine(pathGeral, @"2 - App\Interfaces")},
            {TypeClass.ServiceApp, Path.Combine(pathGeral, @"2 - App\Services")},
            {TypeClass.InterfaceRepo, Path.Combine(pathGeral, @"3 - Domain\Interfaces\Repository")},
            {TypeClass.InterfaceSrv, Path.Combine(pathGeral, @"3 - Domain\Interfaces\Services")},
            {TypeClass.Model, Path.Combine(pathGeral, @"3 - Domain\Models")},
            {TypeClass.Service, Path.Combine(pathGeral, @"3 - Domain\Services")},
            {TypeClass.Repository, Path.Combine(pathGeral, "4 - Repository")}
        };
        return paths[typeClass];
    }
    
    public static ScriptObject CreateBaseModel(string tableNameOriginal, string tableName, string tableProp, string projectName, string nameSpace, string columnsKey, IEnumerable<ColumnInfo> columns)
    {
        return new ScriptObject
        {
            { "table_name_original", tableNameOriginal },
            { "table_name", tableName },
            { "table_prop", tableProp },
            { "project_name", projectName },
            { "namespace", nameSpace },
            { "columns_key", columnsKey },
            { "columns_key_names", columnsKey.RemoveColumnTypes() },
            { "columns", columns }
        };
    }
}