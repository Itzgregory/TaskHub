namespace TaskHub.Application.Common.Interfaces.Services;

public interface ICorrelationContext
{
    string CorrelationId { get; }
}