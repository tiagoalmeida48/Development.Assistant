using Development.Assistant.Modules.Common.Extensions;
using Dapper;
using Development.Assistant.Modules.Models;
using Development.Assistant.Modules.Common;
using System.Text;

namespace Development.Assistant.Modules.Repository;

public class UserRepository(ApiContext apiContext) : BaseRepository(apiContext)
{
    private const string Columns = "Id, Username, Login, Password";

    public UserMod GetUserLogged()
    {
        const string sql = $"SELECT {Columns} FROM `user` WHERE Id = @UserLogged LIMIT 1";

        using var con = Conn;
        return con.QueryFirstOrDefault<UserMod>(sql, new { UserLogged = _userLogged });
    }

    public IEnumerable<UserMod> Search(int id = 0, string login = null)
    {
        var param = new DynamicParameters();
        var sb = new StringBuilder();

        sb.Append($"SELECT {Columns} FROM `user` WHERE 1 = 1 ");

        if (id > 0)
        {
            sb.Append(" AND id = @id ");
            param.Add("id", id);
        }

        if (login.IsNotEmpty())
        {
            sb.Append(" AND login = @login ");
            param.Add("login", login);
        }

        using var con = Conn;
        return con.Query<UserMod>(sb.ToString(), param);
    }

    public bool Create(UserMod user)
    {
        const string sql = "INSERT INTO `user` (Username, Login, Password) VALUES (@Username, @Login, @Password)";

        using var con = Conn;
        return con.Execute(sql, user) > 0;
    }

    public bool Update(UserMod user)
    {
        const string sql = "UPDATE `user` SET Username = @Username, Login = @Login, Password = @Password WHERE Id = @Id";

        using var con = Conn;
        return con.Execute(sql, user) > 0;
    }
}