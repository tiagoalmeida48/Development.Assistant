using Development.Assistant.Domain.Models;

namespace Development.Assistant.Domain.ValueObjects;

public record DatabaseMetadataVo(string PathGeral,
                                 string Database,
                                 string ProjectName,
                                 string Namespace,
                                 string TableNameOriginal,
                                 string TableName,
                                 string TableProp,
                                 string ColumnsKey,
                                 IEnumerable<ColumnInfo> Columns,
                                 bool ExistText,
                                 string ExcludePrefixTable);