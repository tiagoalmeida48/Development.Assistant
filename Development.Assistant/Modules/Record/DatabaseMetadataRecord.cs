using Development.Assistant.Modules.Models;

namespace Development.Assistant.Modules.Record;

public record DatabaseMetadataRecord(string PathGeral,
                                 string Database,
                                 string ProjectName,
                                 string Namespace,
                                 string TableNameOriginal,
                                 string TableName,
                                 string TableProp,
                                 string ColumnsKey,
                                 IEnumerable<ColumnInfoMod> Columns,
                                 bool ExistText,
                                 string ExcludePrefixTable);