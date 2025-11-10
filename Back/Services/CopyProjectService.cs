using Development.Assistant.Back.Models;
using Development.Assistant.Back.Utils;
using System.Text.RegularExpressions;

namespace Development.Assistant.Back.Services;

public class CopyProjectService(InputHistoryService inputHistorySrv)
{
    public bool CopyProject(string sourceProjectPath, string destinationProjectPath, string oldNamespace, string newNamespace)
    { 
        var destinationDir = CopyDirectory(sourceProjectPath, destinationProjectPath, oldNamespace, newNamespace);
        UpdateNamespaceInProject(destinationDir, oldNamespace, newNamespace);
        
        var inputsValue = new List<InputHistoryMod>();
        inputsValue.Add(new InputHistoryMod(Constants.InputName.SourcePath, sourceProjectPath));
        inputsValue.Add(new InputHistoryMod(Constants.InputName.DestPath, destinationProjectPath));
        inputsValue.Add(new InputHistoryMod(Constants.InputName.OldNamespace, oldNamespace));
        inputsValue.Add(new InputHistoryMod(Constants.InputName.NewNamespace, newNamespace));

        inputHistorySrv.Create(inputsValue);
        return true;
    }

    private static string CopyDirectory(string sourceDir, string destinationDir, string oldNamespace, string newNamespace)
    {
        if (!Directory.Exists(destinationDir))
            Directory.CreateDirectory(destinationDir);

        foreach (var file in Directory.GetFiles(sourceDir))
        {
            var destFile = Path.Combine(destinationDir, Path.GetFileName(file));
            if (destFile.Contains(oldNamespace))
                destFile = destFile.Replace(oldNamespace, newNamespace);

            File.Copy(file, destFile, true);
        }

        foreach (var directory in Directory.GetDirectories(sourceDir))
        {
            var ignoredFoldersOrFiles = new[] { "bin", "obj", ".vs", ".git", ".editorconfig", ".gitattributes", ".gitignore" };
            if (ignoredFoldersOrFiles.Contains(Path.GetFileName(directory)))
                continue;

            var destDir = Path.Combine(destinationDir, Path.GetFileName(directory));
            if (destDir.Contains(oldNamespace))
                destDir = destDir.Replace(oldNamespace, newNamespace);

            CopyDirectory(directory, destDir, oldNamespace, newNamespace);
        }

        return destinationDir;
    }

    private static void UpdateNamespaceInProject(string directoryPath, string oldNamespace, string newNamespace)
    {
        var files = Directory.GetFiles(directoryPath, "*.*", SearchOption.AllDirectories);

        foreach (var file in files)
        {
            var text = File.ReadAllText(file);
            var modifiedText = Regex.Replace(text, oldNamespace, newNamespace);
            File.WriteAllText(file, modifiedText);
        }
    }
}