using Moq;
using FluentAssertions;
using Xunit;
using FileBrowser.Infrastructure.Services;
using FileBrowser.Domain.Repositories;
using FileBrowser.Domain.Entities;

namespace FileBrowser.Infrastructure.UnitTests.Services
{
    public class FileSystemServiceTests
    {
        private readonly Mock<IFileSystemRepository> _mockRepository;
        private readonly FileSystemService _service;

        public FileSystemServiceTests()
        {
            _mockRepository = new Mock<IFileSystemRepository>();
            _service = new FileSystemService(_mockRepository.Object);
        }

        [Fact]
        public async Task BrowseDirectoryAsync_WithValidPath_ReturnsDirectoryDetails()
        {
            // Arrange
            var path = "/test/path";
            var testItem = FileItem.Create("test.txt", "/test/path/test.txt", 1024);
            var expectedResult = DirectoryDetails.CreateExisting(path, new List<FileSystemItem> { testItem }, "/test");

            _mockRepository
                .Setup(x => x.GetDirectoryInfoAsync(path))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _service.BrowseDirectoryAsync(path);

            // Assert
            result.Should().BeEquivalentTo(expectedResult);
            _mockRepository.Verify(x => x.GetDirectoryInfoAsync(path), Times.Once);
        }

        [Fact]
        public async Task SearchFilesAsync_WithValidRequest_ReturnsFileSystemItems()
        {
            // Arrange
            var searchRequest = Domain.Entities.SearchRequest.Create(
                "test",
                "/test/path",
                true,
                true,
                false,
                10
            );

            var expectedResults = new List<FileSystemItem>
            {
                FileItem.Create("test.txt", "/test/path/test.txt", 1024)
            };

            _mockRepository
                .Setup(x => x.SearchAsync(searchRequest))
                .ReturnsAsync(expectedResults);

            // Act
            var result = await _service.SearchFilesAsync(searchRequest);

            // Assert
            result.Should().BeEquivalentTo(expectedResults);
            _mockRepository.Verify(x => x.SearchAsync(searchRequest), Times.Once);
        }

        [Fact]
        public async Task DownloadFileAsync_WithValidPath_ReturnsFileStream()
        {
            // Arrange
            var filePath = "/test/path/file.txt";
            var expectedStream = new MemoryStream();

            _mockRepository
                .Setup(x => x.GetFileStreamAsync(filePath))
                .ReturnsAsync(expectedStream);

            // Act
            var result = await _service.DownloadFileAsync(filePath);

            // Assert
            result.Should().BeSameAs(expectedStream);
            _mockRepository.Verify(x => x.GetFileStreamAsync(filePath), Times.Once);
        }

        [Fact]
        public async Task UploadFileAsync_WithValidFile_ReturnsSuccessResult()
        {
            // Arrange
            var fileName = "test.txt";
            var fileLength = 1024L;
            var targetPath = "/test/path";
            var fileStream = new MemoryStream();
            var fileUpload = FileUpload.Create(fileName, fileLength, fileStream);

            _mockRepository
                .Setup(x => x.UploadFileAsync(It.IsAny<string>(), fileStream))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.UploadFileAsync(fileUpload, targetPath);

            // Assert
            result.Success.Should().BeTrue();
            result.FilePath.Should().Be("/test/path/test.txt");
            result.FileSize.Should().Be(fileLength);
            result.Message.Should().Be("File uploaded successfully");
            _mockRepository.Verify(x => x.UploadFileAsync("/test/path/test.txt", fileStream), Times.Once);
        }

        [Fact]
        public async Task UploadFileAsync_WhenRepositoryThrowsException_ReturnsFailureResult()
        {
            // Arrange
            var fileName = "test.txt";
            var fileLength = 1024L;
            var targetPath = "/test/path";
            var fileStream = new MemoryStream();
            var fileUpload = FileUpload.Create(fileName, fileLength, fileStream);
            var exceptionMessage = "Upload failed";

            _mockRepository
                .Setup(x => x.UploadFileAsync(It.IsAny<string>(), fileStream))
                .ThrowsAsync(new Exception(exceptionMessage));

            // Act
            var result = await _service.UploadFileAsync(fileUpload, targetPath);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Be(exceptionMessage);
            result.FilePath.Should().BeNull();
            result.FileSize.Should().BeNull();
        }

        [Fact]
        public async Task GetHomeDirectoryAsync_ReturnsHomeDirectoryResult()
        {
            // Arrange
            var homeDirectory = "/home/user";
            var exists = Directory.Exists(homeDirectory);
            var errorMessage = exists ? null : "Home directory does not exist";

            _mockRepository
                .Setup(x => x.GetHomeDirectory())
                .Returns(homeDirectory);

            // Act
            var result = await _service.GetHomeDirectoryAsync();

            // Assert
            result.Path.Should().Be(homeDirectory);
            result.Exists.Should().Be(exists);
            result.ErrorMessage.Should().Be(errorMessage);
            _mockRepository.Verify(x => x.GetHomeDirectory(), Times.Once);
        }

        [Fact]
        public async Task GetHomeDirectoryAsync_WhenDirectoryDoesNotExist_ReturnsCorrectResult()
        {
            // Arrange
            var homeDirectory = "/home/user";
            var exists = false;
            var errorMessage = "Home directory does not exist";

            _mockRepository
                .Setup(x => x.GetHomeDirectory())
                .Returns(homeDirectory);

            // Act
            var result = await _service.GetHomeDirectoryAsync();

            // Assert
            result.Path.Should().Be(homeDirectory);
            result.Exists.Should().Be(exists);
            result.ErrorMessage.Should().Be(errorMessage);
        }

        [Fact]
        public async Task CreateDirectoryAsync_WithValidPath_CallsRepository()
        {
            // Arrange
            var directoryPath = "/test/newdir";

            _mockRepository
                .Setup(x => x.CreateDirectoryAsync(directoryPath))
                .Returns(Task.CompletedTask);

            // Act
            await _service.CreateDirectoryAsync(directoryPath);

            // Assert
            _mockRepository.Verify(x => x.CreateDirectoryAsync(directoryPath), Times.Once);
        }

        [Fact]
        public async Task MoveAsync_WithValidPaths_CallsRepository()
        {
            // Arrange
            var sourcePath = "/test/source";
            var destinationPath = "/test/destination";

            _mockRepository
                .Setup(x => x.MoveAsync(sourcePath, destinationPath))
                .Returns(Task.CompletedTask);

            // Act
            await _service.MoveAsync(sourcePath, destinationPath);

            // Assert
            _mockRepository.Verify(x => x.MoveAsync(sourcePath, destinationPath), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_WithValidPath_CallsRepository()
        {
            // Arrange
            var path = "/test/path/file.txt";

            _mockRepository
                .Setup(x => x.DeleteAsync(path))
                .Returns(Task.CompletedTask);

            // Act
            await _service.DeleteAsync(path);

            // Assert
            _mockRepository.Verify(x => x.DeleteAsync(path), Times.Once);
        }

        [Fact]
        public void Constructor_WithNullRepository_ThrowsArgumentNullException()
        {
            // Arrange & Act
            var action = () => new FileSystemService(null!);

            // Assert
            action.Should().Throw<ArgumentNullException>()
                .WithParameterName("repository");
        }
    }
}
