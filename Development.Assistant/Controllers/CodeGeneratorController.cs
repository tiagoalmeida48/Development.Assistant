using Development.Assistant.Modules.Record;
using Development.Assistant.Modules.Services;
using Development.Assistant.Modules.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[Authorize]
public class CodeGeneratorController(ScribanCodeGeneratorService scribanCodeGeneratorService) : BaseController
{
    [HttpPost]
    public ResultApi<IEnumerable<string>> AllTables([FromBody] ConnectionStringForSearchTablesRecord request)
    {
        return OkResult(scribanCodeGeneratorService.AllTables(request.ConnectionString, request.DbType));
    }

    [HttpPost]
    public async Task<IActionResult> CreateClass([FromBody] InfoClassRecord input)
    {
        var zipBytes = await scribanCodeGeneratorService.CreateClassAsync(input);
        return File(zipBytes, "application/zip", $"{input.ProjectName}.zip");
    }
}
