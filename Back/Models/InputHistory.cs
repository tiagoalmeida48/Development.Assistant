using System.ComponentModel.DataAnnotations.Schema;

namespace Development.Assistant.Back.Models;

public class InputHistory
{
    public InputHistory()
    {
    }

    public InputHistory(string input, string valueInput)
    {
        Input = input;
        ValueInput = valueInput;
    }

    public int Id { get; set; }
    public int User { get; set; }
    public string Input { get; set; }

    [Column("value_input")]
    public string ValueInput { get; set; }
}