using Development.Assistant.Api.Dtos;
using Development.Assistant.Shared;
using Development.Assistant.Shared.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Api.Controllers;

[Authorize]
public class CryptographyController : BaseController
{
    [HttpPost]
    public ResultApi<string> Process([FromBody] CryptographyDto request)
    {
        try
        {
            var result = request.Operation switch
            {
                "Encrypt" => HashHelper.EncryptConnectionString(request.Text, request.Key),
                "Decrypt" => HashHelper.DecryptConnectionString(request.Text, request.Key),
                _ => throw new BadRequestException("Operação de criptografia inválida.")
            };

            return OkResult(result);
        }
        catch (BadRequestException)
        {
            throw;
        }
        catch
        {
            throw new BadRequestException("Não foi possível processar a operação de criptografia.");
        }
    }
}
