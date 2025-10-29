using Development.Assistant.Back.Services;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[ApiController]
[Route("api/project")]
public class ProjectController(CopyProjectService copyProjectService) : ControllerBase
{
    [HttpGet("copy-project")]
    public async Task<ActionResult<bool>> CopyProject(string sourceProjectPath, string destinationProjectPath, string oldNamespace, string newNamespace)
    {
        await Task.Run(() => copyProjectService.CopyProject(sourceProjectPath, destinationProjectPath, oldNamespace, newNamespace));
        return Ok();
    }
}