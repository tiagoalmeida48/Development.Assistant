using Development.Assistant.Back.Models;
using Development.Assistant.Back.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(AuthService authService) : ControllerBase
{
    [HttpGet("get")]
    [Authorize]
    public ActionResult<User> Get(int id)
    {
        var user = authService.Get(id);
        return user;
    }
    
    [HttpGet("all")]
    [Authorize]
    public IEnumerable<User> All()
    {
        var users = authService.All();
        return users;
    }

    [HttpPost("create")]
    [Authorize]
    public ActionResult<bool> Create([FromBody] User request)
    {
        var user = authService.Create(request);
        return user;
    }

    [HttpPut("update")]
    [Authorize]
    public ActionResult<bool> Update([FromBody] User request)
    {
        var user = authService.Update(request);
        return user;
    }
}