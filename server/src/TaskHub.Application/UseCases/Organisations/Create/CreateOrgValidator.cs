using TaskHub.Domain.Exceptions;

namespace TaskHub.Application.UseCases.Organisations.Create;

public static class CreateOrgValidator
{
    public static void Validate(CreateOrgCommand command)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(command.Name))
        {
            errors["name"] = new[] { "Organisation name is required." };
        }

        if (errors.Any())
        {
            throw new ValidationException(errors);
        }
    }
}