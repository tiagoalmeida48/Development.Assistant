using Development.Assistant.Back.Models;
using Development.Assistant.Back.Repository;
using Development.Assistant.Back.Services;
using Development.Assistant.Back.Utils;

namespace Development.Assistant.Back.Domain.Services;

public class CompareDatabaseService(MetadataRepository repository, InputHistoryService inputHistorySrv) 
{
    public DatabaseClass Compare(string connectionString1, string connectionString2, string dbType)
    {
        try
        {
            var database1Task = GetInfoDatabaseAsync(connectionString1, dbType);
            var database2Task = GetInfoDatabaseAsync(connectionString2, dbType);

            var results = Task.WhenAll(database1Task, database2Task).Result;

            var database1 = results[0];
            var database2 = results[1];

            var model = new DatabaseClass
            {
                Database1 = database1.Item1,
                Database2 = database2.Item1,
                Tables = CompareTables(database1, database2),
                RegisterTables = CompareRegisterLists(database1, database2)
            };

            var inputsValue = new List<InputHistoryMod>();
            inputsValue.Add(new InputHistoryMod(Constants.InputName.Conn1, connectionString1));
            inputsValue.Add(new InputHistoryMod(Constants.InputName.Conn2, connectionString2));
          
            inputHistorySrv.Create(inputsValue);
            
            return model;
        }
        catch (Exception e)
        {
            throw new Exception($"Erro ao comparar bancos de dados: {e.Message}");
        }
    }

    private static List<RegisterClass> CompareRegisterLists((string, List<TableClass>) database1, (string, List<TableClass>) database2)
    {
        var registerList = new List<RegisterClass>();

        var database2Dict = database2.Item2.ToDictionary(t => t.Table, t => t);

        foreach (var table1 in database1.Item2)
        {
            if (!database2Dict.TryGetValue(table1.Table, out var table2))
                continue;

            if (table1.TotalRegisters != table2.TotalRegisters)
                registerList.Add(new RegisterClass
                {
                    Table = table1.Table,
                    TotalRegisters1 = table1.TotalRegisters,
                    TotalRegisters2 = table2.TotalRegisters
                });
        }

        return registerList;
    }

    private async Task<(string, List<TableClass>)> GetInfoDatabaseAsync(string connectionString, string dbType)
    {
        var databaseName = repository.GetDatabaseName(connectionString, dbType);
        var tableNames = repository.GetTablesQuery(connectionString, dbType).ToList();

        var tablesData = await Task.WhenAll(
            tableNames.Select(async tableName =>
            {
                var columnsTask = Task.Run(() => repository.GetColumnsQuery(connectionString, dbType, tableName));
                var countTask = Task.Run(() => repository.GetCountRegistersQuery(connectionString, dbType, tableName));

                await Task.WhenAll(columnsTask, countTask);

                return new TableClass
                {
                    Table = tableName,
                    Columns = columnsTask.Result.ToList(),
                    TotalRegisters = countTask.Result
                };
            })
        );

        return (databaseName, tablesData.ToList());
    }

    private static List<TableClass> CompareTables((string, List<TableClass>) database1, (string, List<TableClass>) database2)
    {
        var tablesDiff = new List<TableClass>();

        tablesDiff.AddRange(CompareTableLists(database1.Item2, database2.Item2, database2.Item1));
        tablesDiff.AddRange(CompareTableLists(database2.Item2, database1.Item2, database1.Item1));

        return tablesDiff.OrderBy(x => x.Table).ToList();
    }

    private static List<TableClass> CompareTableLists(List<TableClass> sourceTables, List<TableClass> targetTables, string database)
    {
        var tables = new List<TableClass>();
        foreach (var sourceTable in sourceTables)
        {
            var targetTable = targetTables.FirstOrDefault(t => t.Table == sourceTable.Table);
            if (targetTable == null)
                tables.Add(new TableClass
                {
                    Database = database,
                    Table = sourceTable.Table
                });
            else
            {
                var columns = CompareColumns(sourceTable.Columns, targetTable.Columns);
                if (columns.Count > 0)
                    tables.Add(new TableClass
                    {
                        Database = database,
                        Table = sourceTable.Table,
                        Columns = columns
                    });
            }
        }

        return tables;
    }

    private static List<ColumnInfo> CompareColumns(List<ColumnInfo> columns1, List<ColumnInfo> columns2)
    {
        var columns = new List<ColumnInfo>();

        foreach (var column1 in columns1)
        {
            if (!columns2.Any(c => c.Name == column1.Name))
                columns.Add(new ColumnInfo { Name = column1.Name, Type = column1.Type });
        }

        foreach (var column2 in columns2)
        {
            if (!columns1.Any(c => c.Name != column2.Name) && !columns1.Any(c => c.Name == column2.Name))
                columns.Add(new ColumnInfo { Name = column2.Name, Type = column2.Type });
        }

        return columns;
    }
}