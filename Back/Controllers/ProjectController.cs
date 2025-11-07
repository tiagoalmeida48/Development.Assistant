using Development.Assistant.Back.Services;
using Development.Assistant.Back.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Back.Controllers;

[ApiController]
[Route("api/project")]
public class ProjectController(CopyProjectService copyProjectService) : ControllerBase
{
    [HttpPost("copy-project")]
    [Authorize] 
    public ResultApi<bool> CopyProject(string sourceProjectPath, string destinationProjectPath, string oldNamespace, string newNamespace)
    {
        var result = new ResultApi<bool>
        {
            Result = copyProjectService.CopyProject(sourceProjectPath, destinationProjectPath, oldNamespace, newNamespace)
        };
        return result;
    }
}