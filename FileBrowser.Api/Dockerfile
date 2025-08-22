FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Install wget for healthcheck
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["FileBrowser.Api/FileBrowser.Api.csproj", "FileBrowser.Api/"]
COPY ["FileBrowser.Application/FileBrowser.Application.csproj", "FileBrowser.Application/"]
COPY ["FileBrowser.Domain/FileBrowser.Domain.csproj", "FileBrowser.Domain/"]
COPY ["FileBrowser.Infrastructure/FileBrowser.Infrastructure.csproj", "FileBrowser.Infrastructure/"]
COPY ["FileBrowser.Contracts/FileBrowser.Contracts.csproj", "FileBrowser.Contracts/"]

# Restore dependencies
RUN dotnet restore "FileBrowser.Api/FileBrowser.Api.csproj"

# Copy source code
COPY . .

# Build the application
WORKDIR "/src/FileBrowser.Api"
RUN dotnet build "FileBrowser.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FileBrowser.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app

# Create directory for file browser home
RUN mkdir -p /app/files

# Copy the published application
COPY --from=publish /app/publish .

# Copy web frontend files
COPY FileBrowser.Web/wwwroot/ ./wwwroot/

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production
ENV FileBrowser__HomeDirectory=/app/files

ENTRYPOINT ["dotnet", "FileBrowser.Api.dll"]
