# Docker Setup for File Browser

This document explains how to run the File Browser application using Docker.

## Quick Start

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1. **Build and start the application:**

   ```bash
   docker-compose up --build
   ```

2. **Access the application:**

   - Web Interface: http://localhost:8080
   - API Documentation: http://localhost:8080/swagger (development only)

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

## Development Mode

For development with hot reload:

```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

This will:

- Mount source code for live reloading
- Enable Swagger documentation
- Use development environment settings

## Production Mode

For production deployment:

```bash
docker-compose up --build -d
```

This will:

- Run in production mode
- Disable Swagger
- Use optimized builds

## Configuration

### Environment Variables

You can customize the application by setting environment variables:

```bash
# In docker-compose.yml
environment:
  - FileBrowser__HomeDirectory=/app/files
  - ASPNETCORE_ENVIRONMENT=Production
```

### Volumes

The application uses the following volumes:

- `filebrowser-data`: Persistent storage for uploaded files
- `./logs`: Application logs (optional)

### Ports

- `8080`: Main application port (both API and web interface)

## File Storage

Files are stored in a Docker volume named `filebrowser-data`. To access files directly:

```bash
# Find the volume location
docker volume inspect filebrowser_filebrowser-data

# Or mount a local directory instead
volumes:
  - ./my-files:/app/files
```

## Health Checks

The application includes health checks that Docker uses to monitor container status:

```bash
# Check container health
docker ps

# View health check logs
docker inspect filebrowser
```

## Troubleshooting

### View Logs

```bash
# View application logs
docker-compose logs filebrowser

# Follow logs in real-time
docker-compose logs -f filebrowser
```

### Access Container Shell

```bash
# Access the running container
docker exec -it filebrowser /bin/bash
```

### Rebuild from Scratch

```bash
# Remove all containers and images
docker-compose down --rmi all --volumes

# Rebuild everything
docker-compose up --build
```

## Security Considerations

- The application runs as a non-root user inside the container
- File access is restricted to the configured home directory
- CORS is configured to allow all origins (customize for production)
- Health check endpoint is available for monitoring

## Performance

- Static files are served efficiently by ASP.NET Core
- Gzip compression is enabled
- Long-term caching is configured for static assets
- Database connections are pooled (if applicable)

## Scaling

For horizontal scaling, you can run multiple instances:

```bash
docker-compose up --scale filebrowser=3
```

Note: You'll need a load balancer or reverse proxy for proper distribution.
