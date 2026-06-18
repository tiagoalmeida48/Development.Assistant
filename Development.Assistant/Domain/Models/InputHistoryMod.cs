using System.ComponentModel.DataAnnotations.Schema;

namespace Development.Assistant.Domain.Models;

public class InputHistoryMod
{
    public InputHistoryMod() { }

    public InputHistoryMod(string input, string valueInput, string databaseType = null)
    {
        Input = input;
        ValueInput = valueInput;
        DatabaseType = databaseType;
    }

    public int Id { get; set; }
    public int User { get; set; }
    public string Input { get; set; }

    [Column("value_input")]
    public string ValueInput { get; set; }

    [Column("database_type")]
    public string DatabaseType { get; set; }
}