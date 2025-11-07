namespace Development.Assistant.Back.Dto;

public class DatabaseClassDto
{
    public string Database1 { get; set; }
    public string Database2 { get; set; }
    public List<TableClassDto> Tables { get; set; }
    public List<RegisterClassDto> RegisterTables { get; set; }
}

public class TableClassDto
{
    public string Database { get; set; } 
    public string Table { get; set; }
    public List<ColumnInfoDto> Columns { get; set; }
    public int TotalRegisters { get; set; }
}

public class ColumnInfoDto
{
    public string Name { get; set; }
    public string Type { get; set; }
    public bool IsPrimaryKey { get; set; }
    public bool IsIdentity { get; set; }
    public bool IsNullable { get; set; }
}

public class RegisterClassDto
{
    public string Table { get; set; }
    public int TotalRegisters1 { get; set; }
    public int TotalRegisters2 { get; set; }
}