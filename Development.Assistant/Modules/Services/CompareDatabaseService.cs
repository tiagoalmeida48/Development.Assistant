using Development.Assistant.Modules.Vo;
using Development.Assistant.Modules.Record;
using Development.Assistant.Modules.Repository;
using Development.Assistant.Modules.Common;
using Development.Assistant.Modules.Common.Extensions;

namespace Development.Assistant.Modules.Services;

public class CompareDatabaseService(IntrospectionRepository repository)
{
    public Task<DatabaseClass> CompareAsync(ConnectionStringRecord request)
    {
        var dbType1 = request.DbType1.IsEmpty() ? request.DbType : request.DbType1;
        var dbType2 = request.DbType2.IsEmpty() ? request.DbType : request.DbType2;

        return CompareAsync(request.ConnectionString1, request.ConnectionString2, dbType1, dbType2);
    }

    public async Task<DatabaseClass> CompareAsync(string connectionString1, string connectionString2, string dbType1, string dbType2)
    {
        var database1Task = GetInfoDatabaseAsync(connectionString1, dbType1);
        var database2Task = GetInfoDatabaseAsync(connectionString2, dbType2);

        var results = await Task.WhenAll(database1Task, database2Task);

        var database1 = results[0];
        var database2 = results[1];

        return new DatabaseClass
        {
            Database1 = database1.Name,
            Database2 = database2.Name,
            Tables = CompareTables(database1.Tables, database2.Tables),
            Columns = CompareColumns(database1.Tables, database2.Tables),
            RegisterTables = CompareRegisterLists(database1, database2)
        };
    }

    private static List<RegisterClass> CompareRegisterLists((string Name, List<TableClass> Tables) database1, (string Name, List<TableClass> Tables) database2)
    {
        var registerList = new List<RegisterClass>();
        var database2Dict = database2.Tables.ToDictionary(t => t.Table, t => t, StringComparer.OrdinalIgnoreCase);

        foreach (var table1 in database1.Tables)
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

    private async Task<(string Name, List<TableClass> Tables)> GetInfoDatabaseAsync(string connectionString, string dbType)
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
                    Columns = (await columnsTask).ToList(),
                    TotalRegisters = await countTask
                };
            })
        );

        return (databaseName, tablesData.ToList());
    }

    private static List<TableDiff> CompareTables(List<TableClass> tables1, List<TableClass> tables2)
    {
        var result = new List<TableDiff>();

        var names1 = tables1.Select(t => t.Table).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var names2 = tables2.Select(t => t.Table).ToHashSet(StringComparer.OrdinalIgnoreCase);

        var onlyIn1 = tables1.Where(t => !names2.Contains(t.Table)).Select(t => t.Table).OrderBy(x => x).ToList();
        var onlyIn2 = tables2.Where(t => !names1.Contains(t.Table)).Select(t => t.Table).OrderBy(x => x).ToList();

        var maxRows = Math.Max(onlyIn1.Count, onlyIn2.Count);
        for (var i = 0; i < maxRows; i++)
            result.Add(new TableDiff
            {
                Table1 = i < onlyIn1.Count ? onlyIn1[i] : null,
                Table2 = i < onlyIn2.Count ? onlyIn2[i] : null
            });

        return result;
    }

    private static List<ColumnTableDiff> CompareColumns(List<TableClass> tables1, List<TableClass> tables2)
    {
        var result = new List<ColumnTableDiff>();

        foreach (var table1 in tables1)
        {
            var table2 = tables2.FirstOrDefault(t => t.Table.Equals(table1.Table, StringComparison.OrdinalIgnoreCase));
            if (table2 == null) continue;

            var cols1 = table1.Columns ?? [];
            var cols2 = table2.Columns ?? [];

            var onlyIn1 = cols1.Where(c => !cols2.Any(c2 => c2.Name.Equals(c.Name, StringComparison.OrdinalIgnoreCase))).OrderBy(c => c.Name).ToList();
            var onlyIn2 = cols2.Where(c => !cols1.Any(c1 => c1.Name.Equals(c.Name, StringComparison.OrdinalIgnoreCase))).OrderBy(c => c.Name).ToList();

            if (onlyIn1.Count == 0 && onlyIn2.Count == 0) continue;

            var maxRows = Math.Max(onlyIn1.Count, onlyIn2.Count);
            var columns = new List<ColumnSideDiff>();
            for (var i = 0; i < maxRows; i++)
                columns.Add(new ColumnSideDiff
                {
                    Column1 = i < onlyIn1.Count ? onlyIn1[i].Name : null,
                    Type1 = i < onlyIn1.Count ? onlyIn1[i].Type : null,
                    Column2 = i < onlyIn2.Count ? onlyIn2[i].Name : null,
                    Type2 = i < onlyIn2.Count ? onlyIn2[i].Type : null
                });

            result.Add(new ColumnTableDiff { Table = table1.Table, Columns = columns });
        }

        return result.OrderBy(x => x.Table).ToList();
    }
}