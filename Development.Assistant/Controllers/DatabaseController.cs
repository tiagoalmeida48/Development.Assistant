using Development.Assistant.Modules.Record;
using Development.Assistant.Modules.Common.Extensions;
using Development.Assistant.Modules.Services;
using Development.Assistant.Modules.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[Authorize]
public class DatabaseController(CompareDatabaseService compareDatabaseService) : BaseController
{
    [HttpPost]
    public async Task<ResultApi<DatabaseClassRecord>> CompareDatabases([FromBody] ConnectionStringRecord request)
    {
        var dbType1 = request.DbType1.IsEmpty() ? request.DbType : request.DbType1;
        var dbType2 = request.DbType2.IsEmpty() ? request.DbType : request.DbType2;
        var result = await compareDatabaseService.CompareAsync(request.ConnectionString1, request.ConnectionString2, dbType1, dbType2);
        return OkResult(result.MapTo<DatabaseClassRecord>());
    }
}
