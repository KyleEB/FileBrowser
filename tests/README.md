# Tests

This folder contains all unit tests for the FileBrowser project.

## Test Projects

- **FileBrowser.Api.UnitTests** - Tests for the API layer (controllers)
- **FileBrowser.Infrastructure.UnitTests** - Tests for the Infrastructure layer (services and repositories)

## Running All Tests

To run all tests from the solution root:

```bash
dotnet test tests/
```

## Running Specific Test Projects

```bash
# Run only API tests
dotnet test tests/FileBrowser.Api.UnitTests

# Run only Infrastructure tests
dotnet test tests/FileBrowser.Infrastructure.UnitTests
```

## Test Framework

All tests use:
- **Xunit** as the testing framework
- **FluentAssertions** for readable assertions
- **Moq** for mocking dependencies
- **AAA pattern** (Arrange, Act, Assert) with clear comments

## Test Coverage

The tests provide comprehensive coverage of:
- Controller actions and responses
- Service layer business logic
- Repository data access operations
- Error handling and edge cases
- Input validation
- Constructor parameter validation
