using Dapper;
using Development.Assistant.Back.Models;
using Development.Assistant.Back.Utils;
using System.Text;

namespace Development.Assistant.Back.Repository;

public class InputHistoryRepository(ApiContext apiContext) : BaseRepository(apiContext)
{
    public IEnumerable<InputHistory> Search(int id = 0, string input = null, string valueInput = null)
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
        
        sb.Append(" ORDER BY id DESC ");
      
        using var con = Conn;
        return con.Query<InputHistory>(sb.ToString(), param);
    }

    public bool Create(string input, string valueInput)
    {
        const string sql = "INSERT INTO input_history (`USER`, `INPUT`, VALUE_INPUT) VALUES(@User, @Input, @ValueInput);";

        using var con = Conn;
        return con.ExecuteScalar<bool>(sql, new { User = _UserLogged, Input = input, ValueInput = valueInput });
    }

    public bool Delete(int[] ids)
    {
        const string sql = "DELETE FROM input_history WHERE ID IN @Ids AND USER = @User;";

        using var con = Conn;
        return con.ExecuteScalar<bool>(sql, new { User = _UserLogged, Ids = ids });
    }
}