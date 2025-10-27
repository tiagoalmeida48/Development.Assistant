using Development.Assistant.Back.Domain.Interfaces.Services;
using Development.Assistant.Back.Domain.Models;
using Development.Assistant.Back.Infra.CrossCutting;

namespace Development.Assistant.Back.GraphQL;

public class Query
{
    public async Task<DatabaseComparisonResult> CompareDatabases([Service] ICompareDatabaseService compareDatabaseService, string connectionString1, string connectionString2, Constants.DbType dbType)
    {
        var result = await compareDatabaseService.CompareAsync(connectionString1, connectionString2, dbType);

        return new DatabaseComparisonResult
        {
            Database1 = result.Database1,
            Database2 = result.Database2,
            DifferentTables = result.Tables,
            DifferentRegisters = result.RegisterTables
        };
    }

    public async Task<List<string>> GetTables([Service] IScribanCodeGeneratorService pocoClassService, string connectionString, Constants.DbType dbType)
    {
        var tables = await Task.Run(() => pocoClassService.AllTables(connectionString, dbType));
        return tables.ToList();
    }

    public string GetDatabaseTypes()
    {
        var types = Enum.GetNames<Constants.DbType>();
        return string.Join(", ", types);
    }
}

public class DatabaseComparisonResult
{
    public string Database1 { get; set; }
    public string Database2 { get; set; }
    public List<TableClass> DifferentTables { get; set; }
    public List<RegisterClass> DifferentRegisters { get; set; }
}
