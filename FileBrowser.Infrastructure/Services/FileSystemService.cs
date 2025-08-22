using FileBrowser.Domain.Repositories;
using FileBrowser.Domain.Entities;
using FileBrowser.Domain.Services;

namespace FileBrowser.Infrastructure.Services
{
    public class FileSystemService : IFileSystemService
    {
        private readonly IFileSystemRepository _repository;

        public FileSystemService(IFileSystemRepository repository)
        {
            _repository = repository;
        }

        public async Task<DirectoryDetails> BrowseDirectoryAsync(string path)
        {
            return await _repository.GetDirectoryInfoAsync(path);
        }

        public async Task<List<FileSystemItem>> SearchFilesAsync(SearchRequest request)
        {
            return (await _repository.SearchAsync(request)).ToList();
        }

        public async Task<Stream> DownloadFileAsync(string filePath)
        {
            return await _repository.GetFileStreamAsync(filePath);
        }

        public async Task<UploadResult> UploadFileAsync(FileUpload file, string targetPath)
        {
            try
            {
                var fullPath = Path.Combine(targetPath, file.FileName).Replace('\\', '/');
                await _repository.UploadFileAsync(fullPath, file.Stream);
                
                return UploadResult.CreateSuccess(fullPath, file.Length);
            }
            catch (Exception ex)
            {
                return UploadResult.CreateFailure(ex.Message);
            }
        }

        public async Task<HomeDirectoryResult> GetHomeDirectoryAsync()
        {
            var homeDirectory = _repository.GetHomeDirectory();
            var exists = Directory.Exists(homeDirectory);
            var errorMessage = exists ? null : "Home directory does not exist";
            
            return HomeDirectoryResult.Create(homeDirectory, exists, errorMessage);
        }
    }
}
