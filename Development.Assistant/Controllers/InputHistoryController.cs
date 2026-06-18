using Development.Assistant.Modules.Record;
using Development.Assistant.Modules.Models;
using Development.Assistant.Modules.Services;
using Development.Assistant.Modules.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Development.Assistant.Controllers;

[Authorize]
public class InputHistoryController(InputHistoryService inputHistorySrv) : BaseController
{
    [HttpGet]
    public ResultApi<IEnumerable<InputHistoryRecord>> All([BindRequired] string input, string valueInput, string databaseType)
    {
        return OkResult(inputHistorySrv.All(input, valueInput, databaseType).MapTo<IEnumerable<InputHistoryRecord>>());
    }

    [HttpPost]
    public ResultApi<bool> Create([FromBody] CreateInputHistoryRecord request)
    {
        var input = new InputHistoryMod(request.Input, request.ValueInput, request.DatabaseType);
        return OkResult(inputHistorySrv.Create([input]));
    }

    [HttpDelete]
    public ResultApi<bool> Delete(int id)
    {
        return OkResult(inputHistorySrv.Delete(id));
    }
}
