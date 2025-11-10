using Development.Assistant.Back.Domain.Services;
using Development.Assistant.Back.Dto;
using Development.Assistant.Back.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Back.Controllers;

[ApiController]
[Route("api/metadata")]
public class MetadataController(MetadataService metadataService) : ControllerBase
{
    [HttpGet("all-template")]
    [Authorize]
    public ResultApi<IEnumerable<TemplateDto>> AllTemplate()
    {
        var result = new ResultApi<IEnumerable<TemplateDto>>
        {
            Result = metadataService.AllTemplate().MapTo<IEnumerable<TemplateDto>>()
        };
        return result;
    }
    
    [HttpGet("all-database-type")]
    [Authorize]
    public ResultApi<IEnumerable<DatabaseTypeDto>> AllDatabaseType()
    {
        var result = new ResultApi<IEnumerable<DatabaseTypeDto>>
        {
            Result = metadataService.AllDatabaseType().MapTo<IEnumerable<DatabaseTypeDto>>()
        };
        return result;
    }
}