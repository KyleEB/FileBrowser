using FileBrowser.Domain.Repositories;
using FileBrowser.Domain.Services;
using FileBrowser.Infrastructure.Repositories;
using FileBrowser.Infrastructure.Services;
using Microsoft.AspNetCore.Http.Features;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register Infrastructure services
builder.Services.AddScoped<IFileSystemRepository, FileSystemRepository>();
builder.Services.AddScoped<IFileSystemService, FileSystemService>();

// Configure file upload size limit
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = int.MaxValue;
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = long.MaxValue;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
// Enable Swagger in both Development and Production
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

// Map API routes
app.MapControllers();

app.Run();
