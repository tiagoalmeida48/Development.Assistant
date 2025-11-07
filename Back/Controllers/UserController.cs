using Development.Assistant.Back.Dto;
using Development.Assistant.Back.Models;
using Development.Assistant.Back.Services;
using Development.Assistant.Back.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(AuthService authService) : ControllerBase
{
    [HttpGet("get")]
    [Authorize]
    public ResultApi<UserDto> Get(int id)
    {
        var result = new ResultApi<UserDto>
        {
            Result = authService.Get(id).MapTo<UserDto>()
        };
        return result;
    }
    
    [HttpGet("all")]
    [Authorize]
    public ResultApi<IEnumerable<UserDto>> All()
    {
        var result = new ResultApi<IEnumerable<UserDto>>
        {
            Result = authService.All().MapTo<IEnumerable<UserDto>>()
        };
        return result;
    }

    [HttpPost("create")]
    [Authorize]
    public ResultApi<bool> Create([FromBody] UserCreateDto request)
    {
        var result = new ResultApi<bool>
        {
            Result = authService.Create(request.MapTo<User>())
        };
        return result;
    }

    [HttpPut("update")]
    [Authorize]
    public ResultApi<bool> Update([FromBody] UserUpdateDto request)
    {
        var result = new ResultApi<bool>
        {
            Result = authService.Update(request.MapTo<User>())
        };
        return result;
    }
}