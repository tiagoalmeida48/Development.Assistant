using Development.Assistant.Back.Utils;

namespace Development.Assistant.Back.Models;

public class InfoFullClass
{
    public InfoFullClass(Constants.DbType database, InfoClass infoClass, string tableNameOriginal, string tableName, string tableProp, string columnsKey, IEnumerable<ColumnInfo> columns, bool existText)
    {
        Database = database;
        InfoClass = infoClass;
        TableNameOriginal = tableNameOriginal;
        TableName = tableName;
        TableProp = tableProp;
        ColumnsKey = columnsKey;
        Columns = columns;
        ExistText = existText;
    }
    
    public Constants.DbType Database { get; set; }
    public InfoClass InfoClass { get; set; }
    public string TableNameOriginal { get; set; }
    public string TableName { get; set; }
    public string TableProp { get; set; }
    public string ColumnsKey { get; set; }
    public IEnumerable<ColumnInfo> Columns { get; set; }
    public bool ExistText { get; set; }
}