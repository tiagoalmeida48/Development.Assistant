using System.Net;
using System.Text.Json;
using Development.Assistant.Back.Models;

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
        HttpStatusCode statusCode;
        string generalMessage;
        var details = exception.Message;

        switch (exception)
        {
            case ArgumentException: 
                statusCode = HttpStatusCode.BadRequest;
                generalMessage = "Os dados fornecidos são inválidos";
                break;

            case UnauthorizedAccessException:
                statusCode = HttpStatusCode.Unauthorized;
                generalMessage = "Acesso não autorizado";
                break;

            case FileNotFoundException: 
                statusCode = HttpStatusCode.NotFound;
                generalMessage = "Recurso não encontrado";
                break;

            case InvalidOperationException:
                statusCode = HttpStatusCode.BadRequest;
                generalMessage = "Operação inválida";
                break;

            case IOException:
                statusCode = HttpStatusCode.InternalServerError;
                generalMessage = "Erro ao acessar arquivos ou diretórios";
                break;

            default:
                statusCode = HttpStatusCode.InternalServerError;
                generalMessage = "Ocorreu um erro no sistema";
                break;
        }

        var errorResponse = new ErrorResponse
        {
            Error = generalMessage,
            Details = details
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
