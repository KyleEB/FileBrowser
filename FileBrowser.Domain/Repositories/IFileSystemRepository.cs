using FileBrowser.Domain.Entities;

namespace FileBrowser.Domain.Repositories
{
    /// <summary>
    /// Repository interface for file system operations
    /// </summary>
    public interface IFileSystemRepository
    {
        /// <summary>
        /// Gets information about a directory
        /// </summary>
        /// <param name="path">The directory path</param>
        /// <returns>Directory information</returns>
        Task<DirectoryDetails> GetDirectoryInfoAsync(string path);

        /// <summary>
        /// Searches for files and directories based on criteria
        /// </summary>
        /// <param name="request">Search criteria</param>
        /// <returns>List of matching file system items</returns>
        Task<IEnumerable<FileSystemItem>> SearchAsync(SearchRequest request);

        /// <summary>
        /// Gets a file stream for reading
        /// </summary>
        /// <param name="filePath">The file path</param>
        /// <returns>File stream</returns>
        Task<Stream> GetFileStreamAsync(string filePath);

        /// <summary>
        /// Checks if a file exists
        /// </summary>
        /// <param name="filePath">The file path</param>
        /// <returns>True if file exists</returns>
        Task<bool> FileExistsAsync(string filePath);

        /// <summary>
        /// Checks if a directory exists
        /// </summary>
        /// <param name="directoryPath">The directory path</param>
        /// <returns>True if directory exists</returns>
        Task<bool> DirectoryExistsAsync(string directoryPath);

        /// <summary>
        /// Gets the home directory path
        /// </summary>
        /// <returns>Home directory path</returns>
        string GetHomeDirectory();

        /// <summary>
        /// Uploads a file to the specified path
        /// </summary>
        /// <param name="filePath">The target file path</param>
        /// <param name="fileStream">The file stream</param>
        /// <returns>Task representing the upload operation</returns>
        Task UploadFileAsync(string filePath, Stream fileStream);

        /// <summary>
        /// Creates a new directory
        /// </summary>
        /// <param name="directoryPath">The directory path to create</param>
        /// <returns>Task representing the directory creation operation</returns>
        Task CreateDirectoryAsync(string directoryPath);

        /// <summary>
        /// Moves a file or directory from source to destination
        /// </summary>
        /// <param name="sourcePath">The source path</param>
        /// <param name="destinationPath">The destination path</param>
        /// <returns>Task representing the move operation</returns>
        Task MoveAsync(string sourcePath, string destinationPath);

        /// <summary>
        /// Deletes a file or directory
        /// </summary>
        /// <param name="path">The path to delete</param>
        /// <returns>Task representing the delete operation</returns>
        Task DeleteAsync(string path);
    }
}
