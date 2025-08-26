using Microsoft.AspNetCore.Mvc;
using FileBrowser.Domain.Services;
using FileBrowser.Domain.Entities;
using FileBrowser.Contracts.Models;

namespace FileBrowser.Api.Controllers
{
    /// <summary>
    /// Controller for file browser operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class FileBrowserController : ControllerBase
    {
        private readonly IFileSystemService _fileSystemService;
        private readonly ILogger<FileBrowserController> _logger;

        public FileBrowserController(IFileSystemService fileSystemService, ILogger<FileBrowserController> logger)
        {
            _fileSystemService = fileSystemService ?? throw new ArgumentNullException(nameof(fileSystemService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Browse a directory
        /// </summary>
        /// <param name="path">Directory path to browse</param>
        /// <returns>Directory information</returns>
        [HttpGet("browse")]
        [ProducesResponseType(typeof(Contracts.Models.DirectoryDetails), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Contracts.Models.DirectoryDetails>> Browse([FromQuery] string? path)
        {
            try
            {
                var domainResult = await _fileSystemService.BrowseDirectoryAsync(path ?? string.Empty);
                
                var contractResult = new Contracts.Models.DirectoryDetails
                {
                    Path = domainResult.Path,
                    Items = domainResult.Items.Select(item => new Contracts.Models.FileSystemItem
                    {
                        Name = item.Name,
                        Path = item.Path,
                        IsDirectory = item is Domain.Entities.DirectoryItem,
                        Size = item.Size,
                        LastModified = item.LastModified,
                        Extension = item is Domain.Entities.FileItem fileItem ? fileItem.Extension : null
                    }).ToList(),
                    FileCount = domainResult.FileCount,
                    DirectoryCount = domainResult.DirectoryCount,
                    TotalSize = domainResult.TotalSize,
                    ParentPath = domainResult.ParentPath,
                    Exists = domainResult.Exists,
                    ErrorMessage = domainResult.ErrorMessage
                };
                
                return Ok(contractResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error browsing directory for path: {Path}", path);
                throw;
            }
        }

        /// <summary>
        /// Search for files and directories
        /// </summary>
        /// <param name="request">Search criteria</param>
        /// <returns>Search results</returns>
        [HttpPost("search")]
        [ProducesResponseType(typeof(List<Contracts.Models.FileSystemItem>), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<List<Contracts.Models.FileSystemItem>>> Search([FromBody] Contracts.Models.SearchRequest request)
        {
            try
            {
                var domainRequest = Domain.Entities.SearchRequest.Create(
                    request.Query,
                    request.Path,
                    request.IncludeSubdirectories,
                    request.SearchInFileNames,
                    request.SearchInFileContents,
                    request.MaxResults
                );

                var domainResults = await _fileSystemService.SearchFilesAsync(domainRequest);
                
                var contractResults = domainResults.Select(item => new Contracts.Models.FileSystemItem
                {
                    Name = item.Name,
                    Path = item.Path,
                    IsDirectory = item is Domain.Entities.DirectoryItem,
                    Size = item.Size,
                    LastModified = item.LastModified,
                    Extension = item is Domain.Entities.FileItem fileItem ? fileItem.Extension : null
                }).ToList();
                
                return Ok(contractResults);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching files with query: {Query}", request?.Query);
                throw;
            }
        }

        /// <summary>
        /// Download a file
        /// </summary>
        /// <param name="path">Path to the file to download</param>
        /// <returns>File stream</returns>
        [HttpGet("download")]
        [ProducesResponseType(typeof(FileStreamResult), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Download([FromQuery] string path)
        {
            try
            {
                var fileStream = await _fileSystemService.DownloadFileAsync(path);
                var fileName = Path.GetFileName(path);
                return File(fileStream, "application/octet-stream", fileName);
            }
            catch (FileNotFoundException)
            {
                return NotFound(new { error = "File not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading file: {Path}", path);
                throw;
            }
        }

        /// <summary>
        /// Upload a file
        /// </summary>
        /// <param name="file">File to upload</param>
        /// <param name="path">Target directory path</param>
        /// <returns>Upload result</returns>
        [HttpPost("upload")]
        [ProducesResponseType(typeof(Contracts.Models.UploadResponse), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Contracts.Models.UploadResponse>> Upload(IFormFile file, [FromQuery] string? path)
        {
            try
            {
                var domainFile = Domain.Entities.FileUpload.Create(file.FileName, file.Length, file.OpenReadStream());
                var domainResult = await _fileSystemService.UploadFileAsync(domainFile, path ?? string.Empty);
                
                var contractResult = new Contracts.Models.UploadResponse
                {
                    Success = domainResult.Success,
                    Message = domainResult.Message,
                    FilePath = domainResult.FilePath,
                    FileSize = domainResult.FileSize
                };
                
                return Ok(contractResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file: {FileName}", file?.FileName);
                throw;
            }
        }

        /// <summary>
        /// Get home directory information
        /// </summary>
        /// <returns>Home directory information</returns>
        [HttpGet("home")]
        [ProducesResponseType(typeof(Contracts.Models.HomeDirectoryResponse), 200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Contracts.Models.HomeDirectoryResponse>> GetHomeDirectory()
        {
            try
            {
                var domainResult = await _fileSystemService.GetHomeDirectoryAsync();
                
                var contractResult = new Contracts.Models.HomeDirectoryResponse
                {
                    Path = domainResult.Path,
                    Exists = domainResult.Exists,
                    ErrorMessage = domainResult.ErrorMessage
                };
                
                return Ok(contractResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting home directory");
                throw;
            }
        }

        /// <summary>
        /// Create a new directory
        /// </summary>
        /// <param name="request">Directory creation request</param>
        /// <returns>Creation result</returns>
        [HttpPost("create-directory")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> CreateDirectory([FromBody] Contracts.Models.CreateDirectoryRequest request)
        {
            try
            {
                var directoryPath = string.IsNullOrEmpty(request.ParentPath) 
                    ? request.Name 
                    : Path.Combine(request.ParentPath, request.Name).Replace('\\', '/');
                
                await _fileSystemService.CreateDirectoryAsync(directoryPath);
                
                return Ok(new { message = "Directory created successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating directory: {Name}", request?.Name);
                throw;
            }
        }

        /// <summary>
        /// Move a file or directory
        /// </summary>
        /// <param name="request">Move request</param>
        /// <returns>Move result</returns>
        [HttpPost("move")]
        [ProducesResponseType(200)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> Move([FromBody] Contracts.Models.MoveRequest request)
        {
            try
            {
                await _fileSystemService.MoveAsync(request.SourcePath, request.DestinationPath);
                
                return Ok(new { message = "Item moved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error moving item from {SourcePath} to {DestinationPath}", request?.SourcePath, request?.DestinationPath);
                throw;
            }
        }

        /// <summary>
        /// Delete a file or directory
        /// </summary>
        /// <param name="path">Path to the item to delete</param>
        /// <returns>Delete result</returns>
        [HttpDelete("delete")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> Delete([FromQuery] string path)
        {
            try
            {
                await _fileSystemService.DeleteAsync(path);
                
                return Ok(new { message = "Item deleted successfully" });
            }
            catch (FileNotFoundException)
            {
                return NotFound(new { error = "Item not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting item: {Path}", path);
                throw;
            }
        }
    }
}
