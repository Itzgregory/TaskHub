using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Todos.Update;

public static class UpdateTodoValidator
{
    public static void Validate(UpdateTodoCommand command)
    {
        var errors = new Dictionary<string, string[]>();

        if (command.Id == Guid.Empty)
        {
            errors["id"] = new[] { "Todo ID is required." };
        }

        if (command.OrgId == Guid.Empty)
        {
            errors["orgId"] = new[] { "Organisation ID is required." };
        }

        if (string.IsNullOrWhiteSpace(command.Title))
        {
            errors["title"] = new[] { "Title is required." };
        }

        if (command.ExpectedVersion < 1)
        {
            errors["expectedVersion"] = new[] { "Version must be at least 1." };
        }

        if (errors.Any())
        {
            throw new ValidationException(errors);
        }
    }
}