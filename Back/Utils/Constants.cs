using Development.Assistant.Back.Vo;
using Microsoft.IdentityModel.Tokens;
using Scriban.Runtime;
using System.Text;

namespace Development.Assistant.Back.Utils;

public class Constants
{
    public class DbType
    {
        public const string MariaDb = "MariaDb";
        public const string PostgreSql = "PostgreSql";
        public const string SqlServer = "SqlServer";   
        public const string Oracle = "Oracle";
    }

    public class Template
    {
        public const string DDD = "DDD";
        public const string CleanArchitecture = "Clean";   
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
        { "mediumblob", "byte[]" },
        { "mediumtext", "string" },
        { "longtext", "string" },
        { "decimal", "decimal" },
        { "float", "float" },
        { "bool", "bool" },
        { "bit", "bool" },
        { "datetime", "DateTime" },
        { "date", "DateTime" },
        { "time", "TimeSpan" },
        { "varchar", "string" },
        { "char", "string" },
        { "nvarchar", "string" },
        { "nchar", "string" },

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
        { "int8", "long" },
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

    public static string GetPath(TypeClass typeClass)
    {
        var paths = new Dictionary<TypeClass, string>
        {
            {TypeClass.DDD_Controller, @"1 - Api\Controllers"},
            {TypeClass.DDD_Dto, @"2 - App\Dto"},
            {TypeClass.DDD_InterfaceApp, @"2 - App\Interfaces"},
            {TypeClass.DDD_ServiceApp, @"2 - App\Services"},
            {TypeClass.DDD_InterfaceRepo, @"3 - Domain\Interfaces\Repository"},
            {TypeClass.DDD_InterfaceSrv, @"3 - Domain\Interfaces\Services"},
            {TypeClass.DDD_Model, @"3 - Domain\Models"},
            {TypeClass.DDD_Service, @"3 - Domain\Services"},
            {TypeClass.DDD_Repository, "4 - Repository"},
            
            {TypeClass.Clean_DomainEntity, @"1 - Domain\Entities"},
            {TypeClass.Clean_DomainInterface, @"1 - Domain\Interfaces"},
            {TypeClass.Clean_AppRecord, @"2 - Application\Records"},
            {TypeClass.Clean_AppInterface, @"2 - Application\Interfaces"},
            {TypeClass.Clean_AppService, @"2 - Application\Services"},
            {TypeClass.Clean_AppServiceGet, @"2 - Application\Services"},
            {TypeClass.Clean_AppServiceValidation, @"2 - Application\Services"},
            {TypeClass.Clean_Repository, @"3 - Infra\Repositories"},
            {TypeClass.Clean_RepositoryModel, @"3 - Infra\Models"},
            {TypeClass.Clean_Controller, @"4 - Api\Controllers"},
            {TypeClass.Clean_GraphQlMutation, @"4 - Api\GraphQl"},
            {TypeClass.Clean_GraphQlQuery, @"4 - Api\GraphQl"}
        };
        return paths[typeClass];
    }
    
    public static ScriptObject MapInfo(string tableNameOriginal, string tableName, string tableProp, DatabaseMetadataVo data)
    {
        return new ScriptObject
        {
            { "table_name_original", tableNameOriginal },
            { "table_name", tableName },
            { "table_prop", tableProp },
            { "project_name", data.ProjectName },
            { "namespace", data.Namespace },
            { "columns_key", data.ColumnsKey },
            { "columns_key_names", data.ColumnsKey.RemoveColumnTypes() },
            { "columns", data.Columns },
            { "exist_text", data.ExistText },
            { "database", data.Database }       
        };
    }

    public class JwtConfig
    {
        public static string SecretKey => "MinhaSuperChaveSecretaComMaisDe32CaracteresParaSeguranca!@#2024";
        public static string Issuer => "DevelopmentAssistant";
        public static string Audience => "DevelopmentAssistantApp";
        
        public static TokenValidationParameters GetValidationParameters()
        {
            return new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = Issuer,
                ValidAudience = Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey)),
                ClockSkew = TimeSpan.Zero
            };
        }
    }

    public class InputName
    {
        public const string Conn1 = "conn1";
        public const string Conn2 = "conn2";
        public const string SourcePath = "sourcePath";
        public const string DestPath = "destPath";
        public const string OldNamespace = "oldNs";
        public const string NewNamespace = "newNs";
        public const string ConnString = "connString";
        public const string ProjectName = "projectName";
        public const string NameSpace = "nameSpace";
        public const string ExcludePrefixTable = "excludePrefixTable";
    }
}