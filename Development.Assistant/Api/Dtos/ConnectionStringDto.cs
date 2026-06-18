namespace Development.Assistant.Api.Dtos;

public record ConnectionStringDto(string ConnectionString1,
                                  string ConnectionString2,
                                  string DbType,
                                  string DbType1,
                                  string DbType2);

public record ConnectionStringForSearchTablesDto(string ConnectionString,
                                                 string DbType);

public record CopyProjectDto(string SourceProjectPath,
                             string DestinationProjectPath,
                             string OldNamespace,
                             string NewNamespace);