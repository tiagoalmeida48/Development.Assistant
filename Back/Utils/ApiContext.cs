namespace Development.Assistant.Back.Utils;

public class ApiContext
{
    public ApiContext(string conn)
    {
        Conn = conn;
    }

    public string Conn { get; set; }
    public int User { get; set; }
}