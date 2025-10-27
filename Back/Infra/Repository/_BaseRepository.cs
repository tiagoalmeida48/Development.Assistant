using Dapper;
using Development.Assistant.Back.Domain.Interfaces.Repository;
using Development.Assistant.Back.Domain.Models;
using Development.Assistant.Back.Infra.CrossCutting;
using Microsoft.Data.SqlClient;
using MySqlConnector;
using Oracle.ManagedDataAccess.Client;
using System.Data;

namespace Development.Assistant.Back.Infra.Repository;

public class BaseRepository : IBaseRepository
{
    public IEnumerable<ColumnInfo> GetColumnsQuery(string connectionString, Constants.DbType dbType, string tableName, string schema = "dbo_schema")
    {
        var query = dbType switch
        {
            Constants.DbType.MySQL => $"""
                                       SELECT 
                                           COLUMN_NAME AS name,
                                           DATA_TYPE AS type,
                                           IS_NULLABLE AS is_nullable,
                                           COLUMN_KEY AS is_primary_key,
                                           EXTRA AS is_identity 
                                       FROM INFORMATION_SCHEMA.COLUMNS 
                                       WHERE TABLE_NAME = '{tableName}' AND TABLE_SCHEMA = DATABASE()
                                       GROUP BY COLUMN_NAME, DATA_TYPE, DATA_TYPE, COLUMN_KEY, EXTRA
                                       ORDER BY ORDINAL_POSITION
                                       """,
            Constants.DbType.SQLServer => $"SELECT COLUMN_NAME as Name, DATA_TYPE as Type FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{tableName}'",
            Constants.DbType.Oracle => $"SELECT COLUMN_NAME as Name, DATA_TYPE as Type FROM USER_TAB_COLUMNS WHERE TABLE_NAME = '{tableName}'",
            Constants.DbType.PostgreSql => $"""
                                            SELECT cols.column_name AS Name, 
                                                   cols.data_type AS Type, 
                                                   cols.is_nullable AS Null, 
                                                   CASE WHEN kcu.column_name IS NOT NULL THEN 'YES' ELSE 'NO' END AS KEY
                                               FROM information_schema.columns AS cols
                                               LEFT JOIN information_schema.key_column_usage AS kcu ON cols.table_name = kcu.table_name AND cols.column_name = kcu.column_name AND cols.table_schema = kcu.table_schema
                                               LEFT JOIN information_schema.table_constraints AS tc ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema AND tc.constraint_type = 'PRIMARY KEY'
                                               WHERE cols.table_name = '{tableName}' AND cols.table_schema = '{schema}'
                                            """,
            _ => throw new ArgumentException($"DbType não suportado: {dbType}")
        };

        using var con = CreateDbConnection(connectionString, dbType);
        return con.Query<ColumnInfo>(query).ToList();
    }

    public int GetCountRegistersQuery(string connectionString, Constants.DbType dbType, string tableName, string schema = "dbo_schema")
    {
        var query = dbType switch
        {
            Constants.DbType.MySQL => $"SELECT COUNT(1) FROM `{tableName}`",
            Constants.DbType.SQLServer => $"SELECT COUNT(1) FROM [{tableName}]",
            Constants.DbType.Oracle => $"SELECT COUNT(1) FROM {tableName}",
            Constants.DbType.PostgreSql => $"SELECT COUNT(1) FROM {schema}.{tableName}",
            _ => throw new ArgumentException($"DbType não suportado: {dbType}")
        };

        using var con = CreateDbConnection(connectionString, dbType);
        return con.QueryFirstOrDefault<int>(query);
    }

    public IEnumerable<string> GetTablesQuery(string connectionString, Constants.DbType dbType, string schema = "dbo_schema")
    {
        var query = dbType switch
        {
            Constants.DbType.MySQL => "SHOW TABLES",
            Constants.DbType.SQLServer => "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'",
            Constants.DbType.Oracle => "SELECT TABLE_NAME FROM USER_TABLES",
            Constants.DbType.PostgreSql => $"SELECT table_name FROM information_schema.tables WHERE table_schema = '{schema}'",
            _ => throw new ArgumentException($"DbType não suportado: {dbType}")
        };

        using var con = CreateDbConnection(connectionString, dbType);
        return con.Query<string>(query).ToList();
    }

    public string GetDatabaseName(string connectionString, Constants.DbType dbType)
    {
        var query = dbType switch
        {
            Constants.DbType.MySQL => "SELECT DATABASE()",
            Constants.DbType.SQLServer => "SELECT DB_NAME()",
            Constants.DbType.Oracle => "SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') FROM DUAL",
            Constants.DbType.PostgreSql => "SELECT current_database()",
            _ => throw new ArgumentException($"DbType não suportado: {dbType}")
        };

        using var con = CreateDbConnection(connectionString, dbType);
        return con.QueryFirstOrDefault<string>(query);
    }

    public IDbConnection CreateDbConnection(string connectionString, Constants.DbType dbType)
    {
        return dbType switch
        {
            Constants.DbType.MySQL => new MySqlConnection(connectionString),
            Constants.DbType.SQLServer => new SqlConnection(connectionString),
            Constants.DbType.Oracle => new OracleConnection(connectionString),
            Constants.DbType.PostgreSql => new Npgsql.NpgsqlConnection(connectionString.Split("sch=")[0]),
            _ => throw new ArgumentException($"DbType não suportado: {dbType}")
        };
    }
}