using Development.Assistant.Modules.Record;
using Development.Assistant.Modules.Services;
using Development.Assistant.Modules.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Development.Assistant.Controllers;

[Authorize]
public class MetadataController(MetadataService metadataService) : BaseController
{
    [HttpGet]
    public ResultApi<IEnumerable<TemplateRecord>> AllTemplate()
    {
        return OkResult(metadataService.AllTemplate().MapTo<IEnumerable<TemplateRecord>>());
    }

    [HttpGet]
    public ResultApi<IEnumerable<DatabaseTypeRecord>> AllDatabaseType()
    {
        return OkResult(metadataService.AllDatabaseType().MapTo<IEnumerable<DatabaseTypeRecord>>());
    }
}
