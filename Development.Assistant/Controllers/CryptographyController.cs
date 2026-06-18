using Development.Assistant.Modules.Record;
using Development.Assistant.Modules.Services;
using Development.Assistant.Modules.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[Authorize]
public class CryptographyController(CryptographyService cryptographyService) : BaseController
{
    [HttpPost]
    public ResultApi<string> Process([FromBody] CryptographyRecord request)
    {
        return OkResult(cryptographyService.Process(request));
    }
}
