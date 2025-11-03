using Development.Assistant.Back.Utils;

namespace Development.Assistant.Back.Models;

public class InfoClass
{
    public string ConnectionString { get; set; }
    public Constants.DbType DbType { get; set; }
    public Constants.Template Template { get; set; }
    public string PathGeral { get; set; }
    public string ProjectName { get; set; }
    public string NameSpace { get; set; }
    public IEnumerable<string> Tables { get; set; }
}