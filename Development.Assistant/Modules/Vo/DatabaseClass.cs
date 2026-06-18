using Development.Assistant.Modules.Models;

namespace Development.Assistant.Modules.Vo;

public class DatabaseClass
{
    public string Database1 { get; set; }
    public string Database2 { get; set; }
    public List<TableDiff> Tables { get; set; } = [];
    public List<ColumnTableDiff> Columns { get; set; } = [];
    public List<RegisterClass> RegisterTables { get; set; } = [];
}

public class TableDiff
{
    public string Table1 { get; set; }
    public string Table2 { get; set; }
}

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
    public List<ColumnInfoMod> Columns { get; set; }
    public int TotalRegisters { get; set; }
}

public class RegisterClass
{
    public string Table { get; set; }
    public int TotalRegisters1 { get; set; }
    public int TotalRegisters2 { get; set; }
}