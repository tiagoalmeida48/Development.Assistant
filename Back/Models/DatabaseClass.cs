using System.ComponentModel.DataAnnotations.Schema;

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
    
    [Column("is_primary_key")]
    public bool IsPrimaryKey { get; set; }
    
    [Column("is_identity")]
    public bool IsIdentity { get; set; }
    
    [Column("is_nullable")]
    public bool IsNullable { get; set; }
}

public class RegisterClass
{
    public string Table { get; set; }
    public int TotalRegisters1 { get; set; }
    public int TotalRegisters2 { get; set; }
}