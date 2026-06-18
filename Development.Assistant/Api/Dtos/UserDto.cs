namespace Development.Assistant.Api.Dtos;

public record UserDto(int Id, 
                      string Username, 
                      string Login);

public record UserCreateDto(string Username, 
                            string Login, 
                            string Password);

public record UserUpdateDto(int Id, 
                            string Username, 
                            string Login, 
                            string Password);