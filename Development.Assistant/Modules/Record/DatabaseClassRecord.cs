namespace Development.Assistant.Modules.Record;

public record DatabaseClassRecord(string Database1,
                               string Database2,
                               List<TableDiffRecord> Tables,
                               List<ColumnTableDiffRecord> Columns,
                               List<RegisterClassRecord> RegisterTables);

public record TableDiffRecord(string Table1, string Table2);

public record ColumnTableDiffRecord(string Table, List<ColumnSideDiffRecord> Columns);

public record ColumnSideDiffRecord(string Column1, string Type1, string Column2, string Type2);

public record RegisterClassRecord(string Table, int TotalRegisters1, int TotalRegisters2);