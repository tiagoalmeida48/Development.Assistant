using Development.Assistant.Back.Domain.Interfaces.Repository;
using Development.Assistant.Back.Domain.Interfaces.Services;
using Development.Assistant.Back.Domain.Services;
using Development.Assistant.Back.GraphQL;
using Development.Assistant.Back.Infra.Repository;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<ICopyProjectService, CopyProjectService>();
builder.Services.AddScoped<ICompareDatabaseService, CompareDatabaseService>();
builder.Services.AddScoped<IScribanCodeGeneratorService, ScribanCodeGeneratorService>(); 
builder.Services.AddScoped<IBaseRepository, BaseRepository>();

builder.Services.AddCors();

builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>();

var app = builder.Build();

app.UseCors();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

app.MapGraphQL();

app.MapFallbackToFile("index.html");

app.Run();
