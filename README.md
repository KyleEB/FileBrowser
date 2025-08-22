# File Browser

A .NET 8 web application for browsing and searching files and directories, built with Clean Architecture principles.

## Architecture

The solution follows Clean Architecture patterns with the following projects:

### Core Projects

- **FileBrowser.Domain**: Contains domain entities, interfaces, and business rules
- **FileBrowser.Application**: Contains application logic and use cases
- **FileBrowser.Contracts**: Contains API contracts and models for external communication

### Infrastructure Projects

- **FileBrowser.Infrastructure**: Contains implementations of repositories and external concerns
- **FileBrowser.Api**: ASP.NET Core Web API project
- **FileBrowser.Web**: ASP.NET Core web project serving the frontend

### Test Projects

- **Tests/FileBrowser.Domain.Tests**: Unit tests for domain entities and business logic
- **Tests/FileBrowser.Infrastructure.Tests**: Unit tests for infrastructure services using mocked dependencies
- **Tests/FileBrowser.Api.Tests**: Unit tests for API controllers using mocked services

## Project Structure

```
FileBrowser/
├── FileBrowser.Domain/           # Domain entities and interfaces
│   ├── Entities/
│   │   ├── FileSystemItem.cs
│   │   ├── DirectoryInfo.cs
│   │   └── SearchRequest.cs
│   └── Repositories/
│       └── IFileSystemRepository.cs
├── FileBrowser.Application/      # Application logic
├── FileBrowser.Contracts/        # API contracts and models
│   └── Models/
│       ├── FileSystemItem.cs
│       ├── DirectoryInfo.cs
│       ├── SearchRequest.cs
│       ├── UploadResponse.cs
│       └── HomeDirectoryResponse.cs
├── FileBrowser.Infrastructure/   # External concerns and implementations
│   ├── Repositories/
│   │   └── FileSystemRepository.cs
│   └── Services/
│       ├── IFileSystemService.cs
│       └── FileSystemService.cs
├── FileBrowser.Api/              # Web API
│   ├── Controllers/
│   │   ├── FileBrowserController.cs
│   │   └── HealthController.cs
│   └── Program.cs
├── FileBrowser.Web/              # Web frontend
│   └── wwwroot/
│       ├── index.html
│       ├── css/
│       │   └── styles.css
│       └── js/
│           ├── FileBrowser.js
│           └── services/
│               ├── FileSystemService.js
│               ├── UIService.js
│               ├── NavigationService.js
│               └── EventService.js
└── Tests/                        # Unit test projects
    ├── FileBrowser.Domain.Tests/
    │   └── Entities/
    │       ├── FileSystemItemTests.cs
    │       ├── DirectoryInfoTests.cs
    │       └── SearchRequestTests.cs
    ├── FileBrowser.Infrastructure.Tests/
    │   └── Services/
    │       └── FileSystemServiceTests.cs
    └── FileBrowser.Api.Tests/
        └── Controllers/
            └── FileBrowserControllerTests.cs
```

## Frontend Architecture

The frontend follows a service-oriented architecture with clean separation of concerns:

### Services

- **FileSystemService**: Handles all API communication and file system operations
- **UIService**: Manages DOM manipulation and UI-related operations
- **NavigationService**: Handles URL management and deep linking
- **EventService**: Manages all event binding and user interactions

### Main Application

- **FileBrowser**: Orchestrates all services and provides the public API

## Features

- **File Browsing**: Navigate through directories with breadcrumb navigation
- **File Search**: Search for files and directories by name
- **File Upload**: Upload files to any directory
- **File Download**: Download files directly from the browser
- **File Preview**: Preview text files in a modal
- **Deep Linking**: URL state management for shareable links
- **Drag & Drop**: Upload files by dragging and dropping
- **Context Menu**: Right-click context menu for file operations
- **Keyboard Shortcuts**: Quick navigation and search shortcuts
- **Responsive Design**: Works on desktop and mobile devices

## API Endpoints

- `GET /api/filebrowser/browse?path={path}` - Browse directory contents
- `POST /api/filebrowser/search` - Search for files and directories
- `GET /api/filebrowser/download?path={path}` - Download a file
- `POST /api/filebrowser/upload?path={path}` - Upload a file
- `GET /api/filebrowser/home` - Get home directory information
- `GET /health` - Health check endpoint

## Configuration

The application uses the following configuration in `appsettings.json`:

```json
{
  "FileBrowser": {
    "HomeDirectory": "C:\\Users\\YourUsername\\Documents"
  }
}
```

## Development

### Prerequisites

- .NET 8 SDK
- Visual Studio 2022 or later

### Running the Application

1. **Build the solution:**

   ```bash
   dotnet build
   ```

2. **Run the API project:**

   ```bash
   cd FileBrowser.Api
   dotnet run
   ```

3. **Run the Web project:**

   ```bash
   cd FileBrowser.Web
   dotnet run
   ```

4. **Access the application:**
   - Web Interface: http://localhost:5000
   - API Documentation: http://localhost:5001/swagger

### Running Tests

The solution includes comprehensive unit tests using NUnit, Moq for mocking, and Fluent Assertions for readable test assertions.

#### Run All Tests

```bash
dotnet test
```

#### Run Specific Test Projects

```bash
# Domain tests
dotnet test Tests/FileBrowser.Domain.Tests/

# Infrastructure tests
dotnet test Tests/FileBrowser.Infrastructure.Tests/

# API tests
dotnet test Tests/FileBrowser.Api.Tests/
```

#### Run Tests with Coverage

```bash
dotnet test --collect:"XPlat Code Coverage"
```

#### Test Structure

- **Domain Tests**: Test domain entities, business logic, and validation
- **Infrastructure Tests**: Test service implementations with mocked dependencies
- **API Tests**: Test controller actions with mocked services

#### Test Dependencies

- **NUnit**: Testing framework
- **Moq**: Mocking framework for creating test doubles
- **Fluent Assertions**: Readable assertion library for expressive tests

## Docker Support

The application includes Docker support with a simplified single-container setup:

### Quick Start

```bash
docker-compose up --build
```

### Development Mode

```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

### Production Mode

```bash
docker-compose -f docker-compose.yml up --build
```

## Clean Architecture Principles

This project follows Clean Architecture principles:

1. **Dependency Inversion**: High-level modules don't depend on low-level modules
2. **Single Responsibility**: Each class has one reason to change
3. **Open/Closed**: Open for extension, closed for modification
4. **Interface Segregation**: Clients depend only on interfaces they use
5. **Dependency Injection**: Dependencies are injected rather than created

## Frontend Clean Architecture

The frontend JavaScript follows similar principles:

1. **Service Layer**: Business logic is separated into services
2. **Separation of Concerns**: UI, navigation, events, and data access are separated
3. **Dependency Injection**: Services are injected into the main application
4. **Single Responsibility**: Each service has a specific responsibility
5. **Testability**: Services can be easily unit tested

## Testing Strategy

### Unit Testing

- **Domain Layer**: Test entities, value objects, and business rules
- **Infrastructure Layer**: Test service implementations with mocked dependencies
- **API Layer**: Test controller actions with mocked services

### Test Organization

- Tests are organized in a separate `Tests/` folder
- Each test project corresponds to a main project
- Tests use descriptive naming conventions
- Fluent Assertions provide readable test assertions

### Mocking Strategy

- Use Moq for creating test doubles
- Mock external dependencies (repositories, services)
- Test in isolation to ensure unit test independence

## Security Considerations

- Path validation to prevent directory traversal attacks
- File size limits for uploads
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Error handling without exposing sensitive information

## Performance Considerations

- Async/await for all I/O operations
- Efficient file streaming for downloads
- Lazy loading of directory contents
- Optimized search algorithms
- Static file serving for frontend assets
