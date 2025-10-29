using Development.Assistant.Back.Models;
using Development.Assistant.Back.Services;
using Development.Assistant.Back.Utils;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[ApiController]
[Route("api/code-generator")]
public class CodeGeneratorController(ScribanCodeGeneratorService scribanCodeGeneratorService) : ControllerBase
{
    [HttpPost("create-class")]
    public async Task<ActionResult<bool>> CreateClass([FromBody] InfoClass input)
    {
        var success = await scribanCodeGeneratorService.CreateClassAsync(input);
        return Ok(success);
    }

    [HttpPost("all-tables")]
    public async Task<ActionResult<List<string>>> AllTables([FromBody] GetTablesRequest request)
    {
        if (!Enum.TryParse<Constants.DbType>(request.DbType, out var dbType))
        {
            return BadRequest($"Tipo de banco inválido: {request.DbType}");
        }

        var tables = await Task.Run(() => scribanCodeGeneratorService.AllTables(request.ConnectionString, dbType));
        return Ok(tables.ToList());
    }

}