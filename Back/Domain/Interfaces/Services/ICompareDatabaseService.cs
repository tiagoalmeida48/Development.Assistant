using Development.Assistant.Back.Domain.Models;
using Development.Assistant.Back.Infra.CrossCutting;

namespace Development.Assistant.Back.Domain.Interfaces.Services
{
    public interface ICompareDatabaseService : IBaseService
    {
        Task<DatabaseClass> CompareAsync(string connectionString1, string connectionString2, Constants.DbType dbType);
    }
}
