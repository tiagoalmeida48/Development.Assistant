using Newtonsoft.Json;

namespace Development.Assistant.Back.Utils;

public class ResultApi<T>
{
    [JsonProperty(nameof(Success))]
    public bool Success { get; set; } = true;

    [JsonProperty(nameof(Message))]
    public string Message { get; set; } = string.Empty;

    [JsonProperty(nameof(InternalError))]
    public long InternalError { get; set; }

    [JsonProperty(nameof(Result))]
    public T Result { get; set; }
}