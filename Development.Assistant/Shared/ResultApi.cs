using System.Text.Json.Serialization;

namespace Development.Assistant.Shared;

public class ResultApi<T>
{
    [JsonPropertyName("success")]
    public bool Success { get; set; } = true;

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("internalError")]
    public long InternalError { get; set; }

    [JsonPropertyName("result")]
    public T Result { get; set; }
}