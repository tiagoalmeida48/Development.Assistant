using Development.Assistant.Modules.Common;
using Development.Assistant.Modules.Record;
using System.Security.Cryptography;

namespace Development.Assistant.Modules.Services;

public class CryptographyService
{
    public string Process(CryptographyRecord request)
    {
        try
        {
            return request.Operation switch
            {
                "Encrypt" => HashHelper.EncryptConnectionString(request.Text, request.Key),
                "Decrypt" => HashHelper.DecryptConnectionString(request.Text, request.Key),
                _ => throw new BadRequestException("Operação de criptografia inválida.")
            };
        }
        catch (Exception ex) when (ex is FormatException or CryptographicException or ArgumentException)
        {
            throw new BadRequestException("Não foi possível processar a operação de criptografia.");
        }
    }
}
