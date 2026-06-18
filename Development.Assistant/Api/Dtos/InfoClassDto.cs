namespace Development.Assistant.Api.Dtos;

public record InfoClassDto(string ConnectionString,
                           string DbType,
                           string Template,
                           string ProjectName,
                           string NameSpace,
                           string ExcludePrefixTable,
                           IEnumerable<string> Tables);