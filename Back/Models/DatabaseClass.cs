namespace Development.Assistant.Back.Models;

public class DatabaseClass
{
    public string Database1 { get; set; }
    public string Database2 { get; set; }
    public List<TableClass> Tables { get; set; }
    public List<RegisterClass> RegisterTables { get; set; }
}

public class TableClass
{
    public string Database { get; set; } 
    public string Table { get; set; }
    public List<ColumnInfo> Columns { get; set; }
    public int TotalRegisters { get; set; }
}

public class ColumnInfo
{
    public string Name { get; set; }
    public string Type { get; set; }
    public bool IsPrimaryKey { get; set; }
    public bool IsIdentity { get; set; }
    public bool IsNullable { get; set; }
}

public class RegisterClass
{
    public string Table { get; set; }
    public int TotalRegisters1 { get; set; }
    public int TotalRegisters2 { get; set; }
}

// DTOs for API requests
public class CompareDatabasesRequest
{
    public string ConnectionString1 { get; set; }
    public string ConnectionString2 { get; set; }
    public string DbType { get; set; }
}

public class GetTablesRequest
{
    public string ConnectionString { get; set; }
    public string DbType { get; set; }
}