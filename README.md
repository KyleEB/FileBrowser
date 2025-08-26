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

#### Option 1: Using Development Scripts (Recommended)

**Windows:**
```bash
.\start-dev.ps1
```

**Linux/Mac:**
```bash
./start-dev.sh
```

#### Option 2: Manual Startup

1. **Build the solution:**

   ```bash
   dotnet build
   ```

2. **Run the API project:**

   ```bash
   cd FileBrowser.Api
   dotnet run
   ```

3. **In a new terminal, run the Web project:**

   ```bash
   cd FileBrowser.Web
   dotnet run
   ```

4. **Access the application:**
   - Web Interface: http://localhost:8080
   - API Documentation: http://localhost:5000/swagger
   - Health Check: http://localhost:5000/health

### Running Tests

The solution includes comprehensive unit tests using NUnit, Moq for mocking, and Fluent Assertions for readable test assertions.

#### Run All Tests

```bash
dotnet test
```

#### Run Specific Test Projects

```bash

# Infrastructure tests
dotnet test Tests/FileBrowser.Infrastructure.Tests/

# API tests
dotnet test Tests/FileBrowser.Api.Tests/
```

## Docker Support

### Services

#### Backend API Service (`filebrowser-api`)

- **Port**: 5000
- **URL**: `http://localhost:5000`
- **Swagger**: `http://localhost:5000/swagger` (development only)
- **Health Check**: `http://localhost:5000/health`
- **API Endpoints**: `http://localhost:5000/api/filebrowser/*`

#### Frontend Web Service (`filebrowser-web`)

- **Port**: 8080
- **URL**: `http://localhost:8080`
- **Serves**: Static HTML, CSS, and JavaScript files

### Running the Application

#### Production Mode

```bash
docker-compose up
```

#### Development Mode (with hot reload)

```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

### Architecture Benefits

1. **Separation of Concerns**: Frontend and backend are completely independent
2. **Scalability**: Each service can be scaled independently
3. **Development**: Easier to develop and debug each service separately
4. **Deployment**: Can deploy frontend and backend to different environments
5. **Technology Flexibility**: Can use different technologies for frontend and backend

### Configuration

#### Frontend Configuration

The frontend configuration is in `FileBrowser.Web/wwwroot/js/config.js`:

- API base URL is configurable for different environments
- Application settings like max file size and supported text extensions

#### Backend Configuration

The backend configuration is in `FileBrowser.Api/appsettings.json`:

- Database connections
- File system settings
- Environment-specific configurations

### API Communication

The frontend communicates with the backend via HTTP requests to `http://localhost:5000/api/filebrowser/*` endpoints.

### Health Checks

The API service includes health checks that verify the service is running properly. The frontend service waits for the API to be healthy before starting.

### Volumes

- `filebrowser-data`: Shared volume for file storage between API restarts
- `./logs`: Host volume for application logs

### Development Workflow

1. **API Changes**: Modify files in `FileBrowser.Api/` - changes are reflected immediately in development mode
2. **Frontend Changes**: Modify files in `FileBrowser.Web/wwwroot/` - changes are reflected immediately in development mode
3. **Configuration Changes**: Modify `docker-compose.yml` or `docker-compose.override.yml` and restart containers

### Troubleshooting

#### Frontend can't connect to API

- Ensure both services are running: `docker-compose ps`
- Check API health: `http://localhost:5000/health`
- Verify CORS settings in the API

#### Port conflicts

- Change ports in `docker-compose.yml` if 5000 or 8080 are already in use
- Update the API URL in `FileBrowser.Web/wwwroot/js/config.js` if you change the API port

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
