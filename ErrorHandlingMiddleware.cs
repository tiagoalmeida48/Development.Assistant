using Development.Assistant.Back.Exceptions;
using System.Net;
using System.Text.Json;
using Development.Assistant.Back.Utils;

namespace Development.Assistant;

public class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ocorreu uma exceção não tratada: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, internalError) = exception switch
        {
            UnauthorizedException => (HttpStatusCode.Unauthorized, 401),
            NotFoundException => (HttpStatusCode.NotFound, 404),
            BadRequestException => (HttpStatusCode.BadRequest, 400),
            _ => (HttpStatusCode.InternalServerError, 500)
        };
        var errorResponse = new ResultApi<object>
        {
            Success = false,
            Message = exception.Message,
            InternalError = internalError,
            Result = null
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        var json = JsonSerializer.Serialize(errorResponse, options);
        return context.Response.WriteAsync(json);
    }
}
