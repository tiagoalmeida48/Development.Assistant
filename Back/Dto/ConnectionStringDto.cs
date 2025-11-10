using Development.Assistant.Back.Utils;

namespace Development.Assistant.Back.Dto;

public class ConnectionStringDto
{
    public string ConnectionString1 { get; set; }
    public string ConnectionString2 { get; set; }
    public string DbType { get; set; }
}

public class ConnectionStringForSearchTablesDto
{
    public string ConnectionString { get; set; }
    public string DbType { get; set; }
}