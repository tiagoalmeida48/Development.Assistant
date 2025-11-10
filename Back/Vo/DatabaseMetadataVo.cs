using Development.Assistant.Back.Models;

namespace Development.Assistant.Back.Vo;

public class DatabaseMetadataVo
{
    public string PathGeral { get; set; }
    public string Database { get; set; }
    public string ProjectName { get; set; }
    public string Namespace { get; set; }
    public string TableNameOriginal { get; set; }
    public string TableName { get; set; }
    public string TableProp { get; set; }
    public string ColumnsKey { get; set; }
    public IEnumerable<ColumnInfo> Columns { get; set; }
    public bool ExistText { get; set; }
    public string ExcludePrefixTable { get; set; }
}