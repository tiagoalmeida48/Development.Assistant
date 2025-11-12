using Development.Assistant.Back.Models;
using Development.Assistant.Back.Repository;

namespace Development.Assistant.Back.Domain.Services;

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