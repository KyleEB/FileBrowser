using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using FluentAssertions;
using Xunit;
using FileBrowser.Infrastructure.Repositories;
using FileBrowser.Domain.Entities;
using System.IO;

namespace FileBrowser.Infrastructure.UnitTests.Repositories
{
    public class FileSystemRepositoryTests : IDisposable
    {
        private readonly string _tempDirectory;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly Mock<ILogger<FileSystemRepository>> _mockLogger;
        private readonly FileSystemRepository _repository;

        public FileSystemRepositoryTests()
        {
            // Arrange
            _tempDirectory = Path.Combine(Path.GetTempPath(), $"FileBrowserTests_{Guid.NewGuid()}");
            Directory.CreateDirectory(_tempDirectory);

            _mockConfiguration = new Mock<IConfiguration>();
            _mockConfiguration
                .Setup(x => x["FileBrowser:HomeDirectory"])
                .Returns(_tempDirectory);

            _mockLogger = new Mock<ILogger<FileSystemRepository>>();
            _repository = new FileSystemRepository(_mockConfiguration.Object, _mockLogger.Object);
        }

        public void Dispose()
        {
            // Cleanup
            if (Directory.Exists(_tempDirectory))
            {
                Directory.Delete(_tempDirectory, recursive: true);
            }
        }

        [Fact]
        public void GetHomeDirectory_ReturnsConfiguredDirectory()
        {
            // Act
            var result = _repository.GetHomeDirectory();

            // Assert
            result.Should().Be(_tempDirectory);
        }

        [Fact]
        public async Task GetDirectoryInfoAsync_WithEmptyPath_ReturnsRootDirectoryInfo()
        {
            // Arrange
            var testFile = Path.Combine(_tempDirectory, "test.txt");
            File.WriteAllText(testFile, "test content");

            var testDir = Path.Combine(_tempDirectory, "testdir");
            Directory.CreateDirectory(testDir);

            // Act
            var result = await _repository.GetDirectoryInfoAsync(string.Empty);

            // Assert
            result.Should().NotBeNull();
            result.Path.Should().Be(string.Empty);
            result.Exists.Should().BeTrue();
            result.Items.Should().Contain(x => x.Name == "test.txt");
            result.Items.Should().Contain(x => x.Name == "testdir");
            result.FileCount.Should().Be(1);
            result.DirectoryCount.Should().Be(1);
        }

        [Fact]
        public async Task GetDirectoryInfoAsync_WithNonExistentPath_ReturnsNonExistentResult()
        {
            // Arrange
            var nonExistentPath = "nonexistent";

            // Act
            var result = await _repository.GetDirectoryInfoAsync(nonExistentPath);

            // Assert
            result.Should().NotBeNull();
            result.Path.Should().Be(nonExistentPath);
            result.Exists.Should().BeFalse();
            result.ErrorMessage.Should().Be("Directory does not exist");
        }

        [Fact]
        public async Task GetDirectoryInfoAsync_WithValidPath_ReturnsDirectoryInfo()
        {
            // Arrange
            var subDir = Path.Combine(_tempDirectory, "subdir");
            Directory.CreateDirectory(subDir);
            var testFile = Path.Combine(subDir, "test.txt");
            File.WriteAllText(testFile, "test content");

            // Act
            var result = await _repository.GetDirectoryInfoAsync("subdir");

            // Assert
            result.Should().NotBeNull();
            result.Path.Should().Be("subdir");
            result.Exists.Should().BeTrue();
            result.Items.Should().ContainSingle(x => x.Name == "test.txt");
            result.FileCount.Should().Be(1);
            result.DirectoryCount.Should().Be(0);
            result.ParentPath.Should().Be(string.Empty);
        }

        [Fact]
        public async Task SearchAsync_WithFileNameSearch_ReturnsMatchingFiles()
        {
            // Arrange
            var testFile1 = Path.Combine(_tempDirectory, "test1.txt");
            var testFile2 = Path.Combine(_tempDirectory, "other.txt");
            File.WriteAllText(testFile1, "content");
            File.WriteAllText(testFile2, "content");

            var searchRequest = Domain.Entities.SearchRequest.Create(
                "test1",
                string.Empty,
                false,
                true,
                false,
                10
            );

            // Act
            var result = await _repository.SearchAsync(searchRequest);

            // Assert
            result.Should().ContainSingle();
            result.First().Name.Should().Be("test1.txt");
        }

        [Fact]
        public async Task SearchAsync_WithContentSearch_ReturnsMatchingFiles()
        {
            // Arrange
            var testFile1 = Path.Combine(_tempDirectory, "test1.txt");
            var testFile2 = Path.Combine(_tempDirectory, "test2.txt");
            File.WriteAllText(testFile1, "searchable content");
            File.WriteAllText(testFile2, "other content");

            var searchRequest = Domain.Entities.SearchRequest.Create(
                "searchable",
                string.Empty,
                false,
                false,
                true,
                10
            );

            // Act
            var result = await _repository.SearchAsync(searchRequest);

            // Assert
            result.Should().ContainSingle();
            result.First().Name.Should().Be("test1.txt");
        }

        [Fact]
        public async Task GetFileStreamAsync_WithValidFile_ReturnsFileStream()
        {
            // Arrange
            var testFile = Path.Combine(_tempDirectory, "test.txt");
            var content = "test content";
            File.WriteAllText(testFile, content);

            // Act
            using var stream = await _repository.GetFileStreamAsync("test.txt");
            using var reader = new StreamReader(stream);
            var result = await reader.ReadToEndAsync();

            // Assert
            result.Should().Be(content);
        }

        [Fact]
        public async Task GetFileStreamAsync_WithNonExistentFile_ThrowsFileNotFoundException()
        {
            // Arrange
            var nonExistentFile = "nonexistent.txt";

            // Act & Assert
            var action = () => _repository.GetFileStreamAsync(nonExistentFile);
            await action.Should().ThrowAsync<FileNotFoundException>();
        }

        [Fact]
        public async Task FileExistsAsync_WithExistingFile_ReturnsTrue()
        {
            // Arrange
            var testFile = Path.Combine(_tempDirectory, "test.txt");
            File.WriteAllText(testFile, "content");

            // Act
            var result = await _repository.FileExistsAsync("test.txt");

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task FileExistsAsync_WithNonExistentFile_ReturnsFalse()
        {
            // Arrange
            var nonExistentFile = "nonexistent.txt";

            // Act
            var result = await _repository.FileExistsAsync(nonExistentFile);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task DirectoryExistsAsync_WithExistingDirectory_ReturnsTrue()
        {
            // Arrange
            var testDir = Path.Combine(_tempDirectory, "testdir");
            Directory.CreateDirectory(testDir);

            // Act
            var result = await _repository.DirectoryExistsAsync("testdir");

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task DirectoryExistsAsync_WithNonExistentDirectory_ReturnsFalse()
        {
            // Arrange
            var nonExistentDir = "nonexistent";

            // Act
            var result = await _repository.DirectoryExistsAsync(nonExistentDir);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task UploadFileAsync_WithValidFile_CreatesFile()
        {
            // Arrange
            var fileName = "uploaded.txt";
            var content = "uploaded content";
            using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(content));

            // Act
            await _repository.UploadFileAsync(fileName, stream);

            // Assert
            var uploadedFile = Path.Combine(_tempDirectory, fileName);
            File.Exists(uploadedFile).Should().BeTrue();
            File.ReadAllText(uploadedFile).Should().Be(content);
        }

        [Fact]
        public async Task UploadFileAsync_WithSubdirectory_CreatesDirectoryAndFile()
        {
            // Arrange
            var fileName = "subdir/uploaded.txt";
            var content = "uploaded content";
            using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(content));

            // Act
            await _repository.UploadFileAsync(fileName, stream);

            // Assert
            var uploadedFile = Path.Combine(_tempDirectory, fileName);
            File.Exists(uploadedFile).Should().BeTrue();
            File.ReadAllText(uploadedFile).Should().Be(content);
        }

        [Fact]
        public async Task CreateDirectoryAsync_WithValidPath_CreatesDirectory()
        {
            // Arrange
            var directoryPath = "newdir";

            // Act
            await _repository.CreateDirectoryAsync(directoryPath);

            // Assert
            var createdDir = Path.Combine(_tempDirectory, directoryPath);
            Directory.Exists(createdDir).Should().BeTrue();
        }

        [Fact]
        public async Task CreateDirectoryAsync_WithExistingDirectory_ThrowsInvalidOperationException()
        {
            // Arrange
            var directoryPath = "existingdir";
            Directory.CreateDirectory(Path.Combine(_tempDirectory, directoryPath));

            // Act & Assert
            var action = () => _repository.CreateDirectoryAsync(directoryPath);
            await action.Should().ThrowAsync<InvalidOperationException>();
        }

        [Fact]
        public async Task MoveAsync_WithValidFile_MovesFile()
        {
            // Arrange
            var sourceFile = Path.Combine(_tempDirectory, "source.txt");
            var content = "source content";
            File.WriteAllText(sourceFile, content);

            // Act
            await _repository.MoveAsync("source.txt", "destination.txt");

            // Assert
            var sourcePath = Path.Combine(_tempDirectory, "source.txt");
            var destPath = Path.Combine(_tempDirectory, "destination.txt");
            File.Exists(sourcePath).Should().BeFalse();
            File.Exists(destPath).Should().BeTrue();
            File.ReadAllText(destPath).Should().Be(content);
        }

        [Fact]
        public async Task MoveAsync_WithNonExistentSource_ThrowsFileNotFoundException()
        {
            // Arrange
            var nonExistentFile = "nonexistent.txt";

            // Act & Assert
            var action = () => _repository.MoveAsync(nonExistentFile, "destination.txt");
            await action.Should().ThrowAsync<FileNotFoundException>();
        }

        [Fact]
        public async Task MoveAsync_WithExistingDestination_ThrowsInvalidOperationException()
        {
            // Arrange
            var sourceFile = Path.Combine(_tempDirectory, "source.txt");
            var destFile = Path.Combine(_tempDirectory, "destination.txt");
            File.WriteAllText(sourceFile, "source content");
            File.WriteAllText(destFile, "dest content");

            // Act & Assert
            var action = () => _repository.MoveAsync("source.txt", "destination.txt");
            await action.Should().ThrowAsync<InvalidOperationException>();
        }

        [Fact]
        public async Task DeleteAsync_WithValidFile_DeletesFile()
        {
            // Arrange
            var testFile = Path.Combine(_tempDirectory, "test.txt");
            File.WriteAllText(testFile, "content");

            // Act
            await _repository.DeleteAsync("test.txt");

            // Assert
            File.Exists(testFile).Should().BeFalse();
        }

        [Fact]
        public async Task DeleteAsync_WithValidDirectory_DeletesDirectory()
        {
            // Arrange
            var testDir = Path.Combine(_tempDirectory, "testdir");
            Directory.CreateDirectory(testDir);
            var testFile = Path.Combine(testDir, "test.txt");
            File.WriteAllText(testFile, "content");

            // Act
            await _repository.DeleteAsync("testdir");

            // Assert
            Directory.Exists(testDir).Should().BeFalse();
        }

        [Fact]
        public async Task DeleteAsync_WithNonExistentPath_ThrowsFileNotFoundException()
        {
            // Arrange
            var nonExistentPath = "nonexistent";

            // Act & Assert
            var action = () => _repository.DeleteAsync(nonExistentPath);
            await action.Should().ThrowAsync<FileNotFoundException>();
        }

        [Fact]
        public void Constructor_WithNullConfiguration_UsesDefaultHomeDirectory()
        {
            // Arrange
            var mockLogger = new Mock<ILogger<FileSystemRepository>>();
            var nullConfiguration = new Mock<IConfiguration>();
            nullConfiguration.Setup(x => x["FileBrowser:HomeDirectory"]).Returns((string?)null);

            // Act
            var repository = new FileSystemRepository(nullConfiguration.Object, mockLogger.Object);

            // Assert
            var homeDir = repository.GetHomeDirectory();
            homeDir.Should().Be(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile));
        }

        [Fact]
        public void Constructor_WithNullLogger_ThrowsArgumentNullException()
        {
            // Arrange
            var mockConfiguration = new Mock<IConfiguration>();

            // Act & Assert
            var action = () => new FileSystemRepository(mockConfiguration.Object, null!);
            action.Should().Throw<ArgumentNullException>()
                .WithParameterName("logger");
        }
    }
}
