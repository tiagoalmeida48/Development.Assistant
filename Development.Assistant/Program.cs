using Development.Assistant.Middleware;
using Development.Assistant.Modules.Services;
using Development.Assistant.Modules.Repository;
using Development.Assistant.Modules.Common;
using Development.Assistant.Modules.Common.Http;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerUI;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Default");
Constants.JwtConfig.Configure(builder.Configuration);

var dirPath = AppDomain.CurrentDomain.BaseDirectory;
var finalPath = Path.Combine(dirPath, "Development.Assistant.dll");

TypeMapper.Initialize(finalPath, ["Development.Assistant.Modules.Models"], []);

builder.Services.AddScoped<CopyProjectService>();
builder.Services.AddScoped<CompareDatabaseService>();
builder.Services.AddScoped<ScribanCodeGeneratorService>();
builder.Services.AddScoped<MetadataService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<InputHistoryService>();

builder.Services.AddScoped<BaseRepository>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<MetadataRepository>();
builder.Services.AddScoped<InputHistoryRepository>();

builder.Services.AddTransient(provider =>
{
    var apiContext = new ApiContext(connectionString);
    var httpContextAccessor = provider.GetRequiredService<IHttpContextAccessor>();
    if (httpContextAccessor.HttpContext == null) return apiContext;

    var token = httpContextAccessor.HttpContext.GetToken();
    if (token.IsEmpty()) return apiContext;

    apiContext.User = token.DecodeJwt();
    return apiContext;
});

builder.Services.AddHttpContextAccessor();

builder.Services.AddControllers();

builder.Services.AddCors();

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = Constants.JwtConfig.GetValidationParameters();
        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();
                var errorResponse = new ResultApi<object>
                {
                    Success = false,
                    Message = context.Error ?? "Token inválido ou ausente",
                    InternalError = 401,
                    Result = null
                };

                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsJsonAsync(errorResponse);
            }
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Development Assistant", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});

var app = builder.Build();

app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
    app.UseCors(options => options.AllowAnyHeader().AllowAnyOrigin().AllowAnyMethod());

app.UseRouting();

app.UseAuthentication();

app.UseAuthorization();

app.UseDefaultFiles();

app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "WebApi v1");
        c.DocExpansion(DocExpansion.None);
    });
}

app.MapControllers();

app.MapFallbackToFile("index.html");

app.Run();