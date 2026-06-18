using Development.Assistant.Api.Dtos;
using Development.Assistant.Domain.Services;
using Development.Assistant.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Api.Controllers;

[Authorize]
public class MetadataController(MetadataService metadataService) : BaseController
{
    [HttpGet]
    public ResultApi<IEnumerable<TemplateDto>> AllTemplate()
    {
        return OkResult(metadataService.AllTemplate().MapTo<IEnumerable<TemplateDto>>());
    }

    [HttpGet]
    public ResultApi<IEnumerable<DatabaseTypeDto>> AllDatabaseType()
    {
        return OkResult(metadataService.AllDatabaseType().MapTo<IEnumerable<DatabaseTypeDto>>());
    }
}
