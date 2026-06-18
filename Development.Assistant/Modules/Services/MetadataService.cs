using Development.Assistant.Modules.Models;
using Development.Assistant.Modules.Repository;

namespace Development.Assistant.Modules.Services;

public class MetadataService(MetadataRepository repository)
{
    public IEnumerable<DatabaseTypeMod> AllDatabaseType()
    {
        return repository.AllDatabaseType();
    }

    public IEnumerable<TemplateMod> AllTemplate()
    {
        return repository.AllTemplate();
    }
}