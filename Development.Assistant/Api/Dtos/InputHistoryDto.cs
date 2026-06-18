namespace Development.Assistant.Api.Dtos;

public record InputHistoryDto(int Id,
                              int User,
                              string Input,
                              string ValueInput,
                              string DatabaseType);

public record CreateInputHistoryDto(string Input,
                                    string ValueInput,
                                    string DatabaseType);