namespace Development.Assistant.Modules.Record;

public record InfoClassRecord(string ConnectionString,
                           string DbType,
                           string Template,
                           string ProjectName,
                           string NameSpace,
                           string ExcludePrefixTable,
                           IEnumerable<string> Tables);