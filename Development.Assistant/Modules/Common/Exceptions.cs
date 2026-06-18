namespace Development.Assistant.Modules.Common;

public abstract class AppException(string message, int statusCode) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
    public int InternalError => StatusCode;
}

public class BadRequestException(string message) : AppException(message, 400);

public class NotFoundException(string message) : AppException(message, 404);

public class UnauthorizedException(string message) : AppException(message, 401);
