namespace Development.Assistant.Modules.Record;

public record ConnectionStringRecord(string ConnectionString1,
                                  string ConnectionString2,
                                  string DbType,
                                  string DbType1,
                                  string DbType2);

public record ConnectionStringForSearchTablesRecord(string ConnectionString,
                                                 string DbType);

public record CopyProjectRecord(string SourceProjectPath,
                             string DestinationProjectPath,
                             string OldNamespace,
                             string NewNamespace);