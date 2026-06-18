namespace Development.Assistant.Modules.Record;

public record UserRecord(int Id,
                      string Username,
                      string Login);

public record UserCreateRecord(string Username,
                            string Login,
                            string Password);

public record UserUpdateRecord(int Id,
                            string Username,
                            string Login,
                            string Password);