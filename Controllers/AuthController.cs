using Development.Assistant.Back.Models;
using Development.Assistant.Back.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public ActionResult<string> Login([FromBody] LoginRequest request)
    {
        var response = authService.Login(request);
        return response;
    }
}