using System.ComponentModel.DataAnnotations.Schema;

namespace Development.Assistant.Back.Models;

public class InputHistory
{
    public int Id { get; set; }
    public int User { get; set; }
    public string Input { get; set; }
    
    [Column("value_input")]
    public string ValueInput { get; set; }
}

public class InputHistoryRequest
{
    public InputHistoryRequest(string input, string valueInput)
    {
        Input = input;
        ValueInput = valueInput;
    }

    public string Input { get; set; }
    public string ValueInput { get; set; }
}