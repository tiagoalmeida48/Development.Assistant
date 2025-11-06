using Development.Assistant.Back.Models;
using Development.Assistant.Back.Repository;

namespace Development.Assistant.Back.Services;

public class InputHistoryService(InputHistoryRepository inputHistoryRepository)
{
    public IEnumerable<InputHistory> All(string input, string valueInput)
    {
        return inputHistoryRepository.Search(input: input, valueInput: valueInput);
    }

    public bool Create(List<InputHistoryRequest> inputs)
    {
        foreach (var input in inputs)
        {
            var records = inputHistoryRepository.Search(input: input.Input);
            if (records.Any(r => r.Input == input.Input && r.ValueInput == input.ValueInput)) continue;
            
            if (records.Count() == 5)
                inputHistoryRepository.Delete([records.Last().Id]);
            
            inputHistoryRepository.Create(input.Input, input.ValueInput);
        }
        return true;   
    }

    public bool Delete(int[] ids)
    {
        return inputHistoryRepository.Delete(ids);
    }
}