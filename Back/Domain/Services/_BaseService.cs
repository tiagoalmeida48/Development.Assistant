using Development.Assistant.Back.Domain.Interfaces.Repository;
using Development.Assistant.Back.Domain.Interfaces.Services;
using Development.Assistant.Back.Domain.Models;
using Development.Assistant.Back.Infra.CrossCutting;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Data;

namespace Development.Assistant.Back.Domain.Services;

public class BaseService(IBaseRepository baseRep) : IBaseService
{
    public IDbConnection CreateDbConnection(string connectionString, Constants.DbType dbType)
    {
        return baseRep.CreateDbConnection(connectionString, dbType);
    }

    public IEnumerable<ColumnInfo> GetColumnsQuery(string connectionString, Constants.DbType dbType, string tableName)
    {
        return baseRep.GetColumnsQuery(connectionString, dbType, tableName);
    }

    public int GetCountRegistersQuery(string connectionString, Constants.DbType dbType, string tableName)
    {
        return baseRep.GetCountRegistersQuery(connectionString, dbType, tableName);
    }

    public string GetDatabaseName(string connectionString, Constants.DbType dbType)
    {
        return baseRep.GetDatabaseName(connectionString, dbType);
    }

    public IEnumerable<string> GetTablesQuery(string connectionString, Constants.DbType dbType)
    {
        return baseRep.GetTablesQuery(connectionString, dbType);
    }

    public List<SelectListItem> AllDbTypes()
    {
        var dbTypes = Enum.GetValues<Constants.DbType>();
        var selectItems = new List<SelectListItem>();

        foreach (var dbType in dbTypes)
            selectItems.Add(new SelectListItem { Value = dbType.ToString(), Text = dbType.ToString() });

        return selectItems;
    }
}