using Development.Assistant.Api.Dtos;
using Development.Assistant.Domain.Services;
using Development.Assistant.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Api.Controllers;

[Authorize]
public class ProjectController(CopyProjectService copyProjectService) : BaseController
{
    [HttpPost]
    public ResultApi<bool> CopyProject([FromBody] CopyProjectDto request)
    {
        return OkResult(copyProjectService.CopyProject(request.SourceProjectPath, request.DestinationProjectPath, request.OldNamespace, request.NewNamespace));
    }

    [HttpPost]
    [RequestSizeLimit(200_000_000)]
    public async Task<IActionResult> CopyProjectZip([FromForm] IFormFile projectZip, [FromForm] string oldNamespace, [FromForm] string newNamespace)
    {
        if (projectZip == null || projectZip.Length == 0)
            return BadRequest(new ResultApi<object>
            {
                Success = false,
                Message = "Envie um arquivo .zip com o projeto origem",
                InternalError = 400
            });

        await using var stream = projectZip.OpenReadStream();
        var zipBytes = await copyProjectService.CopyProjectZipAsync(stream, projectZip.FileName, oldNamespace, newNamespace);
        var fileName = $"{newNamespace}.zip";
        return File(zipBytes, "application/zip", fileName);
    }
}
