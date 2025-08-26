# FileBrowser.Infrastructure.UnitTests

This project contains unit tests for the FileBrowser.Infrastructure layer.

## Test Structure

The tests follow the AAA (Arrange, Act, Assert) pattern and use:
- **Xunit** as the testing framework
- **FluentAssertions** for more readable assertions
- **Moq** for mocking dependencies

## Test Categories

### Services
- `FileSystemServiceTests` - Tests for the file system service implementation

### Repositories
- `FileSystemRepositoryTests` - Integration-style tests for the file system repository

## Running Tests

To run the tests, use the following command from the solution root:

```bash
dotnet test tests/FileBrowser.Infrastructure.UnitTests
```

## Test Coverage

The tests cover:
- All service methods
- Repository file system operations
- Success and error scenarios
- File and directory operations
- Constructor parameter validation
- Integration tests with actual file system operations

## Dependencies

- FileBrowser.Infrastructure
- FileBrowser.Domain

## Notes

The `FileSystemRepositoryTests` use temporary directories for integration testing and automatically clean up after each test.
