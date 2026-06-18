using Development.Assistant.Modules.Models;
using Development.Assistant.Modules.Common.Extensions;
using Development.Assistant.Modules.Repository;
using Development.Assistant.Modules.Common;

namespace Development.Assistant.Modules.Services;

public class InputHistoryService(InputHistoryRepository inputHistoryRepository)
{
    public IEnumerable<InputHistoryMod> All(string input, string valueInput, string databaseType = null)
    {
        return inputHistoryRepository.Search(input: input, valueInput: valueInput, databaseType: databaseType);
    }

    public bool Create(IEnumerable<InputHistoryMod> inputs)
    {
        foreach (var input in inputs)
        {
            if (input.ValueInput.IsEmpty()) continue;

            var records = inputHistoryRepository.Search(input: input.Input, databaseType: input.DatabaseType).ToList();
            if (records.Any(r => r.ValueInput == input.ValueInput)) continue;

            if (records.Count >= 5)
                inputHistoryRepository.Delete(records[^1].Id);

            inputHistoryRepository.Create(input.Input, input.ValueInput, input.DatabaseType);
        }
        return true;
    }

    public bool Delete(int id)
    {
        return inputHistoryRepository.Delete(id);
    }
}