using Development.Assistant.Modules.Record;
using Development.Assistant.Modules.Services;
using Development.Assistant.Modules.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[AllowAnonymous]
public class AuthController(AuthService authService) : BaseController
{
    [HttpPost]
    public ResultApi<string> Login([FromBody] LoginRecord request)
    {
        return OkResult(authService.Login(request.MapTo<CredentialsRecord>()));
    }

    [HttpGet]
    public ResultApi<bool> ValidateToken(string token)
    {
        return OkResult(authService.ValidateToken(token));
    }
}
