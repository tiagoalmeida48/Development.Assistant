using Development.Assistant.Back.Domain.Services;
using Development.Assistant.Back.Models;
using Development.Assistant.Back.Utils;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[ApiController]
[Route("api/database")]
public class DatabaseController(CompareDatabaseService compareDatabaseService) : ControllerBase
{
    [HttpPost("compare-databases")]
    public async Task<ActionResult<DatabaseClass>> CompareDatabases([FromBody] CompareDatabasesRequest request)
    {
        if (!Enum.TryParse<Constants.DbType>(request.DbType, out var dbType))
        {
            return BadRequest($"Tipo de banco inválido: {request.DbType}");
        }

        var result = await compareDatabaseService.CompareAsync(request.ConnectionString1, request.ConnectionString2, dbType);
        return Ok(result);
    }

    [HttpGet("types")]
    public ActionResult<string[]> GetDatabaseTypes()
    {
        var types = Enum.GetNames<Constants.DbType>();
        return Ok(types);
    }
}