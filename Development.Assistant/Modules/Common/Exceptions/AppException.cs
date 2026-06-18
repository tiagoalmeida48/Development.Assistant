namespace Development.Assistant.Modules.Common.Exceptions;

public abstract class AppException(string message, int statusCode) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
    public int InternalError { get; } = statusCode;
}