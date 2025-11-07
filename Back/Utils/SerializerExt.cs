using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Development.Assistant.Back.Utils;

public static class Serializer
{
    public readonly static JsonSerializerSettings JsonStt = new()
    {
        Formatting = Formatting.None,
        ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
        NullValueHandling = NullValueHandling.Ignore,
       ContractResolver = new CamelCasePropertyNamesContractResolver(),
    };

    public static TData Deserialize<TData>(this string jsonEnt)
    {
        if (jsonEnt.IsNotEmpty())
            return JsonConvert.DeserializeObject<TData>(jsonEnt, JsonStt);

        return default;
    }

    public static string Serialize(this object entityToSer)
    {
        if (entityToSer == null) return string.Empty;

        var res = JsonConvert.SerializeObject(entityToSer, JsonStt);
        return res;
    }

    public static TDestiny MapTo<TDestiny>(this object entity)
    {
        return entity.Serialize().Deserialize<TDestiny>();
    }
}