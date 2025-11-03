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

    public enum Template
    {
        DDD,
        CleanArchitecture,
    }

    public enum TypeClass
    {
        DDD_Controller,
        DDD_Dto,
        DDD_InterfaceApp,
        DDD_ServiceApp,
        DDD_InterfaceRepo,
        DDD_InterfaceSrv,
        DDD_Model,
        DDD_Service,
        DDD_Repository,
        
        Clean_DomainEntity,
        Clean_DomainInterface,
        Clean_AppRecord,
        Clean_AppInterface,
        Clean_AppService,
        Clean_AppServiceGet,
        Clean_AppServiceValidation,
        Clean_Repository,
        Clean_RepositoryModel,
        Clean_Controller,
        Clean_GraphQlMutation,
        Clean_GraphQlQuery
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
        { "uuid", "Guid" }
    };

    public static string GetTemplateName(TypeClass typeClass)
    {
        var templateNames = new Dictionary<TypeClass, string>
        {
            {TypeClass.DDD_Controller, "DDD_Controller"},
            {TypeClass.DDD_Dto, "DDD_Dto"},
            {TypeClass.DDD_InterfaceApp, "DDD_AppInterface"},
            {TypeClass.DDD_ServiceApp, "DDD_AppService"},
            {TypeClass.DDD_InterfaceRepo, "DDD_RepositoryInterface"},
            {TypeClass.DDD_InterfaceSrv, "DDD_DomainServiceInterface"},
            {TypeClass.DDD_Model, "DDD_Model"},
            {TypeClass.DDD_Service, "DDD_DomainService"},
            {TypeClass.DDD_Repository, "DDD_Repository"},
            
            {TypeClass.Clean_DomainEntity, "Clean_DomainEntities"},
            {TypeClass.Clean_DomainInterface, "Clean_DomainInterface"},
            {TypeClass.Clean_AppRecord, "Clean_AppRecords"},
            {TypeClass.Clean_AppInterface, "Clean_AppInterface"},
            {TypeClass.Clean_AppService, "Clean_AppService"},
            {TypeClass.Clean_AppServiceGet, "Clean_AppServiceGet"},
            {TypeClass.Clean_AppServiceValidation, "Clean_AppServiceValidation"},
            {TypeClass.Clean_Repository, "Clean_Repository"},
            {TypeClass.Clean_RepositoryModel, "Clean_RepositoryModel"},
            {TypeClass.Clean_Controller, "Clean_Controller"},
            {TypeClass.Clean_GraphQlMutation, "Clean_GraphqlMutation"},
            {TypeClass.Clean_GraphQlQuery, "Clean_GraphqlQuery"}
        };
        return templateNames[typeClass];
    }

    public static string GetPath(TypeClass typeClass, string pathGeral)
    {
        var paths = new Dictionary<TypeClass, string>
        {
            {TypeClass.DDD_Controller, Path.Combine(pathGeral, @"1 - Api\Controllers")},
            {TypeClass.DDD_Dto, Path.Combine(pathGeral, @"2 - App\Dto")},
            {TypeClass.DDD_InterfaceApp, Path.Combine(pathGeral, @"2 - App\Interfaces")},
            {TypeClass.DDD_ServiceApp, Path.Combine(pathGeral, @"2 - App\Services")},
            {TypeClass.DDD_InterfaceRepo, Path.Combine(pathGeral, @"3 - Domain\Interfaces\Repository")},
            {TypeClass.DDD_InterfaceSrv, Path.Combine(pathGeral, @"3 - Domain\Interfaces\Services")},
            {TypeClass.DDD_Model, Path.Combine(pathGeral, @"3 - Domain\Models")},
            {TypeClass.DDD_Service, Path.Combine(pathGeral, @"3 - Domain\Services")},
            {TypeClass.DDD_Repository, Path.Combine(pathGeral, "4 - Repository")},
            
            {TypeClass.Clean_DomainEntity, Path.Combine(pathGeral, @"1 - Domain\Entities")},
            {TypeClass.Clean_DomainInterface, Path.Combine(pathGeral, @"1 - Domain\Interfaces")},
            {TypeClass.Clean_AppRecord, Path.Combine(pathGeral, @"2 - Application\Records")},
            {TypeClass.Clean_AppInterface, Path.Combine(pathGeral, @"2 - Application\Interfaces")},
            {TypeClass.Clean_AppService, Path.Combine(pathGeral, @"2 - Application\Services")},
            {TypeClass.Clean_AppServiceGet, Path.Combine(pathGeral, @"2 - Application\Services")},
            {TypeClass.Clean_AppServiceValidation, Path.Combine(pathGeral, @"2 - Application\Services")},
            {TypeClass.Clean_Repository, Path.Combine(pathGeral, @"3 - Infra\Repositories")},
            {TypeClass.Clean_RepositoryModel, Path.Combine(pathGeral, @"3 - Infra\Models")},
            {TypeClass.Clean_Controller, Path.Combine(pathGeral, @"4 - Api\Controllers")},
            {TypeClass.Clean_GraphQlMutation, Path.Combine(pathGeral, @"4 - Api\GraphQl")},
            {TypeClass.Clean_GraphQlQuery, Path.Combine(pathGeral, @"4 - Api\GraphQl")}
        };
        return paths[typeClass];
    }
    
    public static ScriptObject MapInfo(string tableNameOriginal, string tableName, string tableProp, string projectName, string nameSpace, string columnsKey, IEnumerable<ColumnInfo> columns, bool existText = false)
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
            { "columns", columns },
            { "exist_text", existText }
        };
    }
}