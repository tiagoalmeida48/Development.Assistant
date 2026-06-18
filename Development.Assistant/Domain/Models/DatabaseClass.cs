using System.ComponentModel.DataAnnotations.Schema;

namespace Development.Assistant.Domain.Models;

public class DatabaseClass
{
    public string Database1 { get; set; }
    public string Database2 { get; set; }
    public List<TableDiff> Tables { get; set; } = [];
    public List<ColumnTableDiff> Columns { get; set; } = [];
    public List<RegisterClass> RegisterTables { get; set; } = [];
}

// Tabela existe em um banco mas não no outro
public class TableDiff
{
    public string Table1 { get; set; }
    public string Table2 { get; set; }
}

// Colunas que existem em um banco mas não no outro, agrupadas por tabela
public class ColumnTableDiff
{
    public string Table { get; set; }
    public List<ColumnSideDiff> Columns { get; set; } = [];
}

public class ColumnSideDiff
{
    public string Column1 { get; set; }
    public string Type1 { get; set; }
    public string Column2 { get; set; }
    public string Type2 { get; set; }
}

public class TableClass
{
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