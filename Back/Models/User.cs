namespace Development.Assistant.Back.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Login { get; set; }
    public string Password { get; set; }
}

public class LoginRequest
{
    public string Login { get; set; }
    public string Password { get; set; }
}