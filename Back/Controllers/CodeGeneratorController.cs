using Development.Assistant.Back.Dto;
using Development.Assistant.Back.Services;
using Development.Assistant.Back.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Back.Controllers;

[ApiController]
[Route("api/code-generator")]
public class CodeGeneratorController(ScribanCodeGeneratorService scribanCodeGeneratorService) : ControllerBase
{
    [HttpPost("all-tables")]
    [Authorize] 
    public ResultApi<IEnumerable<string>> AllTables([FromBody] ConnectionStringForSearchTablesDto request)
    {
        var result = new ResultApi<IEnumerable<string>>
        {
            Result = scribanCodeGeneratorService.AllTables(request.ConnectionString, request.DbType)
        };
        return result;
    }
    
    [HttpPost("create-class")]
    [Authorize]
    public async Task<IActionResult> CreateClass([FromBody] InfoClassDto input)
    {
        var zipBytes = await scribanCodeGeneratorService.CreateClassAsync(input);
        var fileName = $"{input.ProjectName}.zip";
        return File(zipBytes, "application/zip", fileName);
    }
}