using Dapper;
using Development.Assistant.Back.Models;
using Development.Assistant.Back.Utils;
using Microsoft.Data.SqlClient;
using MySqlConnector;
using Npgsql;
using Oracle.ManagedDataAccess.Client;
using System.Data;

namespace Development.Assistant.Back.Repository;

public class MetadataRepository(ApiContext apiContext) : BaseRepository(apiContext)
{
    public IEnumerable<ColumnInfo> GetColumnsQuery(string connectionString, string dbType, string tableName, string schema = "dbo_schema")
    {
        var query = dbType switch
        {
            Constants.DbType.MariaDb => $"""
                                         SELECT 
                                             COLUMN_NAME AS name,
                                             DATA_TYPE AS type,
                                             CASE WHEN IS_NULLABLE = 'YES' THEN 1 ELSE 0 END AS IS_NULLABLE,
                                             CASE WHEN COLUMN_KEY = 'PRI' THEN 1 ELSE 0 END AS is_primary_key,
                                             CASE WHEN EXTRA <> '' AND EXTRA IS NOT NULL THEN 1 ELSE 0 END AS is_identity 
                                         FROM INFORMATION_SCHEMA.COLUMNS 
                                         WHERE TABLE_NAME = '{tableName}' AND TABLE_SCHEMA = DATABASE() AND COLUMN_NAME NOT IN ('CREATED', 'UPDATED')
                                         GROUP BY COLUMN_NAME, DATA_TYPE, DATA_TYPE, COLUMN_KEY, EXTRA
                                         ORDER BY ORDINAL_POSITION
                                         """,
            Constants.DbType.SqlServer => $"""
                                           SELECT 
                                               c.COLUMN_NAME AS name,
                                               c.DATA_TYPE AS type,
                                               CASE WHEN c.IS_NULLABLE = 'YES' THEN 1 ELSE 0 END AS IS_NULLABLE,
                                               CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END AS is_primary_key,
                                               COLUMNPROPERTY(OBJECT_ID(c.TABLE_SCHEMA + '.' + c.TABLE_NAME), c.COLUMN_NAME, 'IsIdentity') AS is_identity
                                           FROM INFORMATION_SCHEMA.COLUMNS c
                                           LEFT JOIN (
                                               SELECT ku.TABLE_SCHEMA, ku.TABLE_NAME, ku.COLUMN_NAME
                                               FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                                               INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME AND tc.TABLE_SCHEMA = ku.TABLE_SCHEMA AND tc.TABLE_NAME = ku.TABLE_NAME 
                                               WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                                           ) pk ON c.TABLE_SCHEMA = pk.TABLE_SCHEMA AND c.TABLE_NAME = pk.TABLE_NAME AND c.COLUMN_NAME = pk.COLUMN_NAME
                                           WHERE c.TABLE_NAME = '{tableName}' AND c.TABLE_SCHEMA = SCHEMA_NAME() AND c.COLUMN_NAME NOT IN ('CREATED', 'UPDATED')
                                           ORDER BY c.ORDINAL_POSITION
                                           """,
            Constants.DbType.Oracle => $"""
                                        SELECT 
                                            c.COLUMN_NAME AS name,
                                            c.DATA_TYPE AS type,
                                            CASE WHEN c.NULLABLE = 'Y' THEN 1 ELSE 0 END AS IS_NULLABLE,
                                            CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END AS is_primary_key,
                                            CASE WHEN c.IDENTITY_COLUMN = 'YES' THEN 1 ELSE 0 END AS is_identity
                                        FROM ALL_TAB_COLUMNS c
                                        LEFT JOIN (
                                            SELECT acc.OWNER, acc.TABLE_NAME, acc.COLUMN_NAME
                                            FROM ALL_CONSTRAINTS ac
                                            INNER JOIN ALL_CONS_COLUMNS acc ON ac.CONSTRAINT_NAME = acc.CONSTRAINT_NAME AND ac.OWNER = acc.OWNER
                                            WHERE ac.CONSTRAINT_TYPE = 'P'
                                        ) pk ON c.OWNER = pk.OWNER AND c.TABLE_NAME = pk.TABLE_NAME AND c.COLUMN_NAME = pk.COLUMN_NAME
                                        WHERE c.TABLE_NAME = '{tableName}' AND c.OWNER = SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AND c.COLUMN_NAME NOT IN ('CREATED', 'UPDATED')
                                        ORDER BY c.COLUMN_ID
                                        """,
            Constants.DbType.PostgreSql => $"""
                                            SELECT cols.column_name AS Name, 
                                                   cols.data_type AS Type, 
                                                   CASE WHEN cols.is_nullable IS NOT NULL AND cols.is_nullable = 'YES' THEN true ELSE false END AS is_nullable, 
                                                   CASE WHEN kcu.column_name IS NOT NULL THEN true ELSE false END AS is_primary_key,
                                                   CASE WHEN cols.column_default LIKE 'nextval%' THEN true ELSE false END AS is_identity 
                                               FROM information_schema.columns AS cols
                                               LEFT JOIN information_schema.key_column_usage AS kcu ON cols.table_name = kcu.table_name AND cols.column_name = kcu.column_name AND cols.table_schema = kcu.table_schema
                                               LEFT JOIN information_schema.table_constraints AS tc ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema AND tc.constraint_type = 'PRIMARY KEY'
                                               WHERE cols.table_name = '{tableName}' AND cols.table_schema = '{schema}' AND cols.COLUMN_NAME NOT IN ('created', 'updated')
                                            """,
            _ => throw new ArgumentException($"DbType não suportado: {dbType}")
        };

        using var con = CreateDbConnection(connectionString, dbType);
        return con.Query<ColumnInfo>(query).ToList();
    }

    public int GetCountRegistersQuery(string connectionString, string dbType, string tableName, string schema = "dbo_schema")
    {
        var query = dbType switch
        {
            Constants.DbType.MariaDb => $"SELECT COUNT(1) FROM `{tableName}`",
            Constants.DbType.SqlServer => $"SELECT COUNT(1) FROM [{tableName}]",
            Constants.DbType.Oracle => $"SELECT COUNT(1) FROM {tableName}",
            Constants.DbType.PostgreSql => $"SELECT COUNT(1) FROM {schema}.{tableName}",
            _ => throw new ArgumentException($"DbType não suportado: {dbType}")
        };

        using var con = CreateDbConnection(connectionString, dbType);
        return con.QueryFirstOrDefault<int>(query);
    }

    public IEnumerable<string> GetTablesQuery(string connectionString, string dbType, string schema = "dbo_schema")
    {
        var query = dbType switch
        {
            Constants.DbType.MariaDb => "SHOW TABLES",
            Constants.DbType.SqlServer => "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = SCHEMA_NAME()",
            Constants.DbType.Oracle => "SELECT TABLE_NAME FROM USER_TABLES",
            Constants.DbType.PostgreSql => $"SELECT table_name FROM information_schema.tables WHERE table_schema = '{schema}'",
            _ => throw new ArgumentException($"DbType não suportado: {dbType}")
        };

        using var con = CreateDbConnection(connectionString, dbType);
        return con.Query<string>(query).ToList();
    }

    public string GetDatabaseName(string connectionString, string dbType)
    {
        var query = dbType switch
        {
            Constants.DbType.MariaDb => "SELECT DATABASE()",
            Constants.DbType.SqlServer => "SELECT DB_NAME()",
            Constants.DbType.Oracle => "SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') FROM DUAL",
            Constants.DbType.PostgreSql => "SELECT current_database()",
            _ => throw new ArgumentException($"DbType não suportado: {dbType}")
        };

        using var con = CreateDbConnection(connectionString, dbType);
        return con.QueryFirstOrDefault<string>(query);
    }
    
    public IEnumerable<TemplateMod> AllTemplate()
    {
        const string query = "SELECT * FROM template";
        
        using var con = Conn;
        return con.Query<TemplateMod>(query);
    }

    
    public IEnumerable<DatabaseTypeMod> AllDatabaseType()
    {
        const string query = "SELECT * FROM database_type";
        
        using var con = Conn;
        return con.Query<DatabaseTypeMod>(query);
    }

    public IDbConnection CreateDbConnection(string connectionString, string dbType)
    {
        return dbType switch
        {
            Constants.DbType.MariaDb => new MySqlConnection(connectionString),
            Constants.DbType.SqlServer => new SqlConnection(connectionString),
            Constants.DbType.Oracle => new OracleConnection(connectionString),
            Constants.DbType.PostgreSql => new NpgsqlConnection(connectionString.Split("sch=")[0]),
            _ => throw new ArgumentException($"DbType não suportado: {dbType}")
        };
    }
}