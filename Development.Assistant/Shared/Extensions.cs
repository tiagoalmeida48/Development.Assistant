namespace Development.Assistant.Shared;

public static class Extensions
{
    extension(string value)
    {
        public bool IsEmpty() => string.IsNullOrWhiteSpace(value);
        
        public bool IsNotEmpty() => !value.IsEmpty();
        
        public string ConvertToPascalCase()
        {
            if (value.IsEmpty())
                return value;

            if (!value.Contains('_'))
                return value.Length == 1 ? char.ToUpper(value[0]).ToString() : char.ToUpper(value[0]) + value[1..].ToLower();

            var tbSplit = value.Split('_');
            return string.Join("", tbSplit.Select(s => s.Length == 0 ? "" : char.ToUpper(s[0]) + s[1..].ToLower()));

        }
        
        public string ConvertToCamelCase()
        {
            if (value.IsEmpty())
                return value;

            return value.Length == 1 ? char.ToLowerInvariant(value[0]).ToString() : char.ToLowerInvariant(value[0]) + value[1..];
        }
        
        public string RemoveColumnTypes()
        {
            value = value.Replace("int ", "").Replace("long ", "").Replace("double ", "").Replace("decimal ", "").Replace("bool ", "").Replace("DateTime ", "").Replace("string ", "");
            return value;
        }
        
        public string ToObjectInitializerAssignments()
        {
            if (value.IsEmpty())
                return string.Empty;

            var parameters = value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            return string.Join(", ", parameters.Select(parameter =>
            {
                var parts = parameter.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                var variableName = parts.Length > 1 ? parts[^1] : parts[0];
                return $"{variableName.ConvertToPascalCase()} = {variableName}";
            }));
        }
        
        public string ToRequiredCondition()
        {
            if (value.IsEmpty())
                return "false";

            var parameters = value.RemoveColumnTypes().Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            return string.Join(" || ", parameters.Select(parameter => $"{parameter} == default"));
        }
    }

}
