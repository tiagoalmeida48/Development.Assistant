using Development.Assistant.Api.Dtos;
using Development.Assistant.Domain.Services;
using Development.Assistant.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Api.Controllers;

[Authorize]
public class DatabaseController(CompareDatabaseService compareDatabaseService) : BaseController
{
    [HttpPost]
    public async Task<ResultApi<DatabaseClassDto>> CompareDatabases([FromBody] ConnectionStringDto request)
    {
        var dbType1 = request.DbType1.IsEmpty() ? request.DbType : request.DbType1;
        var dbType2 = request.DbType2.IsEmpty() ? request.DbType : request.DbType2;
        var result = await compareDatabaseService.CompareAsync(request.ConnectionString1, request.ConnectionString2, dbType1, dbType2);
        return OkResult(result.MapTo<DatabaseClassDto>());
    }
}
