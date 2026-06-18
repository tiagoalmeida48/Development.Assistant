namespace Development.Assistant.Modules.Common.Exceptions;

public class BadRequestException : AppException
{
    public BadRequestException(string message) : base(message, 400) { }
}