using Development.Assistant.Back.Domain.Models;

namespace Development.Assistant.Back.Domain.Interfaces.Services
{
    public interface ICopyProjectService
    {
        void CopyProject(string sourceProjectPath, string destinationProjectPath, string oldNamespace, string newNamespace);
    }
}
