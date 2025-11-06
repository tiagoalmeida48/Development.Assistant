using Development.Assistant.Back.Models;
using Development.Assistant.Back.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Development.Assistant.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InputHistoryController(InputHistoryService inputHistorySrv) : ControllerBase
{
    [HttpGet("all")]
    [Authorize]
    public IEnumerable<InputHistory> All([BindRequired] string input, string valueInput)
    {
        var inputValues = inputHistorySrv.All(input, valueInput);
        return inputValues;
    }

    [HttpDelete("delete")]
    [Authorize]
    public ActionResult<bool> Delete(int[] ids)
    {
        return inputHistorySrv.Delete(ids);
    }
}