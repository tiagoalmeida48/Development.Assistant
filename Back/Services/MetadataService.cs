using Development.Assistant.Back.Models;
using Development.Assistant.Back.Repository;
using Development.Assistant.Back.Services;
using Development.Assistant.Back.Utils;

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