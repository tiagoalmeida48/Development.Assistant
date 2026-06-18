using Dapper;
using Development.Assistant.Modules.Common;
using Development.Assistant.Modules.Common.Database;
using Development.Assistant.Modules.Common.Extensions;
using Development.Assistant.Modules.Models;
using Microsoft.Data.SqlClient;
using MySqlConnector;
using Npgsql;
using Oracle.ManagedDataAccess.Client;
using System.Data;
using System.Text.RegularExpressions;

namespace Development.Assistant.Modules.Repository;

public class IntrospectionRepository
{
    public IEnumerable<ColumnInfoMod> GetColumnsQuery(string connectionString, string dbType, string tableName, string schema = "dbo_schema")
    {
        tableName = ValidateIdentifier(tableName, nameof(tableName));
        schema = ValidateIdentifier(schema, nameof(schema));

        var query = dbType switch
        {
            Constants.DbType.MariaDb => string.Format(SqlQueries.MySql.GetColumns, tableName),
            Constants.DbType.SqlServer => string.Format(SqlQueries.SqlServer.GetColumns, tableName),
            Constants.DbType.Oracle => string.Format(SqlQueries.Oracle.GetColumns, tableName),
            Constants.DbType.PostgreSql => string.Format(SqlQueries.PostgreSql.GetColumns, tableName, schema),
            _ => throw new ArgumentException($"DbType não suportado: {dbType}")
        };

        using var con = CreateDbConnection(connectionString, dbType);
        return con.Query<ColumnInfoMod>(query).ToList();
    }

    public int GetCountRegistersQuery(string connectionString, string dbType, string tableName, string schema = "dbo_schema")
    {
        tableName = ValidateIdentifier(tableName, nameof(tableName));
        schema = ValidateIdentifier(schema, nameof(schema));

        var query = dbType switch
        {
            Constants.DbType.MariaDb => string.Format(SqlQueries.MySql.GetCountRegisters, tableName),
            Constants.DbType.SqlServer => string.Format(SqlQueries.SqlServer.GetCountRegisters, tableName),
            Constants.DbType.Oracle => string.Format(SqlQueries.Oracle.GetCountRegisters, tableName),
            Constants.DbType.PostgreSql => string.Format(SqlQueries.PostgreSql.GetCountRegisters, schema, tableName),
            _ => throw new ArgumentException($"DbType não suportado: {dbType}")
        };

        using var con = CreateDbConnection(connectionString, dbType);
        return con.QueryFirstOrDefault<int>(query);
    }

    public IEnumerable<string> GetTablesQuery(string connectionString, string dbType, string schema = "dbo_schema")
    {
        schema = ValidateIdentifier(schema, nameof(schema));

        var query = dbType switch
        {
            Constants.DbType.MariaDb => SqlQueries.MySql.GetTables,
            Constants.DbType.SqlServer => SqlQueries.SqlServer.GetTables,
            Constants.DbType.Oracle => SqlQueries.Oracle.GetTables,
            Constants.DbType.PostgreSql => string.Format(SqlQueries.PostgreSql.GetTables, schema),
            _ => throw new ArgumentException($"DbType não suportado: {dbType}")
        };

        using var con = CreateDbConnection(connectionString, dbType);
        return con.Query<string>(query).ToList();
    }

    public string GetDatabaseName(string connectionString, string dbType)
    {
        var query = dbType switch
        {
            Constants.DbType.MariaDb => SqlQueries.MySql.GetDatabaseName,
            Constants.DbType.SqlServer => SqlQueries.SqlServer.GetDatabaseName,
            Constants.DbType.Oracle => SqlQueries.Oracle.GetDatabaseName,
            Constants.DbType.PostgreSql => SqlQueries.PostgreSql.GetDatabaseName,
            _ => throw new ArgumentException($"DbType não suportado: {dbType}")
        };

        using var con = CreateDbConnection(connectionString, dbType);
        return con.QueryFirstOrDefault<string>(query);
    }

    private static IDbConnection CreateDbConnection(string connectionString, string dbType)
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

    private static string ValidateIdentifier(string value, string paramName)
    {
        if (value.IsEmpty())
            throw new ArgumentException($"{paramName} não informado", paramName);

        if (!Regex.IsMatch(value, @"^[A-Za-z_][A-Za-z0-9_]*$"))
            throw new ArgumentException($"{paramName} contém caracteres inválidos", paramName);

        return value;
    }
}
