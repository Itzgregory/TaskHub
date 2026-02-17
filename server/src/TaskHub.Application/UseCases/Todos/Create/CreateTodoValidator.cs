using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Todos.Create;

public static class CreateTodoValidator
{
    public static void Validate(CreateTodoCommand command)
    {
        var errors = new Dictionary<string, string[]>();

        if (command.OrgId == Guid.Empty)
        {
            errors["orgId"] = new[] { "Organisation ID is required." };
        }

        if (string.IsNullOrWhiteSpace(command.Title))
        {
            errors["title"] = new[] { "Title is required." };
        }

        if (errors.Any())
        {
            throw new ValidationException(errors);
        }
    }
}