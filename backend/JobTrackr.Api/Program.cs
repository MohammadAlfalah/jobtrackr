using System.Text;
using JobTrackr.Api.Auth;
using JobTrackr.Api.Data;
using JobTrackr.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ---- Database (SQLite — zero setup, a single file on disk) ----
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=jobtrackr.db";
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

// ---- Application services ----
builder.Services.AddScoped<IApplicationService, ApplicationService>();
builder.Services.AddSingleton<JwtTokenService>();

// ---- Authentication (JWT bearer) ----
// Fail fast if the signing key is missing or too weak. The key is NEVER committed
// for production: it comes from the Jwt__Key environment variable (see
// docker-compose.yml) or user-secrets, and from appsettings.Development.json for
// local dev only. A short/empty key would let anyone forge tokens, so refuse to start.
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || System.Text.Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException(
        "Jwt:Key is missing or shorter than 32 bytes. Provide a strong key via the " +
        "Jwt__Key environment variable, user-secrets, or appsettings.Development.json.");
}
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();

// ---- CORS so the React dev server can call the API ----
const string DevCors = "DevCors";
builder.Services.AddCors(options =>
    options.AddPolicy(DevCors, policy => policy
        .WithOrigins(
            builder.Configuration["Cors:FrontendOrigin"] ?? "http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()));

builder.Services.AddControllers()
    // Serialize/deserialize enums as their names ("Applied") rather than integers,
    // so both the JSON API and the React client work with readable status values.
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "JobTrackr API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Paste your JWT here as: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Apply migrations automatically so a fresh clone "just runs".
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors(DevCors);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Exposed so the test project can reference the entry-point assembly if needed.
public partial class Program { }
