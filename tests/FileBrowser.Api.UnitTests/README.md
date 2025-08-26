# FileBrowser.Api.UnitTests

This project contains unit tests for the FileBrowser.Api layer.

## Test Structure

The tests follow the AAA (Arrange, Act, Assert) pattern and use:
- **Xunit** as the testing framework
- **FluentAssertions** for more readable assertions
- **Moq** for mocking dependencies

## Test Categories

### Controllers
- `FileBrowserControllerTests` - Tests for the main file browser API endpoints
- `HealthControllerTests` - Tests for the health check endpoint

## Running Tests

To run the tests, use the following command from the solution root:

```bash
dotnet test FileBrowser.Api.UnitTests
```

## Test Coverage

The tests cover:
- All controller actions
- Success and error scenarios
- Input validation
- Exception handling
- Constructor parameter validation

## Dependencies

- FileBrowser.Api
- FileBrowser.Domain
- FileBrowser.Contracts
