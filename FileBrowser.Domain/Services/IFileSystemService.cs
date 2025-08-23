using FileBrowser.Domain.Entities;

namespace FileBrowser.Domain.Services
{
    public interface IFileSystemService
    {
        Task<DirectoryDetails> BrowseDirectoryAsync(string path);
        Task<List<FileSystemItem>> SearchFilesAsync(SearchRequest request);
        Task<Stream> DownloadFileAsync(string filePath);
        Task<UploadResult> UploadFileAsync(FileUpload file, string targetPath);
        Task<HomeDirectoryResult> GetHomeDirectoryAsync();
        Task CreateDirectoryAsync(string directoryPath);
        Task MoveAsync(string sourcePath, string destinationPath);
        Task DeleteAsync(string path);
    }
}
