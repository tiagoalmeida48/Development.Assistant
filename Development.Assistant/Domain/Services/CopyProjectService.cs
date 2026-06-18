using Development.Assistant.Domain.Models;
using Development.Assistant.Shared;
using Development.Assistant.Shared.Exceptions;
using System.IO.Compression;

namespace Development.Assistant.Domain.Services;

public class CopyProjectService(InputHistoryService inputHistorySrv)
{
    public bool CopyProject(string sourceProjectPath, string destinationProjectPath, string oldNamespace, string newNamespace)
    {
        ValidateInputs(sourceProjectPath, destinationProjectPath, oldNamespace, newNamespace);

        var destinationDir = CopyDirectory(sourceProjectPath, destinationProjectPath, oldNamespace, newNamespace);
        UpdateNamespaceInProject(destinationDir, oldNamespace, newNamespace);

        var inputsValue = new List<InputHistoryMod>
        {
            new(Constants.InputName.SourcePath, sourceProjectPath),
            new(Constants.InputName.DestPath, destinationProjectPath),
            new(Constants.InputName.OldNamespace, oldNamespace),
            new(Constants.InputName.NewNamespace, newNamespace)
        };

        inputHistorySrv.Create(inputsValue);
        return true;
    }

    public async Task<byte[]> CopyProjectZipAsync(Stream sourceProjectZip, string sourceFileName, string oldNamespace, string newNamespace)
    {
        if (sourceProjectZip == null || oldNamespace.IsEmpty() || newNamespace.IsEmpty())
            throw new BadRequestException("Arquivo, namespace antigo e namespace novo são obrigatórios");

        if (!Path.GetExtension(sourceFileName).Equals(".zip", StringComparison.OrdinalIgnoreCase))
            throw new BadRequestException("Envie o projeto origem compactado em .zip");

        var tempRoot = Path.Combine(Path.GetTempPath(), "development-assistant", Guid.NewGuid().ToString("N"));
        var sourceDir = Path.Combine(tempRoot, "source");
        var destinationDir = Path.Combine(tempRoot, "output");
        var zipPath = Path.Combine(tempRoot, $"{SanitizeFileName(newNamespace)}.zip");

        try
        {
            Directory.CreateDirectory(sourceDir);
            Directory.CreateDirectory(destinationDir);

            await using (var archive = new ZipArchive(sourceProjectZip, ZipArchiveMode.Read, true))
            {
                await archive.ExtractToDirectoryAsync(sourceDir);
            }

            var projectRoot = GetProjectRoot(sourceDir);
            CopyDirectory(projectRoot, destinationDir, oldNamespace, newNamespace);
            UpdateNamespaceInProject(destinationDir, oldNamespace, newNamespace);

            await ZipFile.CreateFromDirectoryAsync(destinationDir, zipPath, CompressionLevel.Fastest, false);
            var zipBytes = await File.ReadAllBytesAsync(zipPath);

            inputHistorySrv.Create([
                new InputHistoryMod(Constants.InputName.OldNamespace, oldNamespace),
                new InputHistoryMod(Constants.InputName.NewNamespace, newNamespace)
            ]);

            return zipBytes;
        }
        catch (InvalidDataException)
        {
            throw new BadRequestException("Arquivo .zip inválido ou corrompido");
        }
        finally
        {
            if (Directory.Exists(tempRoot))
                Directory.Delete(tempRoot, true);
        }
    }

    private static string CopyDirectory(string sourceDir, string destinationDir, string oldNamespace, string newNamespace)
    {
        sourceDir = Path.GetFullPath(sourceDir);
        destinationDir = Path.GetFullPath(destinationDir);

        if (!Directory.Exists(destinationDir))
            Directory.CreateDirectory(destinationDir);

        foreach (var file in Directory.GetFiles(sourceDir))
        {
            var destFile = Path.Combine(destinationDir, Path.GetFileName(file));
            if (destFile.Contains(oldNamespace, StringComparison.Ordinal))
                destFile = destFile.Replace(oldNamespace, newNamespace, StringComparison.Ordinal);

            File.Copy(file, destFile, true);
        }

        foreach (var directory in Directory.GetDirectories(sourceDir))
        {
            var ignoredFoldersOrFiles = new[] { "bin", "obj", ".vs", ".git", ".editorconfig", ".gitattributes", ".gitignore" };
            if (ignoredFoldersOrFiles.Contains(Path.GetFileName(directory)))
                continue;

            var destDir = Path.Combine(destinationDir, Path.GetFileName(directory));
            if (destDir.Contains(oldNamespace, StringComparison.Ordinal))
                destDir = destDir.Replace(oldNamespace, newNamespace, StringComparison.Ordinal);

            CopyDirectory(directory, destDir, oldNamespace, newNamespace);
        }

        return destinationDir;
    }

    private static void UpdateNamespaceInProject(string directoryPath, string oldNamespace, string newNamespace)
    {
        var files = Directory.GetFiles(directoryPath, "*.*", SearchOption.AllDirectories);

        foreach (var file in files)
        {
            if (!IsTextFile(file))
                continue;

            var text = File.ReadAllText(file);
            var modifiedText = text.Replace(oldNamespace, newNamespace, StringComparison.Ordinal);
            File.WriteAllText(file, modifiedText);
        }
    }

    private static void ValidateInputs(string sourceProjectPath, string destinationProjectPath, string oldNamespace, string newNamespace)
    {
        if (sourceProjectPath.IsEmpty() || destinationProjectPath.IsEmpty() || oldNamespace.IsEmpty() || newNamespace.IsEmpty())
            throw new BadRequestException("Todos os campos de cópia de projeto são obrigatórios");

        var sourceFullPath = Path.GetFullPath(sourceProjectPath);
        var destinationFullPath = Path.GetFullPath(destinationProjectPath);

        if (!Directory.Exists(sourceFullPath))
            throw new NotFoundException("Projeto origem não encontrado");

        if (sourceFullPath.Equals(destinationFullPath, StringComparison.OrdinalIgnoreCase))
            throw new BadRequestException("Projeto origem e destino não podem ser o mesmo diretório");

        if (destinationFullPath.StartsWith(sourceFullPath + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
            throw new BadRequestException("Projeto destino não pode estar dentro do projeto origem");
    }

    private static bool IsTextFile(string file)
    {
        var extension = Path.GetExtension(file).ToLowerInvariant();
        return extension is ".cs" or ".csproj" or ".sln" or ".slnx" or ".json" or ".xml" or ".config" or ".props" or ".targets" or ".md" or ".txt" or ".yml" or ".yaml";
    }

    private static string GetProjectRoot(string sourceDir)
    {
        var directories = Directory.GetDirectories(sourceDir);
        var files = Directory.GetFiles(sourceDir);

        return directories.Length == 1 && files.Length == 0 ? directories[0] : sourceDir;
    }

    private static string SanitizeFileName(string value)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitized = new string(value.Select(c => invalidChars.Contains(c) ? '-' : c).ToArray());
        return sanitized.IsEmpty() ? "project" : sanitized;
    }
}