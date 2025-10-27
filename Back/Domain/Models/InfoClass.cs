using Development.Assistant.Back.Infra.CrossCutting;

namespace Development.Assistant.Back.Domain.Models;

public class InfoClass
{
    public string ConnectionString { get; set; }
    public Constants.DbType DbType { get; set; }
    public string PathGeral { get; set; }
    public string ProjectName { get; set; }
    public string NameSpace { get; set; }
    public IEnumerable<string> Tables { get; set; }
}