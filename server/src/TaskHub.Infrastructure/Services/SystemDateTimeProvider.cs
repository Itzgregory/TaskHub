using TaskHub.Application.Common.Interfaces.Services;

namespace TaskHub.Infrastructure.Services;

public class SystemDateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}