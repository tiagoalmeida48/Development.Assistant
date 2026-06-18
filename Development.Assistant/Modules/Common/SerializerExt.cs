using System.Text.Json;
using System.Text.Json.Serialization;

namespace Development.Assistant.Modules.Common;

public static class Serializer
{
    public readonly static JsonSerializerOptions JsonOptions = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false,
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public static TData Deserialize<TData>(this string jsonEnt) where TData : class
    {
        if (jsonEnt.IsNotEmpty())
            return JsonSerializer.Deserialize<TData>(jsonEnt, JsonOptions);

        return null;
    }

    extension(object entityToSer)
    {
        public string Serialize()
        {
            if (entityToSer == null) return string.Empty;

            var res = JsonSerializer.Serialize(entityToSer, JsonOptions);
            return res;
        }

        public TDestiny MapTo<TDestiny>() where TDestiny : class
        {
            return entityToSer.Serialize().Deserialize<TDestiny>();
        }
    }
}