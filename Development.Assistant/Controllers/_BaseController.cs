using Development.Assistant.Modules.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public abstract class BaseController : ControllerBase
{
    protected static ResultApi<T> OkResult<T>(T result)
    {
        return new ResultApi<T> { Result = result };
    }
}
