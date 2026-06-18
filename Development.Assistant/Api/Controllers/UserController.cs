using Development.Assistant.Api.Dtos;
using Development.Assistant.Domain.Models;
using Development.Assistant.Domain.Services;
using Development.Assistant.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Api.Controllers;

[Authorize]
public class UserController(UserService userService) : BaseController
{
    [HttpGet]
    public ResultApi<UserDto> Get(int id)
    {
        return OkResult(userService.Get(id).MapTo<UserDto>());
    }

    [HttpGet]
    public ResultApi<IEnumerable<UserDto>> All()
    {
        return OkResult(userService.All().MapTo<IEnumerable<UserDto>>());
    }

    [HttpPost]
    public ResultApi<bool> Create([FromBody] UserCreateDto request)
    {
        return OkResult(userService.Create(request.MapTo<UserMod>()));
    }

    [HttpPut]
    public ResultApi<bool> Update([FromBody] UserUpdateDto request)
    {
        return OkResult(userService.Update(request.MapTo<UserMod>()));
    }
}
