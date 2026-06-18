using Development.Assistant.Domain.Models;
using Development.Assistant.Infrastructure.Repositories;

namespace Development.Assistant.Domain.Services;

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