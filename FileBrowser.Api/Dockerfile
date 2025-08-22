FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Install wget for healthcheck
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the entire solution
COPY . .

# Build and publish the API project
WORKDIR "/src/FileBrowser.Api"
RUN dotnet publish "FileBrowser.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app

# Create directory for file browser home
RUN mkdir -p /app/files

# Copy the published application
COPY --from=build /app/publish .

# List files to debug
RUN ls -la

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production
ENV FileBrowser__HomeDirectory=/app/files

ENTRYPOINT ["dotnet", "FileBrowser.Api.dll"]
