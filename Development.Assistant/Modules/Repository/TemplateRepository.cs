using Dapper;
using Development.Assistant.Modules.Common;
using Development.Assistant.Modules.Models;

namespace Development.Assistant.Modules.Repository;

public class TemplateRepository(ApiContext apiContext) : BaseRepository(apiContext)
{
    public IEnumerable<TemplateMod> All()
    {
        const string query = "SELECT Id, Name FROM template";

        using var con = Conn;
        return con.Query<TemplateMod>(query);
    }
}
