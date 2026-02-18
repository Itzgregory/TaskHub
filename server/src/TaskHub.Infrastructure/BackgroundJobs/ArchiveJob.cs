using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TaskHub.Application.Common.Interfaces.Persistence;
using TaskHub.Application.Common.Interfaces.Services;
using TaskHub.Domain.Enums;

namespace TaskHub.Infrastructure.BackgroundJobs;

public class ArchiveJob : BackgroundService
{
    private readonly ILogger<ArchiveJob> _logger;
    private readonly ArchiveOptions _options;
    private readonly IServiceProvider _serviceProvider;

    public ArchiveJob(
        ILogger<ArchiveJob> logger,
        IOptions<ArchiveOptions> options,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        _options = options.Value;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Archive job started. Will run every {Interval} minutes, archiving todos completed more than {Days} days ago.",
            _options.JobIntervalMinutes, _options.ArchiveAfterDays);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(TimeSpan.FromMinutes(_options.JobIntervalMinutes), stoppingToken);
                await RunArchiveAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when shutting down
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running archive job");
            }
        }

        _logger.LogInformation("Archive job stopped");
    }

    private async Task RunArchiveAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        
        var todoRepository = scope.ServiceProvider.GetRequiredService<ITodoRepository>();
        var orgRepository = scope.ServiceProvider.GetRequiredService<IOrganisationRepository>();
        var auditRepository = scope.ServiceProvider.GetRequiredService<IAuditRepository>();
        var dateTimeProvider = scope.ServiceProvider.GetRequiredService<IDateTimeProvider>();

        var cutoffDate = dateTimeProvider.UtcNow.AddDays(-_options.ArchiveAfterDays);
        var orgs = await orgRepository.GetAllAsync(cancellationToken);

        var totalArchived = 0;

        foreach (var org in orgs)
        {
            try
            {
                var todosToArchive = await todoRepository.GetCompletedBeforeDateAsync(
                    org.Id,
                    cutoffDate,
                    cancellationToken);

                if (!todosToArchive.Any())
                    continue;

                var todoIds = todosToArchive.Select(t => t.Id).ToList();
                await todoRepository.BulkArchiveAsync(todoIds, dateTimeProvider.UtcNow, cancellationToken);

                // Log audit
                var auditEntry = Domain.Entities.AuditEntry.Create(
                    Guid.Empty, // System action, no specific user
                    org.Id,
                    AuditAction.TodoArchived,
                    EntityType.Todo,
                    Guid.Empty,
                    "system-archive-job",
                    $"Archived {todoIds.Count} todos completed before {cutoffDate:yyyy-MM-dd}");

                await auditRepository.AddAsync(auditEntry, cancellationToken);

                totalArchived += todoIds.Count;

                _logger.LogInformation("Archived {Count} todos for organisation {OrgId}", todoIds.Count, org.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error archiving todos for organisation {OrgId}", org.Id);
            }
        }

        if (totalArchived > 0)
        {
            _logger.LogInformation("Archive job completed. Total archived: {Count}", totalArchived);
        }
    }
}

public class ArchiveOptions
{
    public int ArchiveAfterDays { get; set; } = 90;
    public int JobIntervalMinutes { get; set; } = 1440; // 24 hours
}