FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the entire solution
COPY . .

# Build and publish the Web project
WORKDIR "/src/FileBrowser.Web"
RUN dotnet publish "FileBrowser.Web.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app

# Copy the published application
COPY --from=build /app/publish .

# List files to debug
RUN ls -la

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "FileBrowser.Web.dll"]
