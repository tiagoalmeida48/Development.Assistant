using Development.Assistant.Modules.Record;
using Development.Assistant.Modules.Models;
using Development.Assistant.Modules.Services;
using Development.Assistant.Modules.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[Authorize]
public class UserController(UserService userService) : BaseController
{
    [HttpGet]
    public ResultApi<UserRecord> Get(int id)
    {
        return OkResult(userService.Get(id).MapTo<UserRecord>());
    }

    [HttpGet]
    public ResultApi<IEnumerable<UserRecord>> All()
    {
        return OkResult(userService.All().MapTo<IEnumerable<UserRecord>>());
    }

    [HttpPost]
    public ResultApi<bool> Create([FromBody] UserCreateRecord request)
    {
        return OkResult(userService.Create(request.MapTo<UserMod>()));
    }

    [HttpPut]
    public ResultApi<bool> Update([FromBody] UserUpdateRecord request)
    {
        return OkResult(userService.Update(request.MapTo<UserMod>()));
    }
}
