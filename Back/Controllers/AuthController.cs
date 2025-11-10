using Development.Assistant.Back.Dto;
using Development.Assistant.Back.Services;
using Development.Assistant.Back.Utils;
using Development.Assistant.Back.Vo;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public ResultApi<string> Login([FromBody] LoginDto request)
    {
        var response = new ResultApi<string>
        {
            Result = authService.Login(request.MapTo<LoginVo>())
        };
        return response;
    }
}