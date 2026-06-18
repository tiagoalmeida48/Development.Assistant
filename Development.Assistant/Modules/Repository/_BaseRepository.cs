using Development.Assistant.Modules.Common;
using MySqlConnector;
using System.Data;

namespace Development.Assistant.Modules.Repository;

public class BaseRepository(ApiContext apiContext)
{
    protected readonly string _connStr = apiContext.Conn;
    protected readonly int _userLogged = apiContext.User;

    protected IDbConnection Conn => new MySqlConnection(_connStr);
}
