using Development.Assistant.Back.Domain.Models;
using Development.Assistant.Back.Infra.CrossCutting;
using System.Data;

namespace Development.Assistant.Back.Domain.Interfaces.Repository
{
    public interface IBaseRepository
    {
        IEnumerable<ColumnInfo> GetColumnsQuery(string connectionString, Constants.DbType dbType, string tableName, string schema = "dbo_schema");
        int GetCountRegistersQuery(string connectionString, Constants.DbType dbType, string tableName, string schema = "dbo_schema");
        IEnumerable<string> GetTablesQuery(string connectionString, Constants.DbType dbType, string schema = "dbo_schema");
        string GetDatabaseName(string connectionString, Constants.DbType dbType);
        IDbConnection CreateDbConnection(string connectionString, Constants.DbType dbType);
    }
}
