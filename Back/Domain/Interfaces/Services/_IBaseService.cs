using Development.Assistant.Back.Domain.Models;
using Development.Assistant.Back.Infra.CrossCutting;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Data;

namespace Development.Assistant.Back.Domain.Interfaces.Services
{
    public interface IBaseService
    {
        IEnumerable<ColumnInfo> GetColumnsQuery(string connectionString, Constants.DbType dbType, string tableName);
        int GetCountRegistersQuery(string connectionString, Constants.DbType dbType, string tableName);
        IEnumerable<string> GetTablesQuery(string connectionString, Constants.DbType dbType);
        string GetDatabaseName(string connectionString, Constants.DbType dbType);
        IDbConnection CreateDbConnection(string connectionString, Constants.DbType dbType);
        List<SelectListItem> AllDbTypes();
    }
}