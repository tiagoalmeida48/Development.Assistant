namespace Development.Assistant.Back.Utils;

public class ResultApi<T>
{
    public bool Success { get; set; } = true;
    public string Message { get; set; } = string.Empty;
    public long InternalError { get; set; }
    public T Result { get; set; }
}