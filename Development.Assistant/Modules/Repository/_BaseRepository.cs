using Development.Assistant.Modules.Common;
using MySqlConnector;
using System.Data;

namespace Development.Assistant.Modules.Repository;

public class BaseRepository
{
    protected readonly string _ConnStr;
    protected readonly int _UserLogged;

    public BaseRepository(ApiContext apiContext)
    {
        _UserLogged = apiContext.User;
        _ConnStr = apiContext.Conn;
    }

    protected IDbConnection Conn => new MySqlConnection(_ConnStr);
}