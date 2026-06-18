using Dapper;
using Development.Assistant.Modules.Models;
using Development.Assistant.Modules.Common;
using System.Text;

namespace Development.Assistant.Modules.Repository;

public class InputHistoryRepository(ApiContext apiContext) : BaseRepository(apiContext)
{
    public IEnumerable<InputHistoryMod> Search(int id = 0, string input = null, string valueInput = null, string databaseType = null)
    {
        var param = new DynamicParameters();
        var sb = new StringBuilder();

        param.Add("user", _UserLogged);
        sb.Append("SELECT * FROM input_history WHERE `user` = @user ");

        if (id > 0)
        {
            sb.Append(" AND id = @id ");
            param.Add("id", id);
        }

        if (input.IsNotEmpty())
        {
            sb.Append(" AND `input` = @input ");
            param.Add("input", input);
        }

        if (valueInput.IsNotEmpty())
        {
            sb.Append(" AND value_input LIKE @value_input ESCAPE '|' ");
            param.Add("value_input", $"%{valueInput}%");
        }

        if (databaseType.IsNotEmpty())
        {
            sb.Append(" AND database_type = @database_type ");
            param.Add("database_type", databaseType);
        }

        sb.Append(" ORDER BY id DESC ");

        using var con = Conn;
        return con.Query<InputHistoryMod>(sb.ToString(), param);
    }

    public bool Create(string input, string valueInput, string databaseType = null)
    {
        const string sql = "INSERT INTO input_history (`USER`, `INPUT`, VALUE_INPUT, DATABASE_TYPE) VALUES(@User, @Input, @ValueInput, @DatabaseType);";

        using var con = Conn;
        return con.Execute(sql, new { User = _UserLogged, Input = input, ValueInput = valueInput, DatabaseType = databaseType }) > 0;
    }

    public bool Delete(int id)
    {
        const string sql = "DELETE FROM input_history WHERE ID = @Id AND USER = @User;";

        using var con = Conn;
        return con.Execute(sql, new { User = _UserLogged, Id = id }) > 0;
    }
}