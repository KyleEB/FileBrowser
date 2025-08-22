using FileBrowser.Domain.Entities;
using FileBrowser.Domain.Repositories;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace FileBrowser.Infrastructure.Repositories
{
    /// <summary>
    /// Implementation of the file system repository
    /// </summary>
    public class FileSystemRepository : IFileSystemRepository
    {
        private readonly string _homeDirectory;
        private readonly ILogger<FileSystemRepository> _logger;

        public FileSystemRepository(IConfiguration configuration, ILogger<FileSystemRepository> logger)
        {
            _homeDirectory = configuration["FileBrowser:HomeDirectory"] ?? 
                Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            
            EnsureHomeDirectoryExists();
        }

        public string GetHomeDirectory() => _homeDirectory;

        public async Task<DirectoryDetails> GetDirectoryInfoAsync(string path)
        {
            try
            {
                var fullPath = GetFullPath(path);
                var directoryInfo = new System.IO.DirectoryInfo(fullPath);

                if (!directoryInfo.Exists)
                {
                    return Domain.Entities.DirectoryDetails.CreateNonExistent(path, "Directory does not exist");
                }

                var items = new List<FileSystemItem>();
                var parentPath = directoryInfo.Parent?.FullName;
                
                if (parentPath != null && IsPathWithinHomeDirectory(parentPath))
                {
                    parentPath = GetRelativePath(parentPath);
                }

                // Get directories
                foreach (var dir in directoryInfo.GetDirectories())
                {
                    items.Add(FileSystemItem.CreateDirectory(
                        dir.Name,
                        GetRelativePath(dir.FullName),
                        dir.LastWriteTime));
                }

                // Get files
                foreach (var file in directoryInfo.GetFiles())
                {
                    items.Add(FileSystemItem.CreateFile(
                        file.Name,
                        GetRelativePath(file.FullName),
                        file.Length,
                        file.LastWriteTime,
                        file.Extension));
                }

                // Sort: directories first, then files, both alphabetically
                items = items.OrderBy(x => !x.IsDirectory).ThenBy(x => x.Name).ToList();

                return Domain.Entities.DirectoryDetails.CreateExisting(path, items, parentPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting directory info for path: {Path}", path);
                return Domain.Entities.DirectoryDetails.CreateNonExistent(path, ex.Message);
            }
        }

        public async Task<IEnumerable<FileSystemItem>> SearchAsync(Domain.Entities.SearchRequest request)
        {
            var results = new List<FileSystemItem>();
            var searchPath = string.IsNullOrEmpty(request.Path) ? _homeDirectory : GetFullPath(request.Path);

            try
            {
                if (!Directory.Exists(searchPath))
                {
                    return results;
                }

                var searchOptions = request.IncludeSubdirectories ? 
                    SearchOption.AllDirectories : SearchOption.TopDirectoryOnly;

                if (request.SearchInFileNames)
                {
                    var files = Directory.GetFiles(searchPath, "*", searchOptions)
                        .Where(file => Path.GetFileName(file).Contains(request.Query, StringComparison.OrdinalIgnoreCase))
                        .Take(request.MaxResults);

                    foreach (var file in files)
                    {
                        var fileInfo = new System.IO.FileInfo(file);
                        results.Add(FileSystemItem.CreateFile(
                            fileInfo.Name,
                            GetRelativePath(file),
                            fileInfo.Length,
                            fileInfo.LastWriteTime,
                            fileInfo.Extension));
                    }
                }

                if (request.SearchInFileContents)
                {
                    var textFiles = Directory.GetFiles(searchPath, "*", searchOptions)
                        .Where(file => IsTextFile(file))
                        .Take(request.MaxResults);

                    foreach (var file in textFiles)
                    {
                        try
                        {
                            var content = await File.ReadAllTextAsync(file);
                            if (content.Contains(request.Query, StringComparison.OrdinalIgnoreCase))
                            {
                                var fileInfo = new System.IO.FileInfo(file);
                                if (!results.Any(r => r.Path == GetRelativePath(file)))
                                {
                                    results.Add(FileSystemItem.CreateFile(
                                        fileInfo.Name,
                                        GetRelativePath(file),
                                        fileInfo.Length,
                                        fileInfo.LastWriteTime,
                                        fileInfo.Extension));
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Could not read file contents: {File}", file);
                        }
                    }
                }

                return results.Take(request.MaxResults);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching files in path: {Path}", searchPath);
                return results;
            }
        }

        public async Task<Stream> GetFileStreamAsync(string filePath)
        {
            var fullPath = GetFullPath(filePath);
            
            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException($"File not found: {filePath}");
            }

            return File.OpenRead(fullPath);
        }

        public async Task<bool> FileExistsAsync(string filePath)
        {
            var fullPath = GetFullPath(filePath);
            return File.Exists(fullPath);
        }

        public async Task<bool> DirectoryExistsAsync(string directoryPath)
        {
            var fullPath = GetFullPath(directoryPath);
            return Directory.Exists(fullPath);
        }

        public async Task UploadFileAsync(string filePath, Stream fileStream)
        {
            var fullPath = GetFullPath(filePath);
            var directoryPath = Path.GetDirectoryName(fullPath);
            
            if (!string.IsNullOrEmpty(directoryPath) && !Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
            }

            using var fileStream2 = File.Create(fullPath);
            await fileStream.CopyToAsync(fileStream2);
        }

        public async Task CreateDirectoryAsync(string directoryPath)
        {
            var fullPath = GetFullPath(directoryPath);
            
            if (Directory.Exists(fullPath))
            {
                throw new InvalidOperationException($"Directory already exists: {directoryPath}");
            }

            Directory.CreateDirectory(fullPath);
        }

        public async Task MoveAsync(string sourcePath, string destinationPath)
        {
            var fullSourcePath = GetFullPath(sourcePath);
            var fullDestinationPath = GetFullPath(destinationPath);

            if (!File.Exists(fullSourcePath) && !Directory.Exists(fullSourcePath))
            {
                throw new FileNotFoundException($"Source path does not exist: {sourcePath}");
            }

            if (File.Exists(fullDestinationPath) || Directory.Exists(fullDestinationPath))
            {
                throw new InvalidOperationException($"Destination path already exists: {destinationPath}");
            }

            // Ensure destination directory exists
            var destinationDir = Path.GetDirectoryName(fullDestinationPath);
            if (!string.IsNullOrEmpty(destinationDir) && !Directory.Exists(destinationDir))
            {
                Directory.CreateDirectory(destinationDir);
            }

            if (File.Exists(fullSourcePath))
            {
                File.Move(fullSourcePath, fullDestinationPath);
            }
            else if (Directory.Exists(fullSourcePath))
            {
                Directory.Move(fullSourcePath, fullDestinationPath);
            }
        }

        private void EnsureHomeDirectoryExists()
        {
            if (!Directory.Exists(_homeDirectory))
            {
                Directory.CreateDirectory(_homeDirectory);
            }
        }

        private string GetFullPath(string relativePath)
        {
            var fullPath = Path.GetFullPath(Path.Combine(_homeDirectory, relativePath));
            
            if (!IsPathWithinHomeDirectory(fullPath))
            {
                throw new UnauthorizedAccessException("Access denied: Path is outside the allowed directory");
            }

            return fullPath;
        }

        private string GetRelativePath(string fullPath)
        {
            if (fullPath.StartsWith(_homeDirectory))
            {
                var relativePath = fullPath.Substring(_homeDirectory.Length);
                return relativePath.TrimStart(Path.DirectorySeparatorChar);
            }
            return fullPath;
        }

        private bool IsPathWithinHomeDirectory(string path)
        {
            var homeDir = Path.GetFullPath(_homeDirectory);
            var targetPath = Path.GetFullPath(path);
            return targetPath.StartsWith(homeDir, StringComparison.OrdinalIgnoreCase);
        }

        private bool IsTextFile(string filePath)
        {
            var textExtensions = new[] { ".txt", ".md", ".json", ".xml", ".html", ".css", ".js", ".cs", ".py", ".java", ".cpp", ".h", ".log" };
            var extension = Path.GetExtension(filePath).ToLowerInvariant();
            return textExtensions.Contains(extension);
        }
    }
}
