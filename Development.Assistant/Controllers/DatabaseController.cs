using Development.Assistant.Modules.Record;
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
        var result = await compareDatabaseService.CompareAsync(request);
        return OkResult(result.MapTo<DatabaseClassRecord>());
    }
}
