using Development.Assistant.Modules.Record;
using Development.Assistant.Modules.Common;
using Development.Assistant.Modules.Common.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[Authorize]
public class CryptographyController : BaseController
{
    [HttpPost]
    public ResultApi<string> Process([FromBody] CryptographyRecord request)
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
