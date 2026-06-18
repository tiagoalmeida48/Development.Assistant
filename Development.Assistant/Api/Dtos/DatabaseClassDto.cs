namespace Development.Assistant.Api.Dtos;

public record DatabaseClassDto(string Database1,
                               string Database2,
                               List<TableDiffDto> Tables,
                               List<ColumnTableDiffDto> Columns,
                               List<RegisterClassDto> RegisterTables);

public record TableDiffDto(string Table1, string Table2);

public record ColumnTableDiffDto(string Table, List<ColumnSideDiffDto> Columns);

public record ColumnSideDiffDto(string Column1, string Type1, string Column2, string Type2);

public record RegisterClassDto(string Table, int TotalRegisters1, int TotalRegisters2);