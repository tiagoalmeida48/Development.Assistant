using Development.Assistant.Api.Dtos;
using Development.Assistant.Domain.Models;
using Development.Assistant.Domain.Services;
using Development.Assistant.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Development.Assistant.Api.Controllers;

[Authorize]
public class InputHistoryController(InputHistoryService inputHistorySrv) : BaseController
{
    [HttpGet]
    public ResultApi<IEnumerable<InputHistoryDto>> All([BindRequired] string input, string valueInput, string databaseType)
    {
        return OkResult(inputHistorySrv.All(input, valueInput, databaseType).MapTo<IEnumerable<InputHistoryDto>>());
    }

    [HttpPost]
    public ResultApi<bool> Create([FromBody] CreateInputHistoryDto request)
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
