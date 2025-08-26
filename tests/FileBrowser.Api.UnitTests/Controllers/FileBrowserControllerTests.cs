using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using FluentAssertions;
using Xunit;
using FileBrowser.Api.Controllers;
using FileBrowser.Domain.Services;
using FileBrowser.Domain.Entities;
using FileBrowser.Contracts.Models;
using DomainEntities = FileBrowser.Domain.Entities;
using ContractModels = FileBrowser.Contracts.Models;

namespace FileBrowser.Api.UnitTests.Controllers
{
    public class FileBrowserControllerTests
    {
        private readonly Mock<IFileSystemService> _mockFileSystemService;
        private readonly Mock<ILogger<FileBrowserController>> _mockLogger;
        private readonly FileBrowserController _controller;

        public FileBrowserControllerTests()
        {
            _mockFileSystemService = new Mock<IFileSystemService>();
            _mockLogger = new Mock<ILogger<FileBrowserController>>();
            _controller = new FileBrowserController(_mockFileSystemService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task Browse_WithValidPath_ReturnsOkResult()
        {
            // Arrange
            var path = "/test/path";
            var testItem = DomainEntities.FileItem.Create("test.txt", "/test/path/test.txt", 1024);
            var domainResult = DomainEntities.DirectoryDetails.CreateExisting(path, new List<DomainEntities.FileSystemItem> { testItem }, "/test");

            _mockFileSystemService
                .Setup(x => x.BrowseDirectoryAsync(path))
                .ReturnsAsync(domainResult);

            // Act
            var result = await _controller.Browse(path);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
            var okResult = result.Result as OkObjectResult;
            okResult!.Value.Should().BeOfType<ContractModels.DirectoryDetails>();
            var contractResult = okResult.Value as ContractModels.DirectoryDetails;
            contractResult!.Path.Should().Be(path);
            contractResult.Items.Should().HaveCount(1);
            contractResult.FileCount.Should().Be(1);
        }

        [Fact]
        public async Task Browse_WithNullPath_ReturnsOkResult()
        {
            // Arrange
            var domainResult = DomainEntities.DirectoryDetails.CreateExisting(string.Empty, new List<DomainEntities.FileSystemItem>());

            _mockFileSystemService
                .Setup(x => x.BrowseDirectoryAsync(string.Empty))
                .ReturnsAsync(domainResult);

            // Act
            var result = await _controller.Browse(null);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task Browse_WhenServiceThrowsException_ThrowsException()
        {
            // Arrange
            var path = "/test/path";
            var exceptionMessage = "Directory not found";
            
            _mockFileSystemService
                .Setup(x => x.BrowseDirectoryAsync(path))
                .ThrowsAsync(new DirectoryNotFoundException(exceptionMessage));

            // Act & Assert
            var action = () => _controller.Browse(path);
            await action.Should().ThrowAsync<DirectoryNotFoundException>();
        }

        [Fact]
        public async Task Search_WithValidRequest_ReturnsOkResult()
        {
            // Arrange
            var searchRequest = new ContractModels.SearchRequest
            {
                Query = "test",
                Path = "/test/path",
                IncludeSubdirectories = true,
                SearchInFileNames = true,
                SearchInFileContents = false,
                MaxResults = 10
            };

            var domainResults = new List<DomainEntities.FileSystemItem>
            {
                DomainEntities.FileItem.Create("test.txt", "/test/path/test.txt", 1024)
            };

            _mockFileSystemService
                .Setup(x => x.SearchFilesAsync(It.IsAny<Domain.Entities.SearchRequest>()))
                .ReturnsAsync(domainResults);

            // Act
            var result = await _controller.Search(searchRequest);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
            var okResult = result.Result as OkObjectResult;
            okResult!.Value.Should().BeOfType<List<Contracts.Models.FileSystemItem>>();
            var contractResults = okResult.Value as List<Contracts.Models.FileSystemItem>;
            contractResults!.Should().HaveCount(1);
        }

        [Fact]
        public async Task Search_WhenServiceThrowsException_ThrowsException()
        {
            // Arrange
            var searchRequest = new ContractModels.SearchRequest
            {
                Query = "test",
                Path = "/test/path"
            };

            var exceptionMessage = "Search failed";
            
            _mockFileSystemService
                .Setup(x => x.SearchFilesAsync(It.IsAny<Domain.Entities.SearchRequest>()))
                .ThrowsAsync(new Exception(exceptionMessage));

            // Act & Assert
            var action = () => _controller.Search(searchRequest);
            await action.Should().ThrowAsync<Exception>();
        }

        [Fact]
        public async Task Download_WithValidPath_ReturnsFileStreamResult()
        {
            // Arrange
            var path = "/test/path/file.txt";
            var fileStream = new MemoryStream();
            
            _mockFileSystemService
                .Setup(x => x.DownloadFileAsync(path))
                .ReturnsAsync(fileStream);

            // Act
            var result = await _controller.Download(path);

            // Assert
            result.Should().BeOfType<FileStreamResult>();
            var fileResult = result as FileStreamResult;
            fileResult!.FileStream.Should().BeSameAs(fileStream);
            fileResult.ContentType.Should().Be("application/octet-stream");
            fileResult.FileDownloadName.Should().Be("file.txt");
        }

        [Fact]
        public async Task Download_WhenFileNotFound_ReturnsNotFound()
        {
            // Arrange
            var path = "/test/path/file.txt";
            
            _mockFileSystemService
                .Setup(x => x.DownloadFileAsync(path))
                .ThrowsAsync(new FileNotFoundException());

            // Act
            var result = await _controller.Download(path);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
            var notFoundResult = result as NotFoundObjectResult;
            notFoundResult!.Value.Should().BeEquivalentTo(new { error = "File not found" });
        }

        [Fact]
        public async Task Upload_WithValidFile_ReturnsOkResult()
        {
            // Arrange
            var fileName = "test.txt";
            var fileLength = 1024L;
            var targetPath = "/test/path";
            var fileStream = new MemoryStream();
            
            var mockFormFile = new Mock<IFormFile>();
            mockFormFile.Setup(x => x.FileName).Returns(fileName);
            mockFormFile.Setup(x => x.Length).Returns(fileLength);
            mockFormFile.Setup(x => x.OpenReadStream()).Returns(fileStream);

            var uploadResult = DomainEntities.UploadResult.CreateSuccess("/test/path/test.txt", fileLength);
            
            _mockFileSystemService
                .Setup(x => x.UploadFileAsync(It.IsAny<FileUpload>(), targetPath))
                .ReturnsAsync(uploadResult);

            // Act
            var result = await _controller.Upload(mockFormFile.Object, targetPath);

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
            var okResult = result.Result as OkObjectResult;
            okResult!.Value.Should().BeOfType<UploadResponse>();
            var uploadResponse = okResult.Value as UploadResponse;
            uploadResponse!.Success.Should().BeTrue();
            uploadResponse.FilePath.Should().Be("/test/path/test.txt");
        }

        [Fact]
        public async Task GetHomeDirectory_ReturnsOkResult()
        {
            // Arrange
            var homeDirectoryResult = DomainEntities.HomeDirectoryResult.Create("/home/user", true, null);
            
            _mockFileSystemService
                .Setup(x => x.GetHomeDirectoryAsync())
                .ReturnsAsync(homeDirectoryResult);

            // Act
            var result = await _controller.GetHomeDirectory();

            // Assert
            result.Result.Should().BeOfType<OkObjectResult>();
            var okResult = result.Result as OkObjectResult;
            okResult!.Value.Should().BeOfType<HomeDirectoryResponse>();
            var homeResponse = okResult.Value as HomeDirectoryResponse;
            homeResponse!.Path.Should().Be("/home/user");
            homeResponse.Exists.Should().BeTrue();
        }

        [Fact]
        public async Task CreateDirectory_WithValidRequest_ReturnsOkResult()
        {
            // Arrange
            var createRequest = new ContractModels.CreateDirectoryRequest
            {
                Name = "newdir",
                ParentPath = "/test/path"
            };

            _mockFileSystemService
                .Setup(x => x.CreateDirectoryAsync(It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.CreateDirectory(createRequest);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().BeEquivalentTo(new { message = "Directory created successfully" });
        }

        [Fact]
        public async Task Move_WithValidRequest_ReturnsOkResult()
        {
            // Arrange
            var moveRequest = new ContractModels.MoveRequest
            {
                SourcePath = "/test/source",
                DestinationPath = "/test/destination"
            };

            _mockFileSystemService
                .Setup(x => x.MoveAsync(moveRequest.SourcePath, moveRequest.DestinationPath))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Move(moveRequest);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().BeEquivalentTo(new { message = "Item moved successfully" });
        }

        [Fact]
        public async Task Delete_WithValidPath_ReturnsOkResult()
        {
            // Arrange
            var path = "/test/path/file.txt";

            _mockFileSystemService
                .Setup(x => x.DeleteAsync(path))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Delete(path);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            var okResult = result as OkObjectResult;
            okResult!.Value.Should().BeEquivalentTo(new { message = "Item deleted successfully" });
        }

        [Fact]
        public async Task Delete_WhenFileNotFound_ReturnsNotFound()
        {
            // Arrange
            var path = "/test/path/file.txt";
            
            _mockFileSystemService
                .Setup(x => x.DeleteAsync(path))
                .ThrowsAsync(new FileNotFoundException());

            // Act
            var result = await _controller.Delete(path);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
            var notFoundResult = result as NotFoundObjectResult;
            notFoundResult!.Value.Should().BeEquivalentTo(new { error = "Item not found" });
        }

        [Fact]
        public void Constructor_WithNullFileSystemService_ThrowsArgumentNullException()
        {
            // Arrange & Act
            var action = () => new FileBrowserController(null!, _mockLogger.Object);

            // Assert
            action.Should().Throw<ArgumentNullException>()
                .WithParameterName("fileSystemService");
        }

        [Fact]
        public void Constructor_WithNullLogger_ThrowsArgumentNullException()
        {
            // Arrange & Act
            var action = () => new FileBrowserController(_mockFileSystemService.Object, null!);

            // Assert
            action.Should().Throw<ArgumentNullException>()
                .WithParameterName("logger");
        }
    }
}
