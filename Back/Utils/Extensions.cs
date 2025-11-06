namespace Development.Assistant.Back.Utils;

public static class Extensions
{
    public static bool IsEmpty(this string value)
    {
        return string.IsNullOrWhiteSpace(value);
    }
    
    public static bool IsNotEmpty(this string value)
    {
        return !IsEmpty(value);
    }
    
    public static string ConvertToPascalCase(this string value)
    {
        if (!value.Contains('_'))
            return char.ToUpper(value[0]) + value[1..].ToLower();
            
        var tbSplit = value.Split('_');
        return string.Join("", tbSplit.Select(s => char.ToUpper(s[0]) + s[1..].ToLower()));

    }

    public static string ConvertToCamelCase(this string value)
    {
        return char.ToLowerInvariant(value[0]) + value[1..];
    }

    public static string RemoveColumnTypes(this string value)
    {
        value = value.Replace("int ", "").Replace("long ", "").Replace("double ", "").Replace("decimal ", "").Replace("bool ", "").Replace("DateTime ", "").Replace("string ", "");
        return value;
    }
}