namespace Development.Assistant.Modules.Record;

public record InputHistoryRecord(int Id,
                              int User,
                              string Input,
                              string ValueInput,
                              string DatabaseType);

public record CreateInputHistoryRecord(string Input,
                                    string ValueInput,
                                    string DatabaseType);