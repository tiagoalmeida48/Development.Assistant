using Development.Assistant.Api.Dtos;
using Development.Assistant.Domain.Services;
using Development.Assistant.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Api.Controllers;

[Authorize]
public class CodeGeneratorController(ScribanCodeGeneratorService scribanCodeGeneratorService) : BaseController
{
    [HttpPost]
    public ResultApi<IEnumerable<string>> AllTables([FromBody] ConnectionStringForSearchTablesDto request)
    {
        return OkResult(scribanCodeGeneratorService.AllTables(request.ConnectionString, request.DbType));
    }

    [HttpPost]
    public async Task<IActionResult> CreateClass([FromBody] InfoClassDto input)
    {
        var zipBytes = await scribanCodeGeneratorService.CreateClassAsync(input);
        var fileName = $"{input.ProjectName}.zip";
        return File(zipBytes, "application/zip", fileName);
    }
}
