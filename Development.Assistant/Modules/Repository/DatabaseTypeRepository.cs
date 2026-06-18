using Dapper;
using Development.Assistant.Modules.Common;
using Development.Assistant.Modules.Models;

namespace Development.Assistant.Modules.Repository;

public class DatabaseTypeRepository(ApiContext apiContext) : BaseRepository(apiContext)
{
    public IEnumerable<DatabaseTypeMod> All()
    {
        const string query = "SELECT Id, Name FROM database_type";

        using var con = Conn;
        return con.Query<DatabaseTypeMod>(query);
    }
}
