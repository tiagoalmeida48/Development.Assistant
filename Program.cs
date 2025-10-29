using Development.Assistant.Back.Domain.Services;
using Development.Assistant.Back.Services;
using Microsoft.Extensions.FileProviders;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerUI;

var builder = WebApplication.CreateBuilder(args);

// Configurar WebRoot explicitamente
builder.Environment.WebRootPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");

builder.Services.AddScoped<CopyProjectService>();
builder.Services.AddScoped<CompareDatabaseService>();
builder.Services.AddScoped<ScribanCodeGeneratorService>();
builder.Services.AddScoped<BaseRepository>();

builder.Services.AddControllers();

builder.Services.AddCors();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Development Assistent", Version = "v1" });
});

var app = builder.Build();

app.UseCors(options => options.AllowAnyHeader().AllowAnyOrigin().AllowAnyMethod());

var wwwrootPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
var fileProvider = new PhysicalFileProvider(wwwrootPath);

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = fileProvider
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = fileProvider,
    ServeUnknownFileTypes = false
});

app.UseRouting();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "WebApi v1");
    c.DocExpansion(DocExpansion.None);
});

app.MapControllers();

app.MapFallbackToFile("index.html");

app.Run();
