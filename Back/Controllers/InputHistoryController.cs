using Development.Assistant.Back.Dto;
using Development.Assistant.Back.Services;
using Development.Assistant.Back.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Development.Assistant.Back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InputHistoryController(InputHistoryService inputHistorySrv) : ControllerBase
{
    [HttpGet("all")]
    [Authorize]
    public ResultApi<IEnumerable<InputHistoryDto>> All([BindRequired] string input, string valueInput)
    {
        var result = new ResultApi<IEnumerable<InputHistoryDto>>
        {
            Result = inputHistorySrv.All(input, valueInput).MapTo<IEnumerable<InputHistoryDto>>()
        };
        return result;
    }

    [HttpDelete("delete")]
    [Authorize]
    public ResultApi<bool> Delete(int id)
    {
        var result = new ResultApi<bool>
        {
            Result = inputHistorySrv.Delete(id)
        };
        return result;
    }
}