using Development.Assistant.Back.Utils;

namespace Development.Assistant.Back.Dto;

public class InfoClassDto
{
    public string ConnectionString { get; set; }
    public Constants.DbType DbType { get; set; }
    public Constants.Template Template { get; set; }
    public string PathGeral { get; set; }
    public string ProjectName { get; set; }
    public string NameSpace { get; set; }
    public string ExcludePrefixTable { get; set; }
    public IEnumerable<string> Tables { get; set; }
}