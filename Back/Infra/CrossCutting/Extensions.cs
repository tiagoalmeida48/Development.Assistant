namespace Development.Assistant.Back.Infra.CrossCutting;

public static class Extensions
{
    public static string ConvertToPascalCase(this string value)
    {
        if (!value.Contains('_'))
            return char.ToUpper(value[0]) + value[1..].ToLower();
            
        var tbSplit = value.Split('_');
        return string.Join("", tbSplit.Select(s => char.ToUpper(s[0]) + s[1..].ToLower()));

    }

    public static string ConvertToCamelCase(this string value)
    {
        var newValue = value.ConvertToPascalCase();
        return char.ToLowerInvariant(newValue[0]) + newValue[1..];
    }

    public static string RemoveColumnTypes(this string value)
    {
        value = value.Replace("int ", "").Replace("long ", "").Replace("double ", "").Replace("decimal ", "").Replace("bool ", "").Replace("DateTime ", "").Replace("string ", "");
        return value;
    }
}