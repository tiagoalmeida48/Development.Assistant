using Development.Assistant.Modules.Models;
using Development.Assistant.Modules.Repository;

namespace Development.Assistant.Modules.Services;

public class MetadataService(TemplateRepository templateRepository, DatabaseTypeRepository databaseTypeRepository)
{
    public IEnumerable<DatabaseTypeMod> AllDatabaseType()
    {
        return databaseTypeRepository.All();
    }

    public IEnumerable<TemplateMod> AllTemplate()
    {
        return templateRepository.All();
    }
}