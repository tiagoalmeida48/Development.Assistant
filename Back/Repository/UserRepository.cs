using Dapper;
using Development.Assistant.Back.Models;
using Development.Assistant.Back.Utils;
using System.Text;

namespace Development.Assistant.Back.Repository;

public class UserRepository(ApiContext apiContext) : BaseRepository(apiContext)
{
    public IEnumerable<UserMod> Search(int id = 0, string login = null)
    {
        var param = new DynamicParameters();
        var sb = new StringBuilder();
        
        sb.Append("SELECT * FROM `user` WHERE 1 = 1 ");

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
        return con.ExecuteScalar<bool>(sql, user);
    }
    
    public bool Update(UserMod user)
    {
        const string sql = "UPDATE `user` SET Username = @Username, Login = @Login, Password = @Password WHERE Id = @Id";

        using var con = Conn;
        return con.ExecuteScalar<bool>(sql, user);
    }
}