using Development.Assistant.Api.Dtos;
using Development.Assistant.Domain.Services;
using Development.Assistant.Domain.ValueObjects;
using Development.Assistant.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Api.Controllers;

[AllowAnonymous]
public class AuthController(AuthService authService) : BaseController
{
    [HttpPost]
    public ResultApi<string> Login([FromBody] LoginDto request)
    {
        return OkResult(authService.Login(request.MapTo<LoginVo>()));
    }

    [HttpGet]
    public ResultApi<bool> ValidateToken(string token)
    {
        return OkResult(authService.ValidateToken(token));
    }
}
