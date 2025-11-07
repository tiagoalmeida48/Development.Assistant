using Development.Assistant;
using Development.Assistant.Back.Domain.Services;
using Development.Assistant.Back.Models;
using Development.Assistant.Back.Repository;
using Development.Assistant.Back.Services;
using Development.Assistant.Back.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerUI;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Default");

var dirPath = AppDomain.CurrentDomain.BaseDirectory;
var finalPath = Path.Combine(dirPath, "Development.Assistant.dll");

TypeMapper.Initialize(finalPath, ["Development.Assistant.Back.Models"], []);

builder.Services.AddScoped<CopyProjectService>();
builder.Services.AddScoped<CompareDatabaseService>();
builder.Services.AddScoped<ScribanCodeGeneratorService>();
builder.Services.AddScoped<AuthService>();
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
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = Constants.JwtConfig.Issuer,
            ValidAudience = Constants.JwtConfig.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Constants.JwtConfig.SecretKey))
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

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseRouting();

app.UseAuthentication();

app.UseAuthorization();

app.UseCors(options => options.AllowAnyHeader().AllowAnyOrigin().AllowAnyMethod());

app.UseDefaultFiles();

app.UseStaticFiles();

app.UseSwagger();

app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "WebApi v1");
    c.DocExpansion(DocExpansion.None);
});

app.MapControllers();

app.MapFallbackToFile("index.html");

app.Run();