var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();

// Serve static files
app.UseStaticFiles();

// Handle SPA routing - serve index.html for any unmatched routes
app.MapFallbackToFile("index.html");

app.Run();
