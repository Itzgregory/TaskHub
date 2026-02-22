using TaskHub.Api.Middleware;
using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Application.UseCases.Auth.Login;
using TaskHub.Application.UseCases.Auth.Logout;
using TaskHub.Application.UseCases.Auth.Register;
using TaskHub.Application.UseCases.Audit.List;
using TaskHub.Application.UseCases.ImportExport.Export;
using TaskHub.Application.UseCases.ImportExport.Import;
using TaskHub.Application.UseCases.Onboarding.CompleteOnboarding;  
using TaskHub.Application.UseCases.Organisations.AddMember;
using TaskHub.Application.UseCases.Organisations.ChangeRole;
using TaskHub.Application.UseCases.Organisations.Create;
using TaskHub.Application.UseCases.Organisations.ListUserOrgs;    
using TaskHub.Application.UseCases.Organisations.ListMembers;
using TaskHub.Application.UseCases.Organisations.RemoveMember;
using TaskHub.Application.UseCases.Organisations.SetActiveOrg;    
using TaskHub.Application.UseCases.Todos.Archive;
using TaskHub.Application.UseCases.Todos.Create;
using TaskHub.Application.UseCases.Todos.Delete;
using TaskHub.Application.UseCases.Todos.List;
using TaskHub.Application.UseCases.Todos.Restore;
using TaskHub.Application.UseCases.Todos.ToggleStatus;
using TaskHub.Application.UseCases.Todos.Update;
using TaskHub.Infrastructure.BackgroundJobs;
using TaskHub.Infrastructure.Persistence.InMemory;
using TaskHub.Infrastructure.Services;

using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "TaskHub API",
        Version = "v1",
        Description = "Multi-tenant todo platform with RBAC and audit logging"
    });
});

// Add HttpContextAccessor for accessing HttpContext in services
builder.Services.AddHttpContextAccessor();

// Infrastructure services
builder.Services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();
builder.Services.AddSingleton<IDateTimeProvider, SystemDateTimeProvider>();
builder.Services.AddScoped<ICurrentUserContext, CurrentUserContext>();
builder.Services.AddScoped<ICorrelationContext, HttpCorrelationContext>();
builder.Services.AddScoped<IAuditLogger, AuditLogger>();

// InMemory storage (default)
builder.Services.AddSingleton<InMemoryDatabase>();
builder.Services.AddScoped<IUserRepository, InMemoryUserRepository>();
builder.Services.AddScoped<IOrganisationRepository, InMemoryOrganisationRepository>();
builder.Services.AddScoped<IMembershipRepository, InMemoryMembershipRepository>();
builder.Services.AddScoped<ITodoRepository, InMemoryTodoRepository>();
builder.Services.AddScoped<IAuditRepository, InMemoryAuditRepository>();
builder.Services.AddScoped<ISessionRepository, InMemorySessionRepository>();

// Auth handlers
builder.Services.AddScoped<RegisterHandler>();
builder.Services.AddScoped<LoginHandler>();
builder.Services.AddScoped<LogoutHandler>();

// Onboarding handlers
builder.Services.AddScoped<CompleteOnboardingHandler>();

// Todo handlers
builder.Services.AddScoped<CreateTodoHandler>();
builder.Services.AddScoped<UpdateTodoHandler>();
builder.Services.AddScoped<ToggleStatusHandler>();
builder.Services.AddScoped<SoftDeleteTodoHandler>();
builder.Services.AddScoped<HardDeleteTodoHandler>();
builder.Services.AddScoped<RestoreTodoHandler>();
builder.Services.AddScoped<ListTodosHandler>();
builder.Services.AddScoped<ArchiveTodosHandler>();

// Organisation handlers
builder.Services.AddScoped<CreateOrgHandler>();
builder.Services.AddScoped<AddMemberHandler>();
builder.Services.AddScoped<RemoveMemberHandler>();
builder.Services.AddScoped<ChangeRoleHandler>();
builder.Services.AddScoped<ListUserOrgsHandler>();
builder.Services.AddScoped<SetActiveOrgHandler>();
builder.Services.AddScoped<ListMembersHandler>();


// Audit handlers
builder.Services.AddScoped<ListAuditHandler>();

// Import/Export handlers
builder.Services.AddScoped<ExportTodosHandler>();
builder.Services.AddScoped<ImportTodosHandler>();

// Background jobs
builder.Services.Configure<ArchiveOptions>(builder.Configuration.GetSection("Archive"));
builder.Services.AddHostedService<ArchiveJob>();

// CORS configuration : read from app settings
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "TaskHub API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseCors();

// Custom middleware
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<AuthenticationMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.MapControllers();

app.Run();