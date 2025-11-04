using Development.Assistant;
using Development.Assistant.Back.Domain.Services;
using Development.Assistant.Back.Services;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerUI;

var builder = WebApplication.CreateBuilder(args);

var dirPath = AppDomain.CurrentDomain.BaseDirectory;
var finalPath = Path.Combine(dirPath, "Development.Assistant.dll");

TypeMapper.Initialize(finalPath, ["Development.Assistant.Back.Models"], []);

builder.Services.AddScoped<CopyProjectService>();
builder.Services.AddScoped<CompareDatabaseService>();
builder.Services.AddScoped<ScribanCodeGeneratorService>();
builder.Services.AddScoped<BaseRepository>();

builder.Services.AddControllers();

builder.Services.AddCors();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Development Assistant", Version = "v1" });
});

var app = builder.Build();

app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseCors(options => options.AllowAnyHeader().AllowAnyOrigin().AllowAnyMethod());

app.UseDefaultFiles();

app.UseStaticFiles();

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
