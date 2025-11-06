using Development.Assistant.Back.Domain.Services;
using Development.Assistant.Back.Models;
using Development.Assistant.Back.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[ApiController]
[Route("api/database")]
public class DatabaseController(CompareDatabaseService compareDatabaseService) : ControllerBase
{
    [HttpPost("compare-databases")]
    [Authorize] 
    public async Task<ActionResult<DatabaseClass>> CompareDatabases([FromBody] CompareDatabasesRequest request)
    {
        var result = await compareDatabaseService.CompareAsync(request.ConnectionString1, request.ConnectionString2, request.DbType);
        return Ok(result);
    }

    [HttpGet("types")]
    [Authorize] 
    public ActionResult<string[]> GetDatabaseTypes()
    {
        var types = Enum.GetNames<Constants.DbType>();
        return Ok(types);
    }
}