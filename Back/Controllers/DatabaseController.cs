using Development.Assistant.Back.Domain.Services;
using Development.Assistant.Back.Dto;
using Development.Assistant.Back.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Back.Controllers;

[ApiController]
[Route("api/database")]
public class DatabaseController(CompareDatabaseService compareDatabaseService) : ControllerBase
{
    [HttpPost("compare-databases")]
    [Authorize]
    public ResultApi<DatabaseClassDto> CompareDatabases([FromBody] ConnectionStringDto request)
    {
        var result = new ResultApi<DatabaseClassDto>
        {
            Result = compareDatabaseService.Compare(request.ConnectionString1, request.ConnectionString2, request.DbType).MapTo<DatabaseClassDto>()
        };
        return result;
    }
}