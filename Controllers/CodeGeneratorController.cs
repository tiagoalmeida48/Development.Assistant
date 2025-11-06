using Development.Assistant.Back.Models;
using Development.Assistant.Back.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[ApiController]
[Route("api/code-generator")]
public class CodeGeneratorController(ScribanCodeGeneratorService scribanCodeGeneratorService) : ControllerBase
{
    [HttpPost("create-class")]
    [Authorize] 
    public async Task<ActionResult<bool>> CreateClass([FromBody] InfoClass input)
    {
        var success = await scribanCodeGeneratorService.CreateClassAsync(input);
        return Ok(success);
    }

    [HttpPost("all-tables")]
    [Authorize] 
    public async Task<ActionResult<List<string>>> AllTables([FromBody] GetTablesRequest request)
    {
        var tables = await Task.Run(() => scribanCodeGeneratorService.AllTables(request.ConnectionString, request.DbType));
        return Ok(tables.ToList());
    }
}