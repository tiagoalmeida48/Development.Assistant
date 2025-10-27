using Development.Assistant.Back.Domain.Models;
using Development.Assistant.Back.Infra.CrossCutting;

namespace Development.Assistant.Back.Domain.Interfaces.Services
{
    public interface IScribanCodeGeneratorService : IBaseService
    {
        Task<bool> CreateClassAsync(InfoClass infoClass);
        IEnumerable<string> AllTables(string connectionString, Constants.DbType dbType);
    }
}
